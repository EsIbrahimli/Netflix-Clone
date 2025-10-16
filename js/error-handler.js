// Global Error Handling System for Netflix Clone
class ErrorHandler {
    constructor() {
        this.errorCount = 0;
        this.maxErrors = 5;
        this.errorTimeout = 30000; // 30 seconds
        this.setupGlobalErrorHandlers();
        this.setupUnhandledRejectionHandler();
    }

    // Setup global error handlers
    setupGlobalErrorHandlers() {
        // Handle JavaScript errors
        window.addEventListener('error', (event) => {
            this.handleError({
                type: 'javascript',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                error: event.error
            });
        });

        // Handle resource loading errors
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.handleError({
                    type: 'resource',
                    message: `Failed to load ${event.target.tagName}: ${event.target.src || event.target.href}`,
                    element: event.target
                });
            }
        }, true);
    }

    // Setup unhandled promise rejection handler
    setupUnhandledRejectionHandler() {
        window.addEventListener('unhandledrejection', (event) => {
            this.handleError({
                type: 'promise',
                message: event.reason?.message || 'Unhandled promise rejection',
                error: event.reason
            });
            event.preventDefault(); // Prevent default browser behavior
        });
    }

    // Main error handling method
    handleError(errorInfo) {
        this.errorCount++;
        
        // Log error to console in development
        if (process?.env?.NODE_ENV === 'development') {
            console.error('Error Handler:', errorInfo);
        }

        // Log error for analytics/monitoring
        this.logError(errorInfo);

        // Show user-friendly error message if not too many errors
        if (this.errorCount <= this.maxErrors) {
            this.showUserError(errorInfo);
        }

        // Reset error count after timeout
        setTimeout(() => {
            this.errorCount = Math.max(0, this.errorCount - 1);
        }, this.errorTimeout);
    }

    // Log error for monitoring/analytics
    logError(errorInfo) {
        const errorData = {
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            type: errorInfo.type,
            message: errorInfo.message,
            stack: errorInfo.error?.stack,
            ...errorInfo
        };

        // Send to analytics service (if available)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'exception', {
                description: errorInfo.message,
                fatal: false
            });
        }

        // Store in localStorage for debugging
        try {
            const errors = JSON.parse(localStorage.getItem('app_errors') || '[]');
            errors.push(errorData);
            // Keep only last 10 errors
            if (errors.length > 10) {
                errors.splice(0, errors.length - 10);
            }
            localStorage.setItem('app_errors', JSON.stringify(errors));
        } catch (e) {
            console.warn('Could not store error in localStorage:', e);
        }
    }

    // Show user-friendly error message
    showUserError(errorInfo) {
        let message = 'Something went wrong. Please try again.';
        let type = 'error';

        // Customize message based on error type
        switch (errorInfo.type) {
            case 'network':
                message = 'Network connection issue. Please check your internet connection.';
                type = 'warning';
                break;
            case 'api':
                message = 'Unable to load content. Please try again later.';
                break;
            case 'resource':
                message = 'Some content failed to load. The app will continue to work.';
                type = 'warning';
                break;
            case 'javascript':
                message = 'An unexpected error occurred. Please refresh the page.';
                break;
            case 'promise':
                message = 'An operation failed. Please try again.';
                break;
        }

        // Show toast notification if available
        if (typeof showToast === 'function') {
            showToast(message, type);
        } else {
            // Fallback to alert
            console.warn('Error:', message);
        }
    }

    // API error handler
    handleAPIError(error, context = '') {
        const errorInfo = {
            type: 'api',
            message: error.message || 'API request failed',
            status: error.status,
            statusText: error.statusText,
            context: context,
            error: error
        };

        this.handleError(errorInfo);
    }

    // Network error handler
    handleNetworkError(error, context = '') {
        const errorInfo = {
            type: 'network',
            message: error.message || 'Network request failed',
            context: context,
            error: error
        };

        this.handleError(errorInfo);
    }

    // Validation error handler
    handleValidationError(message, field = '') {
        const errorInfo = {
            type: 'validation',
            message: message,
            field: field
        };

        this.handleError(errorInfo);
        
        // Show validation-specific message
        if (typeof showToast === 'function') {
            showToast(message, 'warning');
        }
    }

    // Authentication error handler
    handleAuthError(error) {
        const errorInfo = {
            type: 'auth',
            message: 'Authentication failed',
            error: error
        };

        this.handleError(errorInfo);

        // Redirect to login if not already there
        if (!window.location.pathname.includes('/login')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/pages/client/login/login.html';
        }
    }

    // Clear error history
    clearErrorHistory() {
        localStorage.removeItem('app_errors');
        this.errorCount = 0;
    }

    // Get error history
    getErrorHistory() {
        try {
            return JSON.parse(localStorage.getItem('app_errors') || '[]');
        } catch (e) {
            return [];
        }
    }

    // Check if app is in error state
    isInErrorState() {
        return this.errorCount > this.maxErrors;
    }

    // Reset error state
    resetErrorState() {
        this.errorCount = 0;
    }
}

// API wrapper with error handling
class APIWrapper {
    constructor(baseURL, token) {
        this.baseURL = baseURL;
        this.token = token;
        this.errorHandler = new ErrorHandler();
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && { 'Authorization': `Bearer ${this.token}` })
            }
        };

        const config = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();

        } catch (error) {
            // Handle different types of errors
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                this.errorHandler.handleNetworkError(error, endpoint);
            } else if (error.message.includes('HTTP 401')) {
                this.errorHandler.handleAuthError(error);
            } else {
                this.errorHandler.handleAPIError(error, endpoint);
            }
            
            throw error;
        }
    }

    get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }

    post(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    put(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }
}

// Form validation helper
class FormValidator {
    constructor() {
        this.errorHandler = new ErrorHandler();
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            this.errorHandler.handleValidationError('Please enter a valid email address', 'email');
            return false;
        }
        return true;
    }

    validatePassword(password) {
        if (!password || password.length < 6) {
            this.errorHandler.handleValidationError('Password must be at least 6 characters long', 'password');
            return false;
        }
        return true;
    }

    validateRequired(value, fieldName) {
        if (!value || value.trim() === '') {
            this.errorHandler.handleValidationError(`${fieldName} is required`, fieldName);
            return false;
        }
        return true;
    }

    validateForm(formData, rules) {
        let isValid = true;
        
        for (const [field, rule] of Object.entries(rules)) {
            const value = formData[field];
            
            if (rule.required && !this.validateRequired(value, rule.label)) {
                isValid = false;
            }
            
            if (value && rule.type === 'email' && !this.validateEmail(value)) {
                isValid = false;
            }
            
            if (value && rule.type === 'password' && !this.validatePassword(value)) {
                isValid = false;
            }
            
            if (value && rule.minLength && value.length < rule.minLength) {
                this.errorHandler.handleValidationError(
                    `${rule.label} must be at least ${rule.minLength} characters long`,
                    field
                );
                isValid = false;
            }
        }
        
        return isValid;
    }
}

// Toast notification system
class ToastManager {
    constructor() {
        this.container = null;
        this.toasts = new Map();
        this.createContainer();
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
    }

    show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        const toastId = Date.now() + Math.random();
        
        toast.className = `toast ${type}`;
        toast.dataset.toastId = toastId;
        
        const icon = this.getIcon(type);
        
        toast.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
            <button class="toast-close" onclick="toastManager.hide('${toastId}')">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        this.container.appendChild(toast);
        this.toasts.set(toastId, toast);
        
        // Auto remove
        setTimeout(() => {
            this.hide(toastId);
        }, duration);
        
        return toastId;
    }

    hide(toastId) {
        const toast = this.toasts.get(toastId);
        if (toast) {
            toast.remove();
            this.toasts.delete(toastId);
        }
    }

    hideAll() {
        this.toasts.forEach((toast, id) => {
            this.hide(id);
        });
    }

    getIcon(type) {
        switch (type) {
            case 'success': return 'check-circle';
            case 'error': return 'exclamation-circle';
            case 'warning': return 'exclamation-triangle';
            case 'info':
            default: return 'info-circle';
        }
    }
}

// Initialize global instances
const errorHandler = new ErrorHandler();
const formValidator = new FormValidator();
const toastManager = new ToastManager();

// Global functions for backward compatibility
window.showToast = (message, type = 'info') => toastManager.show(message, type);
window.handleError = (error) => errorHandler.handleError(error);
window.validateForm = (formData, rules) => formValidator.validateForm(formData, rules);

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ErrorHandler,
        APIWrapper,
        FormValidator,
        ToastManager,
        errorHandler,
        formValidator,
        toastManager
    };
}

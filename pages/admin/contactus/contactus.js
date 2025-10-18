const contactTable = document.querySelector('.body-table');
const logoutBtn = document.querySelector('.logout');

const token = localStorage.getItem('token');
const API_BASE = 'https://api.sarkhanrahimli.dev/api/filmalisa';

// Check auth
if (!token) {
    window.location.href = '/pages/admin/login/login.html';
}

// Load contacts on page load
window.addEventListener('DOMContentLoaded', () => {
    loadContacts();
});

// Load all contacts
async function loadContacts() {
    try {
        const response = await fetch(`${API_BASE}/admin/contact`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        console.log('Contacts:', data);
        
        if (data.data && data.data.length > 0) {
            renderContacts(data.data);
        } else {
            contactTable.innerHTML = '<tr><td colspan="6" style="text-align:center">No contacts found</td></tr>';
        }
    } catch (error) {
        console.error('Error loading contacts:', error);
        contactTable.innerHTML = '<tr><td colspan="6" style="text-align:center">Error loading contacts</td></tr>';
    }
}

// Render contacts to table
function renderContacts(contacts) {
    contactTable.innerHTML = '';
    contacts.forEach((contact, index) => {
        const row = document.createElement('tr');
        const reasonText = contact.reason ? (contact.reason.length > 50 ? contact.reason.substring(0, 50) + '...' : contact.reason) : 'No reason';
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${contact.name || 'N/A'}</td>
            <td>${contact.email || 'N/A'}</td>
            <td>${reasonText}</td>
            <td>
                <button class="search-btn" data-name="${contact.name || 'N/A'}" data-email="${contact.email || 'N/A'}" data-reason="${contact.reason || ''}"><i class="fa-solid fa-magnifying-glass"></i></button>
            </td>
            <td>
                <button class="delete-btn" data-id="${contact._id}"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        contactTable.appendChild(row);
    });
    
    // Add event listeners
    document.querySelectorAll('.search-btn').forEach(btn => {
        btn.addEventListener('click', () => viewContact(btn.dataset.name, btn.dataset.email, btn.dataset.reason));
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteContact(btn.dataset.id));
    });
}

// View full contact
function viewContact(name, email, reason) {
    alert(`Contact Details:\n\nName: ${name}\nEmail: ${email}\nReason:\n${reason}`);
}

// Delete contact
async function deleteContact(id) {
    if (!confirm('Are you sure you want to delete this contact message?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/admin/contact/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Contact deleted successfully!');
            loadContacts();
        } else {
            alert('Error deleting contact: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error deleting contact');
    }
}

// Logout
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/pages/admin/login/login.html';
});

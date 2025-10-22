// Account Page JavaScript
const API_BASE = "https://api.sarkhanrahimli.dev/api/filmalisa";
const token = localStorage.getItem("token");

// Check authentication
if (!token) {
  window.location.href = "/pages/client/login/login.html";
}

// DOM Elements
const profileUsername = document.getElementById("profile-username");
const profileEmail = document.getElementById("profile-email");
const profileCreated = document.getElementById("profile-created");
const profilePlan = document.getElementById("profile-plan");
const editProfileBtn = document.getElementById("edit-profile-btn");
const editProfileModal = document.getElementById("edit-profile-modal");
const modalClose = document.getElementById("modal-close");
const cancelEdit = document.getElementById("cancel-edit");
const editProfileForm = document.getElementById("edit-profile-form");
const editUsername = document.getElementById("edit-username");
const editEmail = document.getElementById("edit-email");
const changeAvatarBtn = document.getElementById("change-avatar-btn");
const emailNotifications = document.getElementById("email-notifications");
const autoPlay = document.getElementById("auto-play");
const downloadQuality = document.getElementById("download-quality");
const preferredLanguage = document.getElementById("preferred-language");
const clearHistoryBtn = document.getElementById("clear-history-btn");
const watchHistory = document.getElementById("watch-history");
const moviesWatched = document.getElementById("movies-watched");
const favoritesCount = document.getElementById("favorites-count");
const watchTime = document.getElementById("watch-time");
const daysActive = document.getElementById("days-active");
const deleteAccountBtn = document.getElementById("delete-account-btn");
const toastContainer = document.getElementById("toast-container");

// Global variables
let currentUser = null;
let userPreferences = {};

// Initialize page
document.addEventListener("DOMContentLoaded", () => {
  loadUserProfile();
  loadUserPreferences();
  loadWatchHistory();
  loadUserStatistics();
  setupEventListeners();
  setupNavbarEffects();
});

// Setup navbar scroll effects
function setupNavbarEffects() {
  const navbar = document.querySelector(".navbar");

  // Navbar scroll effect
  window.addEventListener("scroll", () => {
    if (window.scrollY > 100) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  // Profile menu toggle
  const profileMenu = document.querySelector(".profile-menu");
  if (profileMenu) {
    profileMenu.addEventListener("click", () => {
      profileMenu.classList.toggle("active");
    });
  }

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (profileMenu && !profileMenu.contains(e.target)) {
      profileMenu.classList.remove("active");
    }
  });

  // Logout functionality
  const logoutBtn = document.getElementById("logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/index.html";
    });
  }
}

// Setup event listeners
function setupEventListeners() {
  // Edit profile
  editProfileBtn.addEventListener("click", openEditModal);
  modalClose.addEventListener("click", closeEditModal);
  cancelEdit.addEventListener("click", closeEditModal);
  editProfileForm.addEventListener("submit", handleEditProfile);

  // Change avatar
  changeAvatarBtn.addEventListener("click", changeAvatar);

  // Preferences
  emailNotifications.addEventListener("change", savePreferences);
  autoPlay.addEventListener("change", savePreferences);
  downloadQuality.addEventListener("change", savePreferences);
  preferredLanguage.addEventListener("change", savePreferences);

  // Clear history
  clearHistoryBtn.addEventListener("click", clearWatchHistory);

  // Delete account
  deleteAccountBtn.addEventListener("click", deleteAccount);

  // Logout
  document.getElementById("logout").addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/index.html";
  });

  // Profile menu toggle
  const profileMenu = document.querySelector(".profile-menu");
  profileMenu.addEventListener("click", () => {
    profileMenu.classList.toggle("active");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!profileMenu.contains(e.target)) {
      profileMenu.classList.remove("active");
    }
  });

  // Modal close on outside click
  editProfileModal.addEventListener("click", (e) => {
    if (e.target === editProfileModal) {
      closeEditModal();
    }
  });
}

// Load user profile
async function loadUserProfile() {
  try {
    // Try to get user from localStorage first
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      currentUser = JSON.parse(savedUser);
      displayUserProfile(currentUser);
      return;
    }

    // If not in localStorage, try API
    const response = await fetch(`${API_BASE}/user/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      currentUser = data.data;
      localStorage.setItem("user", JSON.stringify(currentUser));
      displayUserProfile(currentUser);
    } else {
      // Fallback to mock data
      createMockUserProfile();
    }
  } catch (error) {
    console.error("Error loading user profile:", error);
    createMockUserProfile();
  }
}

// Create mock user profile
function createMockUserProfile() {
  const mockUser = {
    username: "Demo User",
    email: "demo@filmalisa.com",
    createdAt: new Date().toISOString(),
    avatar: "/assets/icons/profile-img.svg",
  };

  currentUser = mockUser;
  localStorage.setItem("user", JSON.stringify(mockUser));
  displayUserProfile(mockUser);
}

// Display user profile
function displayUserProfile(user) {
  profileUsername.textContent = user.username || "Unknown User";
  profileEmail.textContent = user.email || "No email";

  if (user.createdAt) {
    const createdDate = new Date(user.createdAt);
    profileCreated.textContent = createdDate.toLocaleDateString();
  } else {
    profileCreated.textContent = "Unknown";
  }

  // Update avatar if available
  if (user.avatar) {
    document.getElementById("profile-avatar").src = user.avatar;
  }
}

// Load user preferences
function loadUserPreferences() {
  try {
    const saved = localStorage.getItem("user_preferences");
    if (saved) {
      userPreferences = JSON.parse(saved);
    } else {
      // Default preferences
      userPreferences = {
        emailNotifications: true,
        autoPlay: true,
        downloadQuality: "auto",
        preferredLanguage: "en",
      };
    }

    // Apply preferences to UI
    emailNotifications.checked = userPreferences.emailNotifications;
    autoPlay.checked = userPreferences.autoPlay;
    downloadQuality.value = userPreferences.downloadQuality;
    preferredLanguage.value = userPreferences.preferredLanguage;
  } catch (error) {
    console.error("Error loading preferences:", error);
  }
}

// Save preferences
function savePreferences() {
  userPreferences = {
    emailNotifications: emailNotifications.checked,
    autoPlay: autoPlay.checked,
    downloadQuality: downloadQuality.value,
    preferredLanguage: preferredLanguage.value,
  };

  localStorage.setItem("user_preferences", JSON.stringify(userPreferences));
  showToast("Preferences saved!", "success");
}

// Load watch history
async function loadWatchHistory() {
  try {
    const response = await fetch(`${API_BASE}/user/watch-history`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      displayWatchHistory(data.data || []);
    } else {
      // Mock watch history
      displayMockWatchHistory();
    }
  } catch (error) {
    console.error("Error loading watch history:", error);
    displayMockWatchHistory();
  }
}

// Display watch history
function displayWatchHistory(history) {
  if (history.length === 0) {
    watchHistory.innerHTML = `
            <div class="history-placeholder">
                <i class="fas fa-clock"></i>
                <p>Your watch history will appear here</p>
            </div>
        `;
    return;
  }

  let html = '<div class="history-grid">';
  history.forEach((item) => {
    html += `
            <div class="history-item">
                <img src="${
                  item.movie?.cover || "/assets/icons/title-movie.svg"
                }" alt="${item.movie?.title}">
                <div class="history-info">
                    <h4>${item.movie?.title || "Unknown Movie"}</h4>
                    <p>Watched on ${new Date(
                      item.watchedAt
                    ).toLocaleDateString()}</p>
                </div>
            </div>
        `;
  });
  html += "</div>";

  watchHistory.innerHTML = html;
}

// Display mock watch history
function displayMockWatchHistory() {
  const mockHistory = [
    {
      movie: { title: "Lost in Space", cover: "/assets/icons/title-movie.svg" },
      watchedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      movie: { title: "The Witcher", cover: "/assets/icons/title-movie.svg" },
      watchedAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ];

  displayWatchHistory(mockHistory);
}

// Load user statistics
async function loadUserStatistics() {
  try {
    // Mock statistics for demo
    const stats = {
      moviesWatched: Math.floor(Math.random() * 50) + 10,
      favoritesCount: Math.floor(Math.random() * 20) + 5,
      watchTime: Math.floor(Math.random() * 200) + 50,
      daysActive: Math.floor(Math.random() * 30) + 10,
    };

    moviesWatched.textContent = stats.moviesWatched;
    favoritesCount.textContent = stats.favoritesCount;
    watchTime.textContent = stats.watchTime + "h";
    daysActive.textContent = stats.daysActive;
  } catch (error) {
    console.error("Error loading statistics:", error);
  }
}

// Open edit profile modal
function openEditModal() {
  if (currentUser) {
    editUsername.value = currentUser.username || "";
    editEmail.value = currentUser.email || "";
  }

  editProfileModal.style.display = "block";
  document.body.style.overflow = "hidden";
}

// Close edit profile modal
function closeEditModal() {
  editProfileModal.style.display = "none";
  document.body.style.overflow = "auto";
}

// Handle edit profile form submission
async function handleEditProfile(e) {
  e.preventDefault();

  // Modal inputlar
  const profileImgInput = document.getElementById("edit-profile-img");
  const newProfileImg = profileImgInput.value.trim();
  const newUsername = editUsername.value.trim();
  const newEmail = editEmail.value.trim();
  const newPassword = document.getElementById("edit-password").value.trim();

  // Sadəcə email və username yoxlanılır
  if (!newUsername || !newEmail) {
    showToast("Please fill in all fields", "error");
    return;
  }

  try {
    // User obyektini yenilə
    currentUser.username = newUsername;
    currentUser.email = newEmail;
    if (newProfileImg) {
      currentUser.avatar = newProfileImg;
    }
    if (newPassword) {
      currentUser.password = newPassword;
    }

    // localStorage-a yaz
    localStorage.setItem("user", JSON.stringify(currentUser));

    // Profil məlumatlarını ekrana yaz
    displayUserProfile(currentUser);

    // Modalı bağla
    closeEditModal();

    showToast("Profile updated successfully!", "success");
  } catch (error) {
    console.error("Error updating profile:", error);
    showToast("Error updating profile", "error");
  }
}

// Change avatar
function changeAvatar() {
  // Create file input
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const avatarImg = document.getElementById("profile-avatar");
        avatarImg.src = e.target.result;

        // Update user data
        if (currentUser) {
          currentUser.avatar = e.target.result;
          localStorage.setItem("user", JSON.stringify(currentUser));
        }

        showToast("Avatar updated successfully!", "success");
      };
      reader.readAsDataURL(file);
    }
  });

  fileInput.click();
}

// Clear watch history
async function clearWatchHistory() {
  if (!confirm("Are you sure you want to clear your watch history?")) {
    return;
  }

  try {
    // Clear from localStorage
    localStorage.removeItem("watch_history");

    // Update display
    displayWatchHistory([]);

    showToast("Watch history cleared!", "success");
  } catch (error) {
    console.error("Error clearing watch history:", error);
    showToast("Error clearing watch history", "error");
  }
}

// Delete account
async function deleteAccount() {
  if (
    !confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    )
  ) {
    return;
  }

  const confirmation = prompt('Type "DELETE" to confirm account deletion:');
  if (confirmation !== "DELETE") {
    showToast("Account deletion cancelled", "info");
    return;
  }

  try {
    // Clear all user data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("user_preferences");
    localStorage.removeItem("watch_history");

    showToast("Account deleted successfully", "success");

    // Redirect to home page
    setTimeout(() => {
      window.location.href = "/index.html";
    }, 2000);
  } catch (error) {
    console.error("Error deleting account:", error);
    showToast("Error deleting account", "error");
  }
}

// Show toast notification
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  const icon =
    type === "success"
      ? "check-circle"
      : type === "error"
      ? "exclamation-circle"
      : type === "warning"
      ? "exclamation-triangle"
      : "info-circle";

  toast.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

  toastContainer.appendChild(toast);

  // Auto remove after 3 seconds
  setTimeout(() => {
    if (toast.parentElement) {
      toast.remove();
    }
  }, 3000);
}

// Handle offline/online events
window.addEventListener("online", () => {
  showToast("Connection restored!", "success");
});

window.addEventListener("offline", () => {
  showToast("You are now offline", "warning");
});
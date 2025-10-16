const commentTable = document.querySelector('.body-table');
const logoutBtn = document.querySelector('.logout');

const token = localStorage.getItem('token');
const API_BASE = 'https://api.sarkhanrahimli.dev/api/filmalisa';

// Check auth
if (!token) {
    window.location.href = '/pages/admin/login/login.html';
}

// Load comments on page load
window.addEventListener('DOMContentLoaded', () => {
    loadComments();
});

// Load all comments
async function loadComments() {
    try {
        const response = await fetch(`${API_BASE}/admin/comment`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        console.log('Comments:', data);
        
        if (data.data && data.data.length > 0) {
            renderComments(data.data);
        } else {
            commentTable.innerHTML = '<tr><td colspan="7" style="text-align:center">No comments found</td></tr>';
        }
    } catch (error) {
        console.error('Error loading comments:', error);
        commentTable.innerHTML = '<tr><td colspan="7" style="text-align:center">Error loading comments</td></tr>';
    }
}

// Render comments to table
function renderComments(comments) {
    commentTable.innerHTML = '';
    comments.forEach((comment, index) => {
        const row = document.createElement('tr');
        const userName = comment.user ? comment.user.username : 'Anonymous';
        const userEmail = comment.user ? comment.user.email : 'N/A';
        const movieTitle = comment.movie ? comment.movie.title : 'N/A';
        const commentText = comment.text ? (comment.text.length > 50 ? comment.text.substring(0, 50) + '...' : comment.text) : 'No comment';
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${userName}</td>
            <td>${userEmail}</td>
            <td>${movieTitle}</td>
            <td>${commentText}</td>
            <td>
                <button class="search-btn" data-text="${comment.text || ''}"><i class="fa-solid fa-magnifying-glass"></i></button>
            </td>
            <td>
                <button class="delete-btn" data-id="${comment._id}"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        commentTable.appendChild(row);
    });
    
    // Add event listeners
    document.querySelectorAll('.search-btn').forEach(btn => {
        btn.addEventListener('click', () => viewComment(btn.dataset.text));
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteComment(btn.dataset.id));
    });
}

// View full comment
function viewComment(text) {
    alert('Full Comment:\n\n' + text);
}

// Delete comment
async function deleteComment(id) {
    if (!confirm('Are you sure you want to delete this comment?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/admin/comment/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Comment deleted successfully!');
            loadComments();
        } else {
            alert('Error deleting comment: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error deleting comment');
    }
}

// Logout
logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/pages/admin/login/login.html';
});

// Navigation - Fixed version
document.addEventListener('DOMContentLoaded', function() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all nav links
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            link.classList.add('active');
            
            // Get the section to show
            const sectionId = link.getAttribute('data-section');
            
            // Hide all sections
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Show the selected section
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });

    // Feedback Filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const status = btn.getAttribute('data-status');
            filterFeedback(status);
        });
    });

    // File upload drag and drop
    const uploadArea = document.querySelector('.upload-area');
    if (uploadArea) {
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#1e74ba';
            uploadArea.style.background = '#f0f7ff';
        });
        
        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#ddd';
            uploadArea.style.background = 'white';
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#ddd';
            uploadArea.style.background = 'white';
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                document.getElementById('fileInput').files = files;
                handleFileSelect({ target: { files: files } });
            }
        });
    }

    // Close modal when clicking outside
    const modal = document.getElementById('responseModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target.id === 'responseModal') {
                closeModal();
            }
        });
    }
});

function filterFeedback(status) {
    const feedbackItems = document.querySelectorAll('.feedback-item');
    feedbackItems.forEach(item => {
        const statusBadge = item.querySelector('.status-badge');
        if (status === 'all') {
            item.style.display = 'block';
        } else {
            const itemStatus = statusBadge.classList.contains(`status-${status}`);
            item.style.display = itemStatus ? 'block' : 'none';
        }
    });
}

// Feedback Actions
function respondToFeedback(id) {
    const feedbackItem = document.querySelector(`.feedback-item:nth-child(${id})`);
    const userEmail = feedbackItem.querySelector('.feedback-date').textContent.split(' • ')[1];
    
    document.getElementById('userEmail').value = userEmail;
    document.getElementById('responseModal').style.display = 'block';
}

function markResolved(id) {
    const feedbackItem = document.querySelector(`.feedback-item:nth-child(${id})`);
    const statusBadge = feedbackItem.querySelector('.status-badge');
    
    statusBadge.className = 'status-badge status-resolved';
    statusBadge.textContent = 'Resolved';
    
    // Update actions
    const actionsDiv = feedbackItem.querySelector('.feedback-actions');
    actionsDiv.innerHTML = '<button class="btn btn-secondary" onclick="viewResponse(' + id + ')">View Response</button>';
    
    showNotification('Feedback marked as resolved successfully!', 'success');
}

function viewResponse(id) {
    alert('Response history would be shown here in a real implementation.');
}

function closeModal() {
    document.getElementById('responseModal').style.display = 'none';
    document.getElementById('responseMessage').value = '';
}

function sendResponse(event) {
    event.preventDefault();
    
    const email = document.getElementById('userEmail').value;
    const message = document.getElementById('responseMessage').value;
    
    // Simulate sending response
    setTimeout(() => {
        showNotification('Response sent successfully to ' + email, 'success');
        closeModal();
    }, 1000);
}

// File Upload
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const fileName = file.name;
        const fileSize = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
        
        document.getElementById('fileName').textContent = fileName;
        document.getElementById('fileSize').textContent = 'Size: ' + fileSize;
        document.getElementById('uploadStatus').style.display = 'block';
    }
}

function uploadFile() {
    const fileName = document.getElementById('fileName').textContent;
    
    // Simulate file upload
    showNotification('Uploading ' + fileName + '...', 'info');
    
    setTimeout(() => {
        showNotification('File uploaded successfully! Database updated.', 'success');
        document.getElementById('uploadStatus').style.display = 'none';
        document.getElementById('fileInput').value = '';
        
        // Update database stats
        updateDatabaseStats();
    }, 3000);
}

function updateDatabaseStats() {
    // Simulate database update
    const totalCodesElement = document.querySelector('[style*="color: #1e74ba"]');
    if (totalCodesElement) {
        totalCodesElement.textContent = '21,457'; // Increment by 1
    }
}

// Notifications
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1001;
        animation: slideIn 0.3s ease;
    `;
    
    switch(type) {
        case 'success':
            notification.style.background = '#27ae60';
            break;
        case 'error':
            notification.style.background = '#e74c3c';
            break;
        case 'info':
            notification.style.background = '#1e74ba';
            break;
        default:
            notification.style.background = '#666';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 4000);
}

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);
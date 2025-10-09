
// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function () {
    // Load stats from API
    fetch('/admin/api/stats')
        .then(response => response.json())
        .then(data => {
            document.getElementById('totalUsers').textContent = data.total_users;
            document.getElementById('totalSearches').textContent = data.total_searches;
            document.getElementById('successRate').textContent = data.success_rate + '%';
            document.getElementById('avgRating').textContent = data.avg_rating;
        })
        .catch(error => console.error('Error loading stats:', error));

    // Set up navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            if (this.getAttribute('href') === '#') {
                e.preventDefault();
                const section = this.getAttribute('data-section');

                // Update active nav link
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');

                // Show active section
                document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
                document.getElementById(section).classList.add('active');
            }
        });
    });

    // Set up feedback filters
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterFeedback(this.getAttribute('data-status'));
        });
    });
});

// Feedback functions
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

function respondToFeedback(id, email) {
    document.getElementById('feedbackId').value = id;
    document.getElementById('userEmail').value = email;
    document.getElementById('responseModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('responseModal').style.display = 'none';
    document.getElementById('responseMessage').value = '';
}

function sendResponse(e) {
    e.preventDefault();
    const feedbackId = document.getElementById('feedbackId').value;
    const response = document.getElementById('responseMessage').value;

    fetch('/admin/api/feedback/respond', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            feedback_id: feedbackId,
            response: response
        }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Response sent successfully!');
                closeModal();
                // Update the status badge
                const feedbackItem = document.querySelector(`.feedback-item[data-id="${feedbackId}"]`);
                if (feedbackItem) {
                    const statusBadge = feedbackItem.querySelector('.status-badge');
                    statusBadge.className = 'status-badge status-resolved';
                    statusBadge.textContent = 'Resolved';
                }
            } else {
                alert('Error: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        });
}

function markResolved(id) {
    // Implementation for marking feedback as resolved
    const feedbackItem = document.querySelector(`.feedback-item[data-id="${id}"]`);
    if (feedbackItem) {
        const statusBadge = feedbackItem.querySelector('.status-badge');
        statusBadge.className = 'status-badge status-resolved';
        statusBadge.textContent = 'Resolved';
    }
}

// File upload functions
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        document.getElementById('fileName').textContent = file.name;
        document.getElementById('fileSize').textContent = formatFileSize(file.size);
        document.getElementById('uploadStatus').style.display = 'block';
    }
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
}

function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a file first.');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    fetch('/admin/api/upload-nic', {
        method: 'POST',
        body: formData,
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('File uploaded successfully!');
                document.getElementById('uploadStatus').style.display = 'none';
                fileInput.value = '';
            } else {
                alert('Error: ' + data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred during upload. Please try again.');
        });
}

// Form submission
document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const btn = document.getElementById('loginBtn');
    const btnText = btn.querySelector('.btn-text');
    const btnLoading = btn.querySelector('.btn-loading');

    // Show loading state
    btnText.style.display = 'none';
    btnLoading.style.display = 'block';
    btn.disabled = true;

    const formData = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            showAlert('Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = data.redirect;
            }, 1000);
        } else {
            showAlert(data.message, 'error');
        }

    } catch (error) {
        showAlert('Network error. Please try again.', 'error');
    } finally {
        // Hide loading state
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
        btn.disabled = false;
    }
});

// Show alert function
function showAlert(message, type) {
    const alertContainer = document.getElementById('alert-container');
    alertContainer.innerHTML = `
                <div class="alert alert-${type}">
                    ${message}
                </div>
            `;

    setTimeout(() => {
        alertContainer.innerHTML = '';
    }, 5000);
}

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.password-toggle');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        toggleBtn.textContent = '👁️';
    }
}

// Input validation
document.getElementById('email').addEventListener('blur', function () {
    const email = this.value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email && !emailRegex.test(email)) {
        this.classList.add('error');
    } else {
        this.classList.remove('error');
    }
});

function showForgotPassword() {
    showAlert('Password reset functionality coming soon!', 'success');
}

// Real-time input validation
document.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('input', function () {
        this.classList.remove('error');
    });
});

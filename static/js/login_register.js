document.addEventListener("DOMContentLoaded", () => {
    // Function to show alerts
    window.showAlert = function(message, type) {
        const alertContainer = document.getElementById("alert-container");
        if (!alertContainer) return;
        
        const alertDiv = document.createElement("div");
        alertDiv.className = `alert alert-${type}`;
        alertDiv.textContent = message;
        
        // Clear previous alerts
        alertContainer.innerHTML = "";
        alertContainer.appendChild(alertDiv);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    };

    // Function to toggle password visibility
    window.togglePassword = function(inputId, button) {
        const input = document.getElementById(inputId);
        const icon = button.querySelector("i");
        
        if (input.type === "password") {
            input.type = "text";
            icon.className = "fa-solid fa-eye-slash";
        } else {
            input.type = "password";
            icon.className = "fa-solid fa-eye";
        }
    };

    // ================= LOGIN FORM =================
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const btn = document.getElementById("loginBtn");
            const btnText = btn.querySelector(".btn-text");
            const btnLoading = btn.querySelector(".btn-loading");

            // Show loading state
            btnText.style.display = "none";
            btnLoading.style.display = "block";
            btn.disabled = true;

            const formData = new FormData(loginForm);

            try {
                const response = await fetch("/login", {
                    method: "POST",
                    body: formData
                });

                // Flask returns HTML on success/failure by default.
                if (response.redirected) {
                    window.location.href = response.url;
                } else {
                    const responseText = await response.text();
                    
                    // Check if there's a flash message in the HTML response
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(responseText, "text/html");
                    const flashMessage = doc.querySelector(".alert");
                    
                    if (flashMessage) {
                        showAlert(flashMessage.textContent.trim(), 
                                 flashMessage.classList.contains("alert-success") ? "success" : "error");
                    } else {
                        showAlert("Invalid email or password.", "error");
                    }
                }

            } catch (error) {
                showAlert("Network error. Please try again.", "error");
            } finally {
                // Hide loading state
                btnText.style.display = "inline";
                btnLoading.style.display = "none";
                btn.disabled = false;
            }
        });
    }

    // ================= REGISTER FORM =================
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const btn = document.querySelector("button[type='submit']");
            const btnText = btn.querySelector(".btn-text");
            const btnLoading = btn.querySelector(".btn-loading");

            // Basic validation
            const name = document.getElementById("name").value.trim();
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirmpassword").value;

            if (!name || !email || !password || !confirmPassword) {
                showAlert("All fields are required!", "error");
                return;
            }

            if (password !== confirmPassword) {
                showAlert("Passwords do not match!", "error");
                return;
            }

            // Show loading state
            btnText.style.display = "none";
            btnLoading.style.display = "block";
            btn.disabled = true;

            const formData = new FormData(registerForm);

            try {
                const response = await fetch("/register", {
                    method: "POST",
                    body: formData
                });

                if (response.redirected) {
                    window.location.href = response.url;
                } else {
                    const responseText = await response.text();
                    
                    // Check if there's a flash message in the HTML response
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(responseText, "text/html");
                    const flashMessages = doc.querySelectorAll(".alert");
                    
                    if (flashMessages && flashMessages.length > 0) {
                        // Use the first flash message found
                        const flashMessage = flashMessages[0];
                        showAlert(flashMessage.textContent.trim(), 
                                 flashMessage.classList.contains("alert-success") ? "success" : "error");
                    } else {
                        // Check for specific error elements that might be in the form
                        const errorElements = doc.querySelectorAll(".error-message");
                        let errorFound = false;
                        
                        for (const errorElement of errorElements) {
                            if (errorElement.textContent.trim()) {
                                showAlert(errorElement.textContent.trim(), "error");
                                errorFound = true;
                                break;
                            }
                        }
                        
                        if (!errorFound) {
                            showAlert("Registration failed. Please check your information and try again.", "error");
                        }
                    }
                }
            } catch (error) {
                console.error("Registration error:", error);
                showAlert("Network error. Please try again later.", "error");
            } finally {
                // Reset loading state
                btnText.style.display = "inline";
                btnLoading.style.display = "none";
                btn.disabled = false;
            }
        });
    }
});

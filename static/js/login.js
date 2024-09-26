document.addEventListener('DOMContentLoaded', function () {
    // Back to Top Button
    const upButton = document.getElementById("up-button");
    if (upButton) {
        window.onscroll = function () { scrollFunction() };

        function scrollFunction() {
            if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
                upButton.style.display = "block";
            } else {
                upButton.style.display = "none";
            }
        }

        upButton.addEventListener("click", function (event) {
            event.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            // console.log("Back to top button clicked");
        });
    }

    // Form Navigation
    const showRegisterForm = document.getElementById('show-register-form');
    const showLoginForm = document.getElementById('show-login-form');
    const showForgotPasswordForm = document.getElementById('show-forgot-password-form');
    const showLoginFormFromForgot = document.getElementById('show-login-form-from-forgot');

    if (showRegisterForm) {
        showRegisterForm.addEventListener('click', function (e) {
            e.preventDefault();
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('register-form').style.display = 'block';
            document.getElementById('forgot-password-form').style.display = 'none';
        });
    }

    if (showLoginForm) {
        showLoginForm.addEventListener('click', function (e) {
            e.preventDefault();
            document.getElementById('register-form').style.display = 'none';
            document.getElementById('login-form').style.display = 'block';
            document.getElementById('forgot-password-form').style.display = 'none';
        });
    }

    if (showForgotPasswordForm) {
        showForgotPasswordForm.addEventListener('click', function (e) {
            e.preventDefault();
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('register-form').style.display = 'none';
            document.getElementById('forgot-password-form').style.display = 'block';
        });
    }

    if (showLoginFormFromForgot) {
        showLoginFormFromForgot.addEventListener('click', function (e) {
            e.preventDefault();
            document.getElementById('forgot-password-form').style.display = 'none';
            document.getElementById('login-form').style.display = 'block';
            document.getElementById('register-form').style.display = 'none';
        });
    }

    // Toggle Password Visibility
    const showPasswordCheckbox = document.getElementById('show-password');
    if (showPasswordCheckbox) {
        showPasswordCheckbox.addEventListener('change', function () {
            const passwordField = document.getElementById('register-password');
            const confirmPasswordField = document.getElementById('confirm-password');
            if (this.checked) {
                passwordField.type = 'text';
                confirmPasswordField.type = 'text';
            } else {
                passwordField.type = 'password';
                confirmPasswordField.type = 'password';
            }
        });
    }

    // Password Validation
    const registerForm = document.querySelector('#register-form form');
    if (registerForm) {
        registerForm.addEventListener('submit', function (event) {
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const errorMessage = document.getElementById('password-error');

            const passwordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

            let valid = true;
            let messages = [];

            if (!passwordPattern.test(password)) {
                messages.push('Passwort muss mindestens 8 Zeichen, einen Großbuchstaben, eine Zahl und ein Sonderzeichen enthalten.');
                valid = false;
            }

            if (password !== confirmPassword) {
                messages.push('Passwörter stimmen nicht überein.');
                valid = false;
            }

            if (!valid) {
                errorMessage.style.display = 'block';
                errorMessage.innerHTML = messages.join('<br>');
                event.preventDefault();
                return;
            }

            errorMessage.style.display = 'none';

            // Handle form submission via Fetch API
            const formData = new FormData(registerForm);
            const data = {
                username: formData.get('username'),
                email: formData.get('email'),
                password: formData.get('password'),
                confirm_password: formData.get('confirm_password')
            };

            // Example Fetch request for registration
            /*
            fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                // Handle success (e.g., redirect to login)
                console.log('Success:', data);
                window.location.href = '/login?success=registered';
            })
            .catch((error) => {
                // Handle errors (e.g., display error message)
                console.error('Error:', error);
                errorMessage.style.display = 'block';
                errorMessage.textContent = 'Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.';
            });

            // Prevent default form submission
            event.preventDefault();
            */
        });
    }

    // Handle Login Form Submission via Fetch API
    const loginForm = document.getElementById('login-form')?.querySelector('form');
    if (loginForm) {
        loginForm.addEventListener('submit', function (event) {
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;

            const data = {
                username: username,
                password: password
            };

            // Example Fetch request for login
            /*
            fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Redirect to dashboard or home
                    window.location.href = '/dashboard';
                } else {
                    // Display error message
                    alert('Anmeldung fehlgeschlagen: ' + data.message);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
            });

            // Prevent default form submission
            event.preventDefault();
            */
        });
    }

    // Handle Forgot Password Form Submission via Fetch API
    const forgotPasswordForm = document.getElementById('forgot-password-form')?.querySelector('form');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', function (event) {
            const email = document.getElementById('forgot-email').value;
            const phone = document.getElementById('forgot-phone').value;

            const data = {
                email: email,
                phone: phone
            };

            // Example Fetch request for forgot password
            /*
            fetch('/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Notify user to check their email
                    alert('Ein Link zum Zurücksetzen des Passworts wurde an Ihre E-Mail gesendet.');
                    window.location.href = '/login';
                } else {
                    // Display error message
                    alert('Fehler: ' + data.message);
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
            });

            // Prevent default form submission
            event.preventDefault();
            */
        });
    }
});

document.querySelector('.login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('http://localhost:5000/api/auth/user/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const user = await response.json();
            const userId = user._id;
            sessionStorage.setItem('userId', userId);
            window.location.href = `openhome.html?id=${userId}`;
        } else {
            const errorMessage = await response.json();
            console.error('Login failed:', errorMessage);
            // Display error message to the user
            displayErrorMessage(errorMessage.error || 'Incorrect email or password.');
        }
    } catch (error) {
        console.error('Error during login:', error.message);
        // Display error message to the user
        displayErrorMessage('Error during login. Please try again later.');
    }
});

function displayErrorMessage(message) {
    const errorMessageElement = document.getElementById('error-message');
    errorMessageElement.innerHTML = '<p>' + message + '</p>'; // Display the error message in a paragraph element
    errorMessageElement.style.color = 'red';
}

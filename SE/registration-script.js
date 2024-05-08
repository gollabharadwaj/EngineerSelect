document.getElementById('registration-form').addEventListener('submit', async (event) => {
    event.preventDefault();
  
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
  
    // Simple validation to check if passwords match
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
  
    try {
      const response = await fetch('http://localhost:5000/api/auth/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
      });
  
      if (response.ok) {
        // Registration successful, redirect to login page or handle as needed
        window.location.href = 'login.html';
      } else {
        const errorMessage = await response.json();
        console.error('Registration failed:', errorMessage);
        // Display error message to the user
        displayErrorMessage(errorMessage.error);
      }
    } catch (error) {
      console.error('Error during registration:', error.message);
      // Display error message to the user
      displayErrorMessage('Error during registration. Please try again later.');
    }
});

function displayErrorMessage(message) {
    const errorMessageElement = document.getElementById('error-message');
    errorMessageElement.textContent = message;
    errorMessageElement.style.color = 'red'; // Set text color to red
}
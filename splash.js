// Trigger the fade-out effect, then redirect after the transition ends

setTimeout(function() {
  document.body.classList.add('fade-out'); // Add fade-out class to body

  // Wait for the fade-out transition to complete before redirecting
  setTimeout(function() {
    window.location.href = 'basa.html'; // Redirect to your main page
  }, 500); // Delay matches the CSS transition duration (0.5s)
  
}, 500); // Start fade-out after initial delay (0.5s)
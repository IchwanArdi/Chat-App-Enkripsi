// Add loading indicator for form submissions
document.addEventListener('DOMContentLoaded', function () {
  // Get all forms
  const forms = document.querySelectorAll('form');

  forms.forEach((form) => {
    form.addEventListener('submit', function (e) {
      // Don't add loading to chat form
      if (form.id === 'chat-form') return;

      // Find the submit button
      const submitBtn = this.querySelector('button[type="submit"]');

      if (submitBtn) {
        // Disable button and show loading state
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          `;

        // Add timeout to prevent form from being stuck if there's an issue
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }, 5000);
      }
    });
  });

  // Auto dismiss flash messages after 5 seconds
  const flashMessages = document.querySelectorAll('.bg-red-100, .bg-green-100');
  flashMessages.forEach((message) => {
    setTimeout(() => {
      message.style.transition = 'opacity 1s ease-out';
      message.style.opacity = '0';
      setTimeout(() => {
        message.style.display = 'none';
      }, 1000);
    }, 5000);
  });
});

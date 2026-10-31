/**
 * ==========================================================================
 * CONTACT FORM HANDLER - AJAY ANANDH S
 * Interactive client validation, form submission state, email composer link
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('senderName');
    const emailInput = document.getElementById('senderEmail');
    const subjectInput = document.getElementById('senderSubject');
    const messageInput = document.getElementById('senderMessage');
    const submitBtn = contactForm.querySelector('button[type="submit"]');

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const subject = subjectInput.value.trim() || 'Software Engineering Inquiry';
    const message = messageInput.value.trim();

    // Basic Validation
    if (!name || !email || !message) {
      if (window.showToast) {
        window.showToast("Please fill in all required fields.");
      } else {
        alert("Please fill in all required fields.");
      }
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      if (window.showToast) {
        window.showToast("Please provide a valid email address.");
      } else {
        alert("Please provide a valid email address.");
      }
      return;
    }

    // Loading State
    const originalBtnContent = submitBtn.innerHTML;
    submitBtn.innerHTML = `
      <svg class="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
      </svg>
      <span>Sending Message...</span>
    `;
    submitBtn.disabled = true;

    // Simulate sending / Trigger Email client fallback
    setTimeout(() => {
      const mailtoLink = `mailto:ajayanandh000@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent("From: " + name + " (" + email + ")\n\n" + message)}`;
      
      contactForm.reset();
      submitBtn.innerHTML = originalBtnContent;
      submitBtn.disabled = false;

      if (window.showToast) {
        window.showToast("Thank you, " + name + "! Message prepared for Ajay Anandh S.");
      }

      window.location.href = mailtoLink;
    }, 900);
  });
});

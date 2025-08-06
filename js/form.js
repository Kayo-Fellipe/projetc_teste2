// Contact Form Functionality

// DOM Elements
const contactForm = document.getElementById('contactForm');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const subjectInput = document.getElementById('subject');
const messageInput = document.getElementById('message');

// Form validation
contactForm.addEventListener('submit', function(e) {
  e.preventDefault();

  if (!validateForm()) return;

  const formData = new FormData(contactForm);

  fetch("https://formsubmit.co/ajax/kayofellipefer@gmail.com", {
    method: "POST",
    body: formData,
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(response => {
    if (response.ok) {
      showThankYouModal(nameInput.value.trim());
      contactForm.reset();
    } else {
      alert("Ocorreu um erro. Tente novamente.");
    }
  })
  .catch(error => {
    console.error("Erro ao enviar:", error);
    alert("Erro ao enviar o formulário.");
  });
});

function showThankYouModal(name) {
  const modal = document.getElementById('modal-thankyou');
  const title = document.getElementById('thankYouTitle');

  // Pega apenas os dois primeiros nomes, mantendo a capitalização original
  const trimmedName = name.trim().split(/\s+/).slice(0, 2).join(' ');

  title.textContent = `Obrigado, ${trimmedName}!`;
  modal.classList.remove('hidden');
}

document.getElementById('closeModal').addEventListener('click', () => {
  document.getElementById('modal-thankyou').classList.add('hidden');
});



// Validate form inputs
function validateForm() {
  let isValid = true;
  removeErrors();

  if (nameInput.value.trim() === '') {
    showError(nameInput, 'Por favor, insira seu nome');
    isValid = false;
  }

  if (emailInput.value.trim() === '') {
    showError(emailInput, 'Por favor, insira seu e-mail');
    isValid = false;
  } else if (!isValidEmail(emailInput.value)) {
    showError(emailInput, 'Por favor, insira um e-mail válido');
    isValid = false;
  }

 if (phoneInput.value.trim() === '') {
  showError(phoneInput, 'Por favor, insira seu telefone');
  isValid = false;
  } else if (!isValidPhone(phoneInput.value)) {
    showError(phoneInput, 'Por favor, insira um telefone válido');
    isValid = false;
  }

  if (subjectInput.value.trim() === '') {
    showError(subjectInput, 'Por favor, insira um assunto');
    isValid = false;
  }

  if (messageInput.value.trim() === '') {
    showError(messageInput, 'Por favor, insira sua mensagem');
    isValid = false;
  }

  return isValid;
}

function isValidPhone(phone) {
  const phoneRegex = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/;
  return phoneRegex.test(phone);
}

// Função para formatar o telefone
function formatPhoneNumber(value) {
  // Remove tudo que não for número
  value = value.replace(/\D/g, '');

  // Aplica a máscara
  if (value.length >= 11) {
    return value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
  } else if (value.length >= 10) {
    return value.replace(/^(\d{2})(\d{4})(\d{4}).*/, '($1) $2-$3');
  }
  return value;
}

// Formatar enquanto digita
phoneInput.addEventListener('input', function () {
  this.value = formatPhoneNumber(this.value);
});

// Formatar após preenchimento automático
window.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    phoneInput.value = formatPhoneNumber(phoneInput.value);
  }, 100); // pequeno atraso para garantir que o valor já foi preenchido
});

// Também ao perder o foco
phoneInput.addEventListener('blur', function () {
  this.value = formatPhoneNumber(this.value);
});

// Show error message
function showError(input, message) {
  const formGroup = input.parentElement;
  
  // Create error message element
  const errorMessage = document.createElement('p');
  errorMessage.className = 'error-message';
  errorMessage.textContent = message;
  
  // Add error class to input
  input.classList.add('error-input');
  
  // Add error message to form group
  formGroup.appendChild(errorMessage);
}

// Remove all error messages
function removeErrors() {
  // Remove error messages
  const errorMessages = document.querySelectorAll('.error-message');
  errorMessages.forEach(error => error.remove());
  
  // Remove error class from inputs
  const inputs = [nameInput, emailInput, phoneInput, subjectInput, messageInput];
  inputs.forEach(input => {
    input.classList.remove('error-input');
  });
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Submit form
function submitForm() {
  // Show loading state
  const submitBtn = contactForm.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Sending...';
  submitBtn.disabled = true;
  
  // In a real application, you would send the form data to a server
  // Here we'll simulate a successful submission after a short delay
  
  setTimeout(() => {
    // Reset form
    contactForm.reset();
    
    // Show success message
    showFormMessage('success', 'Your message has been sent successfully!');
    
    // Reset button
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }, 1500);
}

// Show form success/error message
function showFormMessage(type, message) {
  // Create message element
  const messageElement = document.createElement('div');
  messageElement.className = `form-message ${type}`;
  messageElement.textContent = message;
  
  // Add styles for the message
  const messageStyle = document.createElement('style');
  messageStyle.textContent = `
    .form-message {
      padding: 12px;
      margin-bottom: 16px;
      border-radius: 4px;
      text-align: center;
    }
    
    .form-message.success {
      background-color: rgba(16, 185, 129, 0.2);
      color: #10b981;
      border: 1px solid #10b981;
    }
    
    .form-message.error {
      background-color: rgba(239, 68, 68, 0.2);
      color: #ef4444;
      border: 1px solid #ef4444;
    }
    
    .error-message {
      color: #ef4444;
      font-size: 0.85rem;
      margin-top: 4px;
      margin-bottom: 0;
    }
    
    .error-input {
      border-color: #ef4444 !important;
    }
  `;
  document.head.appendChild(messageStyle);
  
  // Add message to form
  contactForm.prepend(messageElement);
  
  // Remove message after 5 seconds
  setTimeout(() => {
    messageElement.remove();
  }, 5000);
}

// Add input event listeners to clear errors on typing
const inputs = [nameInput, emailInput, phoneInput, subjectInput, messageInput];
inputs.forEach(input => {
  input.addEventListener('input', () => {
    // Remove error class
    input.classList.remove('error-input');
    
    // Remove error message if exists
    const errorMessage = input.parentElement.querySelector('.error-message');
    if (errorMessage) {
      errorMessage.remove();
    }
  });
});
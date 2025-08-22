// Testimonial Modal Functionality

// DOM Elements
const addTestimonialBtn = document.getElementById('addTestimonialBtn');
const testimonialModal = document.getElementById('testimonial-modal');
const closeTestimonialModal = document.getElementById('closeTestimonialModal');
const cancelTestimonial = document.getElementById('cancelTestimonial');
const testimonialForm = document.getElementById('testimonialForm');
const photoInput = document.getElementById('testimonial-photo');
const photoPreview = document.getElementById('photo-preview');
const fileUploadPlaceholder = document.querySelector('.file-upload-placeholder');

// Form inputs
const testimonialNameInput = document.getElementById('testimonial-name');
const testimonialServiceInput = document.getElementById('testimonial-service');
const testimonialMessageInput = document.getElementById('testimonial-message');
const testimonialImprovementInput = document.getElementById('testimonial-improvement');

// Open modal
addTestimonialBtn.addEventListener('click', () => {
  testimonialModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
});

// Close modal functions
function closeModal() {
  testimonialModal.classList.add('hidden');
  document.body.style.overflow = 'auto';
  resetForm();
}

closeTestimonialModal.addEventListener('click', closeModal);
cancelTestimonial.addEventListener('click', closeModal);

// Close modal when clicking outside
testimonialModal.addEventListener('click', (e) => {
  if (e.target === testimonialModal) {
    closeModal();
  }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !testimonialModal.classList.contains('hidden')) {
    closeModal();
  }
});

// Photo upload functionality
photoInput.addEventListener('change', function(e) {
  const file = e.target.files[0];
  
  if (file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError(photoInput, 'Por favor, selecione apenas arquivos de imagem');
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError(photoInput, 'A imagem deve ter no máximo 5MB');
      return;
    }
    
    // Show preview
    const reader = new FileReader();
    reader.onload = function(e) {
      photoPreview.src = e.target.result;
      photoPreview.classList.remove('hidden');
      fileUploadPlaceholder.style.display = 'none';
    };
    reader.readAsDataURL(file);
  } else {
    // Reset preview
    photoPreview.classList.add('hidden');
    fileUploadPlaceholder.style.display = 'flex';
  }
});

// Form submission
testimonialForm.addEventListener('submit', function(e) {
  e.preventDefault();
  
  if (!validateTestimonialForm()) {
    return;
  }
  
  const submitBtn = testimonialForm.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  
  // Show loading state
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
  submitBtn.disabled = true;
  
  // Create FormData for file upload
  const formData = new FormData(testimonialForm);
  
  // Submit form using fetch
  fetch(testimonialForm.action, {
    method: 'POST',
    body: formData,
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(response => {
    if (response.ok) {
      showSuccessMessage();
      resetForm();
      closeModal();
    } else {
      throw new Error('Erro no envio');
    }
  })
  .catch(error => {
    console.error('Erro ao enviar:', error);
    showErrorMessage();
  })
  .finally(() => {
    // Reset button
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  });
});

// Form validation
function validateTestimonialForm() {
  let isValid = true;
  removeTestimonialErrors();
  
  // Validate name
  if (testimonialNameInput.value.trim() === '') {
    showError(testimonialNameInput, 'Por favor, insira seu nome');
    isValid = false;
  }
  
  // Validate service
  if (testimonialServiceInput.value === '') {
    showError(testimonialServiceInput, 'Por favor, selecione o serviço realizado');
    isValid = false;
  }
  
  // Validate testimonial message
  if (testimonialMessageInput.value.trim() === '') {
    showError(testimonialMessageInput, 'Por favor, escreva seu depoimento');
    isValid = false;
  } else if (testimonialMessageInput.value.trim().length < 20) {
    showError(testimonialMessageInput, 'O depoimento deve ter pelo menos 20 caracteres');
    isValid = false;
  }
  
  return isValid;
}

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
function removeTestimonialErrors() {
  // Remove error messages
  const errorMessages = testimonialForm.querySelectorAll('.error-message');
  errorMessages.forEach(error => error.remove());
  
  // Remove error class from inputs
  const inputs = [testimonialNameInput, testimonialServiceInput, testimonialMessageInput, photoInput];
  inputs.forEach(input => {
    input.classList.remove('error-input');
  });
}

// Reset form
function resetForm() {
  testimonialForm.reset();
  photoPreview.classList.add('hidden');
  fileUploadPlaceholder.style.display = 'flex';
  removeTestimonialErrors();
}

// Show success message
function showSuccessMessage() {
  // Create success notification
  const notification = document.createElement('div');
  notification.className = 'success-notification';
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas fa-check-circle"></i>
      <span>Depoimento enviado com sucesso! Obrigado pelo seu feedback.</span>
    </div>
  `;
  
  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    .success-notification {
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: var(--color-success);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 100000;
      animation: slideInRight 0.3s ease;
      max-width: 350px;
    }
    
    .notification-content {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .notification-content i {
      font-size: 1.2rem;
      flex-shrink: 0;
    }
    
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  
  document.head.appendChild(style);
  document.body.appendChild(notification);
  
  // Remove notification after 5 seconds
  setTimeout(() => {
    notification.remove();
    style.remove();
  }, 5000);
}

// Show error message
function showErrorMessage() {
  // Create error notification
  const notification = document.createElement('div');
  notification.className = 'error-notification';
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas fa-exclamation-circle"></i>
      <span>Erro ao enviar depoimento. Tente novamente.</span>
    </div>
  `;
  
  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    .error-notification {
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: var(--color-error);
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 100000;
      animation: slideInRight 0.3s ease;
      max-width: 350px;
    }
    
    .notification-content {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .notification-content i {
      font-size: 1.2rem;
      flex-shrink: 0;
    }
  `;
  
  document.head.appendChild(style);
  document.body.appendChild(notification);
  
  // Remove notification after 5 seconds
  setTimeout(() => {
    notification.remove();
    style.remove();
  }, 5000);
}

// Add input event listeners to clear errors on typing
const testimonialInputs = [testimonialNameInput, testimonialServiceInput, testimonialMessageInput];
testimonialInputs.forEach(input => {
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

// Handle photo input error clearing
photoInput.addEventListener('change', () => {
  photoInput.classList.remove('error-input');
  const errorMessage = photoInput.parentElement.querySelector('.error-message');
  if (errorMessage) {
    errorMessage.remove();
  }
});
// Testimonial Modal Functionality with Firebase Integration

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

// Firebase variables
let db, storage;
let firebaseReady = false;
let firebaseFunctions = {};

// Initialize Firebase when ready
function initializeFirebase() {
  if (window.db && window.storage) {
    db = window.db;
    storage = window.storage;
    firebaseReady = true;
    console.log('Firebase ready for testimonials');
    return true;
  }
  return false;
}

// Wait for Firebase to be ready
window.addEventListener('firebaseReady', () => {
  initializeFirebase();
});

// Also check immediately in case Firebase is already ready
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initializeFirebase();
  }, 1000);
});

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

// Upload image to Firebase Storage
async function uploadTestimonialImage(file, testimonialId) {
  try {
    if (!firebaseReady) {
      throw new Error('Firebase não está disponível');
    }
    
    // Import Firebase Storage functions
    const { ref, uploadBytes, getDownloadURL } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js');
    
    // Create a reference to the file location
    const imageRef = ref(storage, `testimonials/${testimonialId}/${file.name}`);
    
    // Upload the file
    const snapshot = await uploadBytes(imageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log('Image uploaded successfully:', downloadURL);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error('Erro ao fazer upload da imagem');
  }
}

// Save testimonial to Firestore (automatically approved)
async function saveTestimonial(testimonialData) {
  try {
    if (!firebaseReady) {
      throw new Error('Firebase não está disponível');
    }
    
    // Import Firebase Firestore functions
    const { addDoc, collection, serverTimestamp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    // Add testimonial to Firestore - automatically approved
    const docRef = await addDoc(collection(db, 'testimonials'), {
      ...testimonialData,
      createdAt: serverTimestamp(),
      approved: true, // Automatically approved
      status: 'approved'
    });
    
    console.log('Testimonial saved to Firebase:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving testimonial:', error);
    throw new Error('Erro ao salvar depoimento no banco de dados');
  }
}

// Update testimonial with photo URL
async function updateTestimonialWithPhoto(testimonialId, photoURL) {
  try {
    if (!firebaseReady) {
      return;
    }
    
    const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    const testimonialRef = doc(db, 'testimonials', testimonialId);
    await updateDoc(testimonialRef, {
      photoURL: photoURL
    });
    
    console.log('Testimonial updated with photo URL');
  } catch (error) {
    console.error('Error updating testimonial with photo:', error);
  }
}

// Form submission with Firebase integration
testimonialForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  
  if (!validateTestimonialForm()) {
    return;
  }
  
  const submitBtn = testimonialForm.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  
  try {
    // Show loading state
    submitBtn.textContent = 'Enviando...';
    submitBtn.disabled = true;
    
    // Check if Firebase is ready
    if (!firebaseReady) {
      throw new Error('Firebase não está disponível. Verifique sua conexão.');
    }
    
    // Prepare testimonial data
    const testimonialData = {
      name: testimonialNameInput.value.trim(),
      service: testimonialServiceInput.value,
      testimonial: testimonialMessageInput.value.trim(),
      photoURL: null
    };
    
    console.log('Saving testimonial:', testimonialData);
    
    // Save testimonial to Firebase
    const testimonialId = await saveTestimonial(testimonialData);
    
    // Upload image if provided
    if (photoInput.files[0]) {
      try {
        const photoURL = await uploadTestimonialImage(photoInput.files[0], testimonialId);
        
        // Update testimonial with photo URL
        await updateTestimonialWithPhoto(testimonialId, photoURL);
        
        // Update local data
        testimonialData.photoURL = photoURL;
      } catch (imageError) {
        console.error('Error uploading image:', imageError);
        // Continue without image - testimonial is still saved
      }
    }
    
    // Show success message
    showSuccessMessage(true);
    
    // Add testimonial to carousel immediately
    addTestimonialToCarousel({
      ...testimonialData,
      id: testimonialId
    });
    
    // Reset form and close modal
    resetForm();
    closeModal();
    
  } catch (error) {
    console.error('Error submitting testimonial:', error);
    showErrorMessage(error.message || 'Erro ao enviar depoimento. Tente novamente.');
  } finally {
    // Reset button
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
});

// Add testimonial to carousel immediately
function addTestimonialToCarousel(testimonialData) {
  try {
    const testimonialsContainer = document.getElementById('testimonials-container');
    if (!testimonialsContainer) return;
    
    // Create new testimonial card
    const newCard = document.createElement('div');
    newCard.className = 'testimonial-card';
    newCard.setAttribute('data-firebase-id', testimonialData.id);
    
    // Get service display name
    const serviceDisplayName = getServiceDisplayName(testimonialData.service);
    
    // Default avatar if no photo provided
    const avatarSrc = testimonialData.photoURL || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
    
    newCard.innerHTML = `
      <div class="testimonial-author">
        <div class="testimonial-avatar">
          <img src="${avatarSrc}" alt="${testimonialData.name}" onerror="this.src='https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'">
        </div>
        <div class="testimonial-author-info">
          <h4>${testimonialData.name}</h4>
          <p>${serviceDisplayName}</p>
        </div>
      </div>
      <div class="testimonial-content">
        <div class="testimonial-text">
          "${testimonialData.testimonial}"
        </div>
      </div>
    `;
    
    // Add to container (at the beginning, after default testimonials)
    testimonialsContainer.appendChild(newCard);
    
    // Refresh testimonial carousel
    if (window.refreshTestimonialCarousel) {
      window.refreshTestimonialCarousel();
    }
    
    console.log('Testimonial added to carousel');
  } catch (error) {
    console.error('Error adding testimonial to carousel:', error);
  }
}

// Get service display name
function getServiceDisplayName(serviceValue) {
  const serviceMap = {
    'filmagem-casamento': 'Filmagem - Casamentos',
    'filmagem-corporativo': 'Filmagem - Corporativo',
    'filmagem-imobiliario': 'Filmagem - Imobiliário',
    'filmagem-publicidade': 'Filmagem - Publicidade',
    'fotografia-ensaios': 'Fotografia - Ensaios',
    'fotografia-casamento': 'Fotografia - Casamentos',
    'fotografia-imoveis': 'Fotografia - Imóveis',
    'fotografia-esportivos': 'Fotografia - Esportivos',
    'edicao-criativa': 'Edição - Criativa',
    'edicao-correcao': 'Edição - Correção',
    'edicao-redes-sociais': 'Edição - Redes Sociais',
    'edicao-trilha': 'Edição - Trilha Sonora'
  };
  
  return serviceMap[serviceValue] || 'Cliente';
}

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
function showSuccessMessage(usedFirebase = true) {
  const message = usedFirebase 
    ? 'Depoimento enviado com sucesso! Já aparece no carrossel de depoimentos.'
    : 'Depoimento enviado com sucesso! Em breve entrarei em contato.';
    
  // Create success notification
  const notification = document.createElement('div');
  notification.className = 'success-notification';
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas fa-check-circle"></i>
      <span>${message}</span>
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
  
  // Remove notification after 6 seconds
  setTimeout(() => {
    notification.remove();
    style.remove();
  }, 6000);
}

// Show error message
function showErrorMessage(message) {
  // Create error notification
  const notification = document.createElement('div');
  notification.className = 'error-notification';
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas fa-exclamation-circle"></i>
      <span>${message}</span>
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
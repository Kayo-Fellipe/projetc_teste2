// Enhanced Testimonials Carousel with Firebase Integration

// DOM Elements
let testimonialCards = document.querySelectorAll('.testimonial-card');
const prevBtn = document.getElementById('prev-testimonial');
const nextBtn = document.getElementById('next-testimonial');
let dots = document.querySelectorAll('.testimonial-dot');

// Set initial slide
let currentSlide = 0;
let slideCount = testimonialCards.length;

// Firebase variables
let db;
let firebaseReady = false;

// Initialize Firebase integration
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Wait for Firebase to be available
    await waitForFirebase();
    
    // Import Firebase functions
    const { collection, query, orderBy, onSnapshot, where } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    db = window.db;
    firebaseReady = true;
    
    // Load testimonials from Firebase
    loadTestimonialsFromFirebase();
    
    console.log('Testimonials Firebase integration ready');
  } catch (error) {
    console.error('Error initializing Firebase for testimonials:', error);
    firebaseReady = false;
    // Continue with default testimonials
    initializeCarousel();
  }
});

// Wait for Firebase to be loaded
function waitForFirebase() {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max wait
    
    const checkFirebase = () => {
      attempts++;
      
      if (window.db) {
        resolve();
      } else if (attempts >= maxAttempts) {
        reject(new Error('Firebase não foi carregado'));
      } else {
        setTimeout(checkFirebase, 100);
      }
    };
    
    checkFirebase();
  });
}

// Load testimonials from Firebase
async function loadTestimonialsFromFirebase() {
  try {
    const { collection, query, orderBy, onSnapshot, where } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    // Query approved testimonials ordered by creation date
    const testimonialsQuery = query(
      collection(db, 'testimonials'),
      where('approved', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    // Listen for real-time updates
    onSnapshot(testimonialsQuery, (snapshot) => {
      const firebaseTestimonials = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        firebaseTestimonials.push({
          id: doc.id,
          ...data
        });
      });
      
      console.log('Loaded testimonials from Firebase:', firebaseTestimonials.length);
      
      // Combine with default testimonials
      combineTestimonials(firebaseTestimonials);
    });
    
  } catch (error) {
    console.error('Error loading testimonials from Firebase:', error);
    initializeCarousel();
  }
}

// Combine Firebase testimonials with default ones
function combineTestimonials(firebaseTestimonials) {
  const testimonialsContainer = document.getElementById('testimonials-container');
  if (!testimonialsContainer) return;
  
  // Keep default testimonials and add Firebase ones
  const defaultTestimonials = testimonialsContainer.innerHTML;
  
  // Add Firebase testimonials
  firebaseTestimonials.forEach(testimonial => {
    const testimonialCard = createTestimonialCard(testimonial);
    testimonialsContainer.appendChild(testimonialCard);
  });
  
  // Refresh carousel
  refreshCarousel();
}

// Create testimonial card element
function createTestimonialCard(testimonial) {
  const card = document.createElement('div');
  card.className = 'testimonial-card';
  card.setAttribute('data-id', testimonial.id);
  
  // Get service display name
  const serviceDisplayName = getServiceDisplayName(testimonial.service);
  
  // Default avatar if no photo provided
  const avatarSrc = testimonial.photoURL || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1';
  
  card.innerHTML = `
    <div class="testimonial-author">
      <div class="testimonial-avatar">
        <img src="${avatarSrc}" alt="${testimonial.name}" onerror="this.src='https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'">
      </div>
      <div class="testimonial-author-info">
        <h4>${testimonial.name}</h4>
        <p>${serviceDisplayName}</p>
      </div>
    </div>
    <div class="testimonial-content">
      <div class="testimonial-text">
        "${testimonial.testimonial}"
      </div>
    </div>
  `;
  
  return card;
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

// Refresh carousel after adding new testimonials
function refreshCarousel() {
  // Update references
  testimonialCards = document.querySelectorAll('.testimonial-card');
  slideCount = testimonialCards.length;
  
  // Update dots
  updateDots();
  
  // Reset to first slide
  currentSlide = 0;
  showSlide(currentSlide);
  
  // Reinitialize carousel
  initializeCarousel();
}

// Global function to refresh carousel (called from testimonial-modal.js)
window.refreshTestimonialCarousel = refreshCarousel;

// Update dots navigation
function updateDots() {
  const dotsContainer = document.getElementById('testimonial-dots');
  if (!dotsContainer) return;
  
  // Clear existing dots
  dotsContainer.innerHTML = '';
  
  // Create new dots
  testimonialCards.forEach((_, index) => {
    const dot = document.createElement('span');
    dot.className = 'testimonial-dot';
    if (index === 0) dot.classList.add('active');
    dot.setAttribute('data-slide', index);
    
    // Add click event
    dot.addEventListener('click', () => {
      currentSlide = index;
      showSlide(currentSlide);
    });
    
    dotsContainer.appendChild(dot);
  });
  
  // Update dots reference
  dots = document.querySelectorAll('.testimonial-dot');
}

// Show slide function
function showSlide(index) {
  // Hide all cards
  testimonialCards.forEach(card => {
    card.classList.remove('active');
  });
  
  // Remove active class from all dots
  dots.forEach(dot => {
    dot.classList.remove('active');
  });
  
  // Show current card
  if (testimonialCards[index]) {
    testimonialCards[index].classList.add('active');
  }
  
  // Add active class to current dot
  if (dots[index]) {
    dots[index].classList.add('active');
  }
}

// Next slide function
function nextSlide() {
  currentSlide++;
  if (currentSlide >= slideCount) {
    currentSlide = 0;
  }
  showSlide(currentSlide);
}

// Previous slide function
function prevSlide() {
  currentSlide--;
  if (currentSlide < 0) {
    currentSlide = slideCount - 1;
  }
  showSlide(currentSlide);
}

// Initialize carousel
function initializeCarousel() {
  // Event listeners
  if (nextBtn) nextBtn.addEventListener('click', nextSlide);
  if (prevBtn) prevBtn.addEventListener('click', prevSlide);

  // Dot navigation
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      currentSlide = index;
      showSlide(currentSlide);
    });
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
    }
  });

  // Auto slide every 5 seconds
  let slideInterval = setInterval(nextSlide, 5000);

  // Pause auto slide on hover
  const testimonialCarousel = document.querySelector('.testimonials-carousel');
  if (testimonialCarousel) {
    testimonialCarousel.addEventListener('mouseenter', () => {
      clearInterval(slideInterval);
    });

    // Resume auto slide on mouse leave
    testimonialCarousel.addEventListener('mouseleave', () => {
      clearInterval(slideInterval);
      slideInterval = setInterval(nextSlide, 5000);
    });
  }

  // Touch swipe functionality for mobile
  let touchStartX = 0;
  let touchEndX = 0;

  if (testimonialCarousel) {
    testimonialCarousel.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });

    testimonialCarousel.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    });
  }

  function handleSwipe() {
    const swipeThreshold = 50;
    
    if (touchEndX < touchStartX - swipeThreshold) {
      // Swipe left, show next slide
      nextSlide();
    }
    
    if (touchEndX > touchStartX + swipeThreshold) {
      // Swipe right, show previous slide
      prevSlide();
    }
  }

  // Initialize first slide
  showSlide(0);
}

// Initialize carousel when DOM is loaded (fallback)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initializeCarousel, 1000); // Delay to ensure Firebase has time to load
  });
} else {
  setTimeout(initializeCarousel, 1000);
}
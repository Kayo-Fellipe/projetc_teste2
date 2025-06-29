// New Testimonials Carousel

// DOM Elements
const testimonialCards = document.querySelectorAll('.testimonial-card');
const prevBtn = document.getElementById('prev-testimonial');
const nextBtn = document.getElementById('next-testimonial');
const dots = document.querySelectorAll('.testimonial-dot');

// Set initial slide
let currentSlide = 0;
const slideCount = testimonialCards.length;

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
  testimonialCards[index].classList.add('active');
  
  // Add active class to current dot
  dots[index].classList.add('active');
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

// Event listeners
nextBtn.addEventListener('click', nextSlide);
prevBtn.addEventListener('click', prevSlide);

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
testimonialCarousel.addEventListener('mouseenter', () => {
  clearInterval(slideInterval);
});

// Resume auto slide on mouse leave
testimonialCarousel.addEventListener('mouseleave', () => {
  clearInterval(slideInterval);
  slideInterval = setInterval(nextSlide, 5000);
});

// Touch swipe functionality for mobile
let touchStartX = 0;
let touchEndX = 0;

testimonialCarousel.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
});

testimonialCarousel.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
});

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
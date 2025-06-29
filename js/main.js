// DOM Elements
const header = document.getElementById('header');
const mobileToggle = document.getElementById('mobile-toggle');
const nav = document.getElementById('nav');
const navLinks = document.querySelectorAll('#nav ul li a');
const scrollTopBtn = document.querySelector('.scroll-top');

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initializeNavigation();
  initializeScrollEffects();
  initializeAnimations();
});

// Navigation Functions
function initializeNavigation() {
  // Toggle Mobile Menu
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      nav.classList.toggle('active');
      
      // Animate mobile toggle
      const spans = mobileToggle.querySelectorAll('span');
      if (mobileToggle.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
      } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    });
  }

  // Close mobile menu when clicking on a nav link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (mobileToggle) {
        mobileToggle.classList.remove('active');
        nav.classList.remove('active');
        
        // Reset mobile toggle animation
        const spans = mobileToggle.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    });
  });

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      
      if (target) {
        window.scrollTo({
          top: target.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    });
  });
}

// Scroll Effects
function initializeScrollEffects() {
  window.addEventListener('scroll', () => {
    handleHeaderScroll();
    handleScrollTopButton();
    handleActiveNavLinks();
  });

  // Scroll to top functionality
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

function handleHeaderScroll() {
  if (header) {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
}

function handleScrollTopButton() {
  if (scrollTopBtn) {
    if (window.scrollY > 500) {
      scrollTopBtn.classList.add('active');
    } else {
      scrollTopBtn.classList.remove('active');
    }
  }
}

function handleActiveNavLinks() {
  const sections = document.querySelectorAll('section');
  const scrollPosition = window.scrollY + 200;

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');

    if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}` || 
            link.getAttribute('href') === `index.html#${sectionId}`) {
          link.classList.add('active');
        }
      });
    }
  });
}

// Animation Functions
function initializeAnimations() {
  // Reveal animations for sections
  const revealElements = () => {
    const elements = document.querySelectorAll('.section-header, .about-content, .portfolio-item, .service-card, .contact-content');
    
    elements.forEach(element => {
      const windowHeight = window.innerHeight;
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 150;
      
      if (elementTop < windowHeight - elementVisible) {
        element.classList.add('animate');
      }
    });
  };

  // Add animate class to CSS for revealed elements
  const style = document.createElement('style');
  style.textContent = `
    .section-header, .about-content, .portfolio-item, .service-card, .contact-content {
      opacity: 0;
      transform: translateY(30px);
      transition: opacity 0.5s ease, transform 0.5s ease;
    }
    
    .section-header.animate, .about-content.animate, .portfolio-item.animate, .service-card.animate, .contact-content.animate {
      opacity: 1;
      transform: translateY(0);
    }
    
    .portfolio-item:nth-child(2), .service-card:nth-child(2) {
      transition-delay: 0.2s;
    }
    
    .portfolio-item:nth-child(3), .service-card:nth-child(3) {
      transition-delay: 0.4s;
    }
    
    .portfolio-item:nth-child(4), .service-card:nth-child(4) {
      transition-delay: 0.6s;
    }
  `;
  document.head.appendChild(style);

  // Check for reveal elements on load and scroll
  window.addEventListener('scroll', revealElements);
  window.addEventListener('load', revealElements);
  
  // Initial call
  revealElements();
}

// Utility Functions
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Export functions for potential use in other modules
window.PortfolioUtils = {
  debounce,
  handleHeaderScroll,
  handleScrollTopButton,
  handleActiveNavLinks
};
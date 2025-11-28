
import { translations } from './translations.js';

// Scroll Animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

document.querySelectorAll('.service-card, .timeline-item, .contact-content').forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});

// Language Switching Logic
function updateContent(lang) {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    const keys = key.split('.');
    let value = translations[lang];

    for (const k of keys) {
      if (value) {
        value = value[k];
      }
    }

    if (value) {
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.placeholder = value;
      } else {
        element.innerHTML = value;
      }
    }
  });

  // Update active state of buttons (both desktop and mobile)
  document.querySelectorAll('.lang-btn').forEach(btn => {
    if (btn.getAttribute('data-lang') === lang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  localStorage.setItem('preferredLanguage', lang);
  document.documentElement.lang = lang;

  // Update Workflow Diagram Image if it exists
  const workflowDiagram = document.getElementById('workflow-diagram');
  if (workflowDiagram) {
    if (lang === 'tr') {
      workflowDiagram.src = './workflow-diagram-tr.png?v=2';
    } else {
      workflowDiagram.src = './workflow-diagram.png?v=2';
    }
  }
}

// Initialize Language
const savedLang = localStorage.getItem('preferredLanguage') || 'en';

// Function to initialize language switching
function initLanguageSwitching() {
  // Apply saved language immediately
  updateContent(savedLang);

  // Add click handlers to all language buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const lang = e.target.getAttribute('data-lang');
      if (lang) {
        updateContent(lang);
      }
    });
  });

  // Scroll to Top Button
  const scrollToTopBtn = document.getElementById('scrollToTop');

  if (scrollToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        scrollToTopBtn.classList.add('visible');
      } else {
        scrollToTopBtn.classList.remove('visible');
      }
    });

    scrollToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // Floating CTA Button (Mobile)
  const floatingCta = document.getElementById('floatingCta');

  if (floatingCta) {
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 200) {
        floatingCta.classList.add('visible');
      } else {
        floatingCta.classList.remove('visible');
      }
    });
  }


  // Mobile Menu Toggle
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');

  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenuBtn.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    // Close menu when clicking on a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenuBtn.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!mobileMenuBtn.contains(e.target) && !navLinks.contains(e.target)) {
        mobileMenuBtn.classList.remove('active');
        navLinks.classList.remove('active');
      }
    });
  }
}

// Initialize everything when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLanguageSwitching);
} else {
  // DOM already loaded
  initLanguageSwitching();
}

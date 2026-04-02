/* ===================================================
   DR. MAYSOON WEBSITE – MAIN JAVASCRIPT
   Language toggle, Smooth Scroll, Reveal Animations
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // --- 1. LANGUAGE TOGGLE LOGIC ---
  const langToggleBtn = document.getElementById('lang-toggle');
  const langLabel = document.getElementById('lang-label');
  const htmlElement = document.documentElement;

  // Elements with translations
  const translatableElements = document.querySelectorAll('[data-en][data-ar]');

  function setLanguage(lang) {
    htmlElement.setAttribute('data-lang', lang);
    htmlElement.setAttribute('lang', lang);
    htmlElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

    // Update button text and title
    if (lang === 'ar') {
      langLabel.textContent = 'English';
      langToggleBtn.setAttribute('title', 'Switch to English');
    } else {
      langLabel.textContent = 'العربية';
      langToggleBtn.setAttribute('title', 'Switch to Arabic');
    }

    // Update text content of translatable elements
    translatableElements.forEach(el => {
      // If it's an input/textarea placeholder
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = el.getAttribute(`data-${lang}`);
      } else if (el.tagName === 'OPTION') {
        el.textContent = el.getAttribute(`data-${lang}`);
      } else {
        // For regular nodes we might have internal markup (like spans, i tags).
        // If we just swap text, we lose internal icons.
        // In our HTML structure, translatable text is usually in explicit elements.
        el.innerHTML = el.getAttribute(`data-${lang}`);
      }
    });

    // Save preference
    localStorage.setItem('dr_maysoon_lang', lang);
  }

  // Initialize lang
  const savedLang = localStorage.getItem('dr_maysoon_lang') || 'en';
  setLanguage(savedLang);

  langToggleBtn.addEventListener('click', () => {
    const currentLang = htmlElement.getAttribute('data-lang');
    const newLang = currentLang === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
  });

  // --- 2. NAVBAR SCROLL EFFECT ---
  const navbar = document.getElementById('navbar');
  const backToTopBtn = document.getElementById('back-to-top');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    if (window.scrollY > 500) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // --- 3. MOBILE MENU TOGGLE ---
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = mobileMenu.querySelectorAll('a');

  function toggleMenu() {
    hamburger.classList.toggle('active');
    const isExpanded = hamburger.classList.contains('active');
    hamburger.setAttribute('aria-expanded', isExpanded);
    mobileMenu.classList.toggle('open');
    mobileMenu.setAttribute('aria-hidden', !isExpanded);
  }

  hamburger.addEventListener('click', toggleMenu);

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (mobileMenu.classList.contains('open')) {
        toggleMenu();
      }
    });
  });

  // --- 4. SCROLL REVEAL ANIMATIONS (bidirectional) ---
  // Elements fade-in-up when entering and reset when fully exiting,
  // so the animation replays every time the user scrolls back.
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Apply transition-delay from data-delay attribute if present
        const delay = entry.target.dataset.delay;
        if (delay) entry.target.style.transitionDelay = delay + 'ms';
        entry.target.classList.add('visible');
      } else {
        // Reset when completely out of view so animation replays on scroll-back
        entry.target.classList.remove('visible');
        entry.target.style.transitionDelay = '';
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // --- 4b. HERO SCROLL ARROW ---
  const scrollHint = document.querySelector('.scroll-hint');
  if (scrollHint) {
    scrollHint.style.cursor = 'pointer';
    scrollHint.addEventListener('click', () => {
      const aboutSection = document.getElementById('about');
      if (aboutSection) {
        const offset = aboutSection.getBoundingClientRect().top + window.pageYOffset - 80;
        window.scrollTo({ top: offset, behavior: 'smooth' });
      }
    });
  }


  // --- 5. ANIMATED COUNTERS ---
  // Only fires when the stats box is scrolled fully into view (threshold 0.85).
  // Each stat-number with [data-count] gets a smooth ease-out count-up
  // paired with a CSS fade-in + slide-up on its inner .counter-value span.

  const counterEls = document.querySelectorAll('.stat-number[data-count]');

  /**
   * Ease-out cubic – starts fast, decelerates to final value.
   * t: progress 0→1, returns eased value 0→1
   */
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function runCounter(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1800; // ms total

    // Build inner value span (CSS handles the slide-up)
    el.innerHTML = '';
    const valueSpan = document.createElement('span');
    valueSpan.className = 'counter-value';
    valueSpan.textContent = '0' + suffix;
    el.appendChild(valueSpan);

    // Tiny delay so the CSS transition registers after the element is painted
    requestAnimationFrame(() => {
      el.classList.add('is-counting');   // triggers CSS opacity + translateY → 0
    });

    // rAF-based counting loop
    let startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const current = Math.round(eased * target);

      valueSpan.textContent = current.toLocaleString() + suffix;

      if (progress < 1) {
        el._rafId = requestAnimationFrame(step);
      } else {
        valueSpan.textContent = target.toLocaleString() + suffix;
      }
    }

    el._rafId = requestAnimationFrame(step);
  }

  function resetCounter(el) {
    cancelAnimationFrame(el._rafId);
    el.classList.remove('is-counting');
    el.innerHTML = el.getAttribute('data-count') + (el.getAttribute('data-suffix') || '');
  }

  // Observe the hero-stats container – wait for threshold 0.85 so the
  // whole block is comfortably in view before starting
  const heroStats = document.querySelector('.hero-stats');

  if (heroStats && counterEls.length) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          counterEls.forEach(runCounter);
        } else {
          // Reset so it re-animates next time the user scrolls back up
          counterEls.forEach(resetCounter);
        }
      });
    }, { threshold: 0.85 });

    statsObserver.observe(heroStats);
  }

  // --- 5. CONTACT FORM (Netlify) ---
  // Netlify handles submission natively via data-netlify="true".
  // We validate first; block POST only when invalid so Netlify always
  // receives valid data via the browser's native form action.
  const contactForm = document.getElementById('contact-form');
  const formStatus  = document.getElementById('form-status');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      const isAr = document.documentElement.getAttribute('data-lang') === 'ar';
      let isValid = true;

      contactForm.querySelectorAll('input[required], textarea[required], select[required]').forEach(input => {
        input.classList.remove('error');
        if (!input.value.trim()) { isValid = false; input.classList.add('error'); }
      });

      if (!isValid) {
        e.preventDefault();   // block only on validation failure
        if (formStatus) {
          formStatus.textContent = isAr
            ? 'يرجى ملء جميع الحقول المطلوبة.'
            : 'Please fill in all required fields.';
          formStatus.className = 'error-msg';
        }
      }
      // if valid → browser native POST proceeds to Netlify ✓
    });
  }

  // --- 6. SMOOTH SCROLL FOR ANCHOR LINKS ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      if (this.getAttribute('href') === '#') return;

      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        e.preventDefault();

        // Account for fixed navbar height
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

});
document.addEventListener('DOMContentLoaded', () => {
  /* ======================== GALLERY FILTERING ======================== */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const masonryItems = document.querySelectorAll('.masonry-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // إزالة الكلاس النشط من جميع الأزرار وإضافته للزر المضغوط
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      // إظهار وإخفاء الصور بناءً على الفئة
      masonryItems.forEach(item => {
        if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
          item.classList.remove('hidden');
        } else {
          item.classList.add('hidden');
        }
      });
    });
  });

  /* ======================== LIGHTBOX LOGIC ======================== */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = lightbox.querySelector('.lightbox-img');
  const lightboxClose = lightbox.querySelector('.lightbox-close');

  // فتح الصورة
  masonryItems.forEach(item => {
    item.addEventListener('click', () => {
      // يأخذ مصدر الصورة المصغرة ويعرضها بشكل مكبر
      const imgSrc = item.querySelector('img').src;
      lightboxImg.src = imgSrc;
      lightbox.classList.add('active');
    });
  });

  // إغلاق الصورة من زر الـ X
  lightboxClose.addEventListener('click', () => {
    lightbox.classList.remove('active');
  });

  // إغلاق الصورة عند الضغط على الخلفية الفارغة
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      lightbox.classList.remove('active');
    }
  });
});
/* ─── Scroll Reveal 3.0 (True Bidirectional) ─── */
document.addEventListener("DOMContentLoaded", function () {
  const revealElements = document.querySelectorAll('.reveal');

  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // إذا العنصر دخل الشاشة (من أي اتجاه)، أظهره
        entry.target.classList.add('active');
      } else {
        // بمجرد ما يطلع برا الشاشة تماماً، اسحب منه الكلاس عشان يرجع يختفي
        entry.target.classList.remove('active');
      }
    });
  }, {
    threshold: 0.1 // يشتغل بمجرد ظهور 10% من العنصر
  });

  revealElements.forEach(el => scrollObserver.observe(el));
});

/* ─── Adaptive Floating Socials Contrast ─── */
document.addEventListener("DOMContentLoaded", function () {
  const floatingSocials = document.querySelector('.floating-socials');
  const adaptiveSections = document.querySelectorAll('.hero-section, .about-section, .vision-section, .training-section, .research-section, .gallery-section, .contact-section, footer');

  if (floatingSocials && adaptiveSections.length > 0) {
    const checkFloatingContrast = () => {
      const widgetRect = floatingSocials.getBoundingClientRect();
      const widgetCenterY = widgetRect.top + (widgetRect.height / 2);

      let activeSection = null;
      for (let i = 0; i < adaptiveSections.length; i++) {
        const rect = adaptiveSections[i].getBoundingClientRect();
        if (widgetCenterY >= rect.top && widgetCenterY <= rect.bottom) {
          activeSection = adaptiveSections[i];
          break;
        }
      }

      if (activeSection) {
        // Sections defined as strictly Dark/Navy based on stylesheet parameters
        const isDarkSection = activeSection.classList.contains('hero-section') ||
                              activeSection.classList.contains('vision-section') ||
                              activeSection.classList.contains('research-section') ||
                              activeSection.classList.contains('contact-section') ||
                              activeSection.tagName.toLowerCase() === 'footer';

        if (isDarkSection) {
          floatingSocials.classList.add('dark-mode');
        } else {
          floatingSocials.classList.remove('dark-mode');
        }
      }
    };

    let scrollTicking = false;
    window.addEventListener('scroll', () => {
      if (!scrollTicking) {
        window.requestAnimationFrame(() => {
          checkFloatingContrast();
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    }, { passive: true });
    
    // Trigger initial check on load
    setTimeout(checkFloatingContrast, 150);
  }
});

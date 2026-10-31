/**
 * ==========================================================================
 * MAIN PORTFOLIO CONTROLLER - AJAY ANANDH S
 * Navigation, Scrollspy, Modals, Dynamic Interactivity
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollSpy();
  initScrollReveal();
  initTimelineScrollAnimation();
  initMobileMenu();
  initProjectModals();
  initResumeDownload();
  initHudInteraction();
  initHeroTypographyAnimations();
  initCircuitParticleCanvas();
  initIntroAnimation();
  initThemeToggle();
});

/* --- 1. Sticky Navbar & Header Elevation --- */
function initNavbar() {
  const header = document.querySelector('.header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

/* --- 2. ScrollSpy for Active Navigation Highlighting --- */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const mobileLinks = document.querySelectorAll('.mobile-nav-links a');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 140;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        current = sectionId;
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });

    mobileLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });
}

/* --- 3. Intersection Observer for Scroll Reveal --- */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

/* --- 3.5. Education Timeline Scroll & Dot Connection Animation --- */
function initTimelineScrollAnimation() {
  const timeline = document.getElementById('educationTimeline');
  const progressLine = document.getElementById('timelineProgressLine');
  const timelineItems = document.querySelectorAll('.timeline-item');

  if (!timeline || !progressLine || !timelineItems.length) return;

  function updateTimeline() {
    const timelineRect = timeline.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    
    // Start drawing when timeline enters bottom 75% of viewport
    const startTrigger = windowHeight * 0.78;
    const scrollDistance = startTrigger - timelineRect.top;
    const totalHeight = timelineRect.height - 24; // Reach last dot

    let progress = scrollDistance / (totalHeight + windowHeight * 0.25);
    progress = Math.max(0, Math.min(1, progress));

    const currentHeightPx = progress * totalHeight;
    progressLine.style.height = `${currentHeightPx}px`;

    // Activate and connect each dot as line descends
    timelineItems.forEach((item) => {
      const marker = item.querySelector('.timeline-marker');
      if (!marker) return;

      const markerTopInTimeline = marker.offsetTop;
      
      if (currentHeightPx >= markerTopInTimeline + 8) {
        item.classList.add('active-marker');
      } else {
        item.classList.remove('active-marker');
      }
    });
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateTimeline();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  window.addEventListener('resize', updateTimeline, { passive: true });
  setTimeout(updateTimeline, 150);
}

/* --- 4. Mobile Drawer Menu Navigation --- */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobileToggle');
  const drawer = document.getElementById('mobileDrawer');
  const overlay = document.getElementById('drawerOverlay');
  const mobileLinks = document.querySelectorAll('.mobile-nav-links a, .mobile-drawer .nav-cta-btn');

  if (!toggleBtn || !drawer || !overlay) return;

  function toggleMenu() {
    toggleBtn.classList.toggle('active');
    drawer.classList.toggle('open');
    overlay.classList.toggle('active');
    document.body.style.overflow = drawer.classList.contains('open') ? 'hidden' : '';
  }

  function closeMenu() {
    toggleBtn.classList.remove('active');
    drawer.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  toggleBtn.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', closeMenu);

  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

/* --- 5. Project Detail Modals --- */
const projectData = {
  crop: {
    title: "Smart-Crop Advisory System",
    category: "Agriculture & Data Tech",
    description: "Developed a smart application that provides farmers with crop recommendations, weather-based advisory, government scheme information, and pest/disease prevention guidance. Designed the system with a focus on improving farming decisions and providing accessible agricultural information.",
    highlights: [
      "Dynamic Crop Recommendation engine leveraging climate, soil attributes, and seasonal factors.",
      "Weather-based advisory dashboard with predictive weather tracking.",
      "Government schemes & subsidy aggregator connecting policies to grassroots farmers.",
      "Pest & disease prevention guidance with accessible diagnostic workflows."
    ],
    techStack: ["Python", "Data Analytics", "HTML", "CSS", "JavaScript", "Advisory Engine"],
    status: "Completed / Ready for Deployment",
    github: "https://github.com/ajayanandh",
    demo: "https://ajayanandh.github.io/Portfolio-Aj/"
  },
  childsafety: {
    title: "Child Safety Application",
    category: "Safety & Emergency Response",
    description: "Developed a child safety application designed to help parents/guardians monitor child safety and respond quickly to potential risks. Integrated safety-focused features such as emergency assistance, location monitoring, and alerts to improve child protection.",
    highlights: [
      "Emergency assistance SOS with rapid alert triggers.",
      "Real-time location monitoring and perimeter tracking.",
      "Proactive threat identification and guardian notification channels.",
      "Parent/guardian dashboard with multi-device synchronization."
    ],
    techStack: ["Java / Python", "Location Monitoring", "Emergency Assistance", "Alert Systems"],
    status: "Completed / Tested",
    github: "https://github.com/ajayanandh",
    demo: "https://ajayanandh.github.io/Portfolio-Aj/"
  }
};

function initProjectModals() {
  const modalOverlay = document.getElementById('projectModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const viewButtons = document.querySelectorAll('[data-project-key]');

  if (!modalOverlay || !modalCloseBtn) return;

  function openModal(key) {
    const data = projectData[key];
    if (!data) return;

    document.getElementById('modalTitle').textContent = data.title;
    document.getElementById('modalCategory').textContent = data.category;
    document.getElementById('modalDescription').textContent = data.description;
    document.getElementById('modalStatus').textContent = data.status;

    // Render highlights
    const highlightsList = document.getElementById('modalHighlights');
    highlightsList.innerHTML = data.highlights.map(item => `
      <li style="display: flex; gap: 0.6rem; align-items: flex-start; margin-bottom: 0.5rem;">
        <span style="color: var(--accent-lime-hover); font-weight: 800; line-height: 1.4;">•</span>
        <span style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.5;">${item}</span>
      </li>
    `).join('');

    // Render Tech Stack
    const techContainer = document.getElementById('modalTechStack');
    techContainer.innerHTML = data.techStack.map(tech => `
      <span class="tech-badge" style="background: var(--bg-card-subtle); color: var(--text-primary); font-weight: 600;">${tech}</span>
    `).join('');

    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  viewButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const key = btn.getAttribute('data-project-key');
      openModal(key);
    });
  });

  modalCloseBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
      closeModal();
    }
  });
}

/* --- 6. Download Resume Action --- */
function initResumeDownload() {
  const resumeButtons = document.querySelectorAll('.download-resume-btn');
  resumeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      showToast("Downloading Resume for Ajay Anandh S...");
      
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = 'assets/Ajay_Anandh_Resume.pdf'; // Ensure the PDF is placed in the assets folder
        link.download = 'Ajay_Anandh_Resume.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, 500);
    });
  });
}

/* --- Toast Notification Helper --- */
function showToast(message) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  
  setTimeout(() => toast.classList.add('show'), 50);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}
window.showToast = showToast;

/* --- 7. Interactive Tech HUD 3D Tilt & Mouse Reactions --- */
function initHudInteraction() {
  const card = document.querySelector('.tech-animation-card');
  const hudImg = document.getElementById('techHudImg');
  const coreGlow = document.querySelector('.hud-core-glow');

  if (!card || !hudImg || !coreGlow) return;

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const rotateX = (y / rect.height) * -10;
    const rotateY = (x / rect.width) * 12;

    hudImg.style.transform = `scale(1.06) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    coreGlow.style.transform = `translate(calc(-50% + ${x * 0.12}px), calc(-50% + ${y * 0.12}px)) scale(1.3)`;
  });

  card.addEventListener('mouseleave', () => {
    hudImg.style.transform = '';
    coreGlow.style.transform = '';
  });
}

/* --- 8. Hero Typography Animations: Letter-Stagger & Word-by-Word Fade --- */
function initHeroTypographyAnimations() {
  // A. Letter-stagger on Name ("Ajay Anandh S")
  const nameEl = document.getElementById('heroNameTitle');
  if (nameEl) {
    const rawText = nameEl.textContent.trim();
    nameEl.setAttribute('aria-label', rawText);
    nameEl.innerHTML = '';

    [...rawText].forEach((char, i) => {
      const span = document.createElement('span');
      span.className = 'letter-char';
      span.textContent = char;
      span.style.animationDelay = `${0.18 + i * 0.045}s`;
      nameEl.appendChild(span);
    });
  }

  // B. Word-by-word fade on Hero Introduction
  const descEl = document.querySelector('.hero-description');
  if (descEl) {
    const rawDesc = descEl.textContent.trim();
    descEl.innerHTML = '';
    const words = rawDesc.split(/\s+/);

    words.forEach((word, i) => {
      const span = document.createElement('span');
      span.className = 'word-fade';
      span.textContent = word;
      span.style.animationDelay = `${0.75 + i * 0.035}s`;
      descEl.appendChild(span);
    });
  }
}

/* --- 9. Slow Moving Technology Background Circuit Lines & Glowing Particles Canvas --- */
function initCircuitParticleCanvas() {
  const canvas = document.getElementById('heroCircuitCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;

  function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    width = canvas.width = rect.width;
    height = canvas.height = rect.height;
  }

  window.addEventListener('resize', resizeCanvas, { passive: true });
  resizeCanvas();

  // Particle Generation
  const particleCount = Math.min(Math.floor(width * 0.035), 45);
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius: Math.random() * 2 + 1.2,
      baseAlpha: Math.random() * 0.45 + 0.25,
      pulsePhase: Math.random() * Math.PI * 2
    });
  }

  // Slow horizontal circuit traces
  const circuitTracks = [];
  for (let i = 0; i < 5; i++) {
    circuitTracks.push({
      y: (height / 6) * (i + 1) + (Math.random() - 0.5) * 35,
      progress: Math.random(),
      speed: 0.0006 + Math.random() * 0.0009,
      length: 120 + Math.random() * 160,
      alpha: 0.22 + Math.random() * 0.3
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Slow Circuit Path Lines & Moving Glow Packets
    circuitTracks.forEach(track => {
      track.progress += track.speed;
      if (track.progress > 1.3) track.progress = -0.3;

      const currentX = track.progress * width;
      
      const grad = ctx.createLinearGradient(currentX - track.length, track.y, currentX, track.y);
      grad.addColorStop(0, 'rgba(14, 165, 233, 0)');
      grad.addColorStop(0.7, `rgba(56, 189, 248, ${track.alpha})`);
      grad.addColorStop(1, `rgba(255, 255, 255, ${track.alpha * 1.4})`);

      ctx.beginPath();
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.4;
      ctx.moveTo(currentX - track.length, track.y);
      ctx.lineTo(currentX, track.y);
      ctx.stroke();

      // Glowing Node at front of pulse
      ctx.beginPath();
      ctx.arc(currentX, track.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#38BDF8';
      ctx.shadowColor = '#0EA5E9';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // 2. Draw Slow Floating Particles and Interconnecting Circuit Nodes
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      p.pulsePhase += 0.02;
      const currentAlpha = p.baseAlpha + Math.sin(p.pulsePhase) * 0.2;

      // Draw particle dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(14, 165, 233, ${Math.max(0.12, currentAlpha)})`;
      ctx.fill();

      // Connect nearby particles with faint glowing circuit lines
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 125) {
          const lineAlpha = (1 - dist / 125) * 0.25;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(14, 165, 233, ${lineAlpha})`;
          ctx.lineWidth = 0.85;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  draw();
}

/* --- 10. Intro Brush Animation --- */
function initIntroAnimation() {
  const introOverlay = document.getElementById('introOverlay');
  const helloSvg = document.getElementById('helloSvg');
  if (!introOverlay || !helloSvg) {
    document.body.classList.remove('no-scroll');
    return;
  }

  // Wait for the drawing animation to finish, then scale up
  setTimeout(() => {
    helloSvg.classList.add('scale-up');
  }, 2100);

  // Fade out the overlay
  setTimeout(() => {
    introOverlay.classList.add('fade-out');
    document.body.classList.remove('no-scroll');
    
    // Remove from DOM entirely after fade transition finishes
    setTimeout(() => {
      introOverlay.remove();
    }, 800);
  }, 2800);
}

/* --- 11. Theme Toggle (Light/Dark Mode) --- */
function initThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  const themeLabel = document.getElementById('themeLabel');
  if (!themeToggle) return;

  const htmlElement = document.documentElement;
  
  // Check local storage or system preference
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  let currentTheme = 'light';
  if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
    currentTheme = 'dark';
  }
  
  // Apply initial theme
  setTheme(currentTheme);
  
  themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(currentTheme);
  });
  
  function setTheme(theme) {
    const profileImg = document.getElementById('profileImage');
    const techImg = document.getElementById('techHudImg');
    if (theme === 'dark') {
      htmlElement.setAttribute('data-theme', 'dark');
      if (themeLabel) themeLabel.textContent = 'Dark mode';
      if (profileImg) profileImg.src = 'assets/profile_dark.png';
      if (techImg) techImg.src = 'assets/tech_animation_dark.png';
    } else {
      htmlElement.removeAttribute('data-theme');
      if (themeLabel) themeLabel.textContent = 'Light mode';
      if (profileImg) profileImg.src = 'assets/profile.jpg';
      if (techImg) techImg.src = 'assets/tech_animation.png';
    }
    localStorage.setItem('theme', theme);
  }
}

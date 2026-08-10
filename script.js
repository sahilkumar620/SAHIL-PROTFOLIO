/* ==========================================================================
   PARTICLE NETWORK CANVAS BACKGROUND
   ========================================================================== */
const initParticleCanvas = () => {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let particlesArray = [];
    let animationFrameId;
    
    // Mouse interaction coordinates
    const mouse = {
        x: null,
        y: null,
        radius: 120 // Connect particles within this radius from mouse
    };

    // Track mouse movement
    window.addEventListener('mousemove', (event) => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
    });

    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Resize canvas based on screen dimensions
    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Adjust particle density based on screen width
        let numberOfParticles = 55;
        if (window.innerWidth < 768) {
            numberOfParticles = 25; // Lower count on mobile for efficiency
        }
        
        createParticles(numberOfParticles);
    };

    // Particle representation class
    class Particle {
        constructor(x, y, directionX, directionY, size, color) {
            this.x = x;
            this.y = y;
            this.directionX = directionX;
            this.directionY = directionY;
            this.size = size;
            this.color = color;
        }

        // Draw particle node
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        // Update movement vectors
        update() {
            // Collision detection with screen borders
            if (this.x > canvas.width || this.x < 0) {
                this.directionX = -this.directionX;
            }
            if (this.y > canvas.height || this.y < 0) {
                this.directionY = -this.directionY;
            }

            // Move particle
            this.x += this.directionX;
            this.y += this.directionY;

            // Draw particle
            this.draw();
        }
    }

    // Populate particles list
    const createParticles = (count) => {
        particlesArray = [];
        for (let i = 0; i < count; i++) {
            const size = Math.random() * 2 + 1; // 1px to 3px
            const x = Math.random() * (canvas.width - size * 2) + size;
            const y = Math.random() * (canvas.height - size * 2) + size;
            
            // Slow velocity mapping (0.1 to 0.4 pixels/frame)
            const directionX = (Math.random() * 0.4 - 0.2);
            const directionY = (Math.random() * 0.4 - 0.2);
            
            // Subtle cyan or violet color selection
            const accentChoice = Math.random() > 0.5 ? 'rgba(34, 211, 238, 0.4)' : 'rgba(167, 139, 250, 0.4)';
            
            particlesArray.push(new Particle(x, y, directionX, directionY, size, accentChoice));
        }
    };

    // Connecting lines rendering algorithm
    const connect = () => {
        let opacityValue = 1;
        const maxDistance = 140; // Max connect length
        
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                const dx = particlesArray[a].x - particlesArray[b].x;
                const dy = particlesArray[a].y - particlesArray[b].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxDistance) {
                    // Connect nodes together
                    opacityValue = 1 - (distance / maxDistance);
                    ctx.strokeStyle = `rgba(34, 211, 238, ${opacityValue * 0.12})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }

            // Connect mouse to particles
            if (mouse.x !== null && mouse.y !== null) {
                const dxMouse = particlesArray[a].x - mouse.x;
                const dyMouse = particlesArray[a].y - mouse.y;
                const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

                if (distMouse < mouse.radius) {
                    opacityValue = 1 - (distMouse / mouse.radius);
                    ctx.strokeStyle = `rgba(167, 139, 250, ${opacityValue * 0.16})`;
                    ctx.lineWidth = 1.2;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
            }
        }
    };

    // Main animation loop
    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
        connect();
        
        animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate();
};

/* ==========================================================================
   MOBILE NAVIGATION MENU TOGGLE
   ========================================================================== */
const initMobileNav = () => {
    const navToggle = document.querySelector('.mobile-nav-toggle');
    const mainNav = document.getElementById('main-nav');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!navToggle || !mainNav) return;

    const toggleMenu = () => {
        const isOpened = navToggle.getAttribute('aria-expanded') === 'true';
        navToggle.setAttribute('aria-expanded', !isOpened);
        mainNav.classList.toggle('open');
        document.body.classList.toggle('nav-lock'); // Prevent background scrolls
    };

    navToggle.addEventListener('click', toggleMenu);

    // Close menu when navigation link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav.classList.contains('open')) {
                toggleMenu();
            }
        });
    });

    // Close when clicking outside of the drawer panel
    document.addEventListener('click', (event) => {
        if (mainNav.classList.contains('open') && 
            !mainNav.contains(event.target) && 
            !navToggle.contains(event.target)) {
            toggleMenu();
        }
    });
};

/* ==========================================================================
   INTERSECTION OBSERVER - SCROLL SPY (ACTIVE NAV)
   ========================================================================== */
const initScrollSpy = () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!sections.length || !navLinks.length) return;

    // Use IntersectionObserver to spy scroll activity
    const options = {
        root: null,
        rootMargin: '-30% 0px -60% 0px', // Center viewport bias
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, options);

    sections.forEach(section => observer.observe(section));
};

/* ==========================================================================
   SCROLL REVEAL ANIMATIONS
   ========================================================================== */
const initScrollReveal = () => {
    const revealElements = document.querySelectorAll('.section-header, .about-grid, .interests-container, .carousel-container, .timeline-item, .education-certifications-grid, .contact-grid');
    
    if (!revealElements.length) return;

    revealElements.forEach(el => el.classList.add('reveal'));

    const options = {
        root: null,
        rootMargin: '0px 0px -100px 0px', // Trigger slightly before element bottom enters
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target); // Trigger only once
            }
        });
    }, options);

    revealElements.forEach(el => observer.observe(el));
};

/* ==========================================================================
   INTERACTIVE MOUSE-FOLLOW CARD GLOW EFFECT
   ========================================================================== */
const initCardGlow = () => {
    const cards = document.querySelectorAll('.project-card, .timeline-content, .education-card, .cert-card, .contact-item-card');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--x', `${x}px`);
            card.style.setProperty('--y', `${y}px`);
        });
    });
};

/* ==========================================================================
   CAROUSEL AND FILTER PIPELINE
   ========================================================================== */
const initCarouselFilter = () => {
    const track = document.getElementById('carousel-track');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const paginationContainer = document.getElementById('carousel-pagination');
    const filterTabs = document.querySelectorAll('.filter-tab');

    if (!track) return;

    let allCards = Array.from(track.children);
    let visibleCards = [...allCards];
    let currentIndex = 0;

    // Filter project cards logic
    const filterProjects = (category) => {
        currentIndex = 0;
        
        // Temporarily reset track transforms
        track.style.transform = `translateX(0)`;
        
        allCards.forEach(card => {
            const cardCat = card.getAttribute('data-category');
            if (category === 'all' || cardCat === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });

        // Update list of currently active cards
        visibleCards = allCards.filter(card => category === 'all' || card.getAttribute('data-category') === category);
        
        updateCarouselControls();
        rebuildPaginationDots();
        moveToSlide(0);
    };

    // Event binding for filtering tabs
    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            filterProjects(tab.getAttribute('data-filter'));
        });
    });

    // Update active nav arrows opacity
    const updateCarouselControls = () => {
        if (!prevBtn || !nextBtn) return;
        
        if (visibleCards.length <= 1) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
            return;
        } else {
            prevBtn.style.display = 'flex';
            nextBtn.style.display = 'flex';
        }

        prevBtn.style.opacity = currentIndex === 0 ? '0.4' : '1';
        prevBtn.style.pointerEvents = currentIndex === 0 ? 'none' : 'auto';

        nextBtn.style.opacity = currentIndex === visibleCards.length - 1 ? '0.4' : '1';
        nextBtn.style.pointerEvents = currentIndex === visibleCards.length - 1 ? 'none' : 'auto';
    };

    // Rebuild pagination dots based on visible cards
    const rebuildPaginationDots = () => {
        if (!paginationContainer) return;
        paginationContainer.innerHTML = '';
        
        if (visibleCards.length <= 1) return;

        visibleCards.forEach((_, idx) => {
            const dot = document.createElement('button');
            dot.classList.add('carousel-dot');
            dot.setAttribute('aria-label', `Navigate to project ${idx + 1}`);
            if (idx === 0) dot.classList.add('active');
            
            dot.addEventListener('click', () => {
                moveToSlide(idx);
            });
            
            paginationContainer.appendChild(dot);
        });
    };

    // Slide transition controller
    const moveToSlide = (index) => {
        if (index < 0 || index >= visibleCards.length) return;
        
        currentIndex = index;
        
        // Since margins and gaps are defined in layout:
        // We translate the viewport relative to card sizes. Card width is 100% of track layout.
        // Gap is 2rem = 32px.
        const gapOffset = index * 32;
        track.style.transform = `translateX(calc(-${index * 100}% - ${gapOffset}px))`;
        
        updateCarouselControls();

        // Update active dots
        const dots = paginationContainer.querySelectorAll('.carousel-dot');
        dots.forEach((dot, dIdx) => {
            dot.classList.toggle('active', dIdx === index);
        });
    };

    // Navigation buttons listeners
    if (prevBtn && nextBtn) {
        prevBtn.addEventListener('click', () => moveToSlide(currentIndex - 1));
        nextBtn.addEventListener('click', () => moveToSlide(currentIndex + 1));
    }

    // Touch Swipe Support for mobile viewports
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    const handleSwipe = () => {
        const threshold = 50; // swipe offset threshold
        if (touchStartX - touchEndX > threshold) {
            // Swiped Left -> Next slide
            moveToSlide(currentIndex + 1);
        } else if (touchEndX - touchStartX > threshold) {
            // Swiped Right -> Prev slide
            moveToSlide(currentIndex - 1);
        }
    };

    // Initial setups
    rebuildPaginationDots();
    updateCarouselControls();
};

/* ==========================================================================
   LIGHTBOX MODAL FOR CERTIFICATES
   ========================================================================== */
const initLightbox = () => {
    const certCards = document.querySelectorAll('.cert-card');
    const lightbox = document.getElementById('cert-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxPdf = document.getElementById('lightbox-pdf');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxDesc = document.getElementById('lightbox-desc');
    const closeBtn = document.querySelector('.lightbox-close');

    if (!lightbox || !lightboxImg) return;

    // Handle thumbnail PDF loading fallback to beautiful placeholder
    document.querySelectorAll('.cert-img-thumb').forEach(img => {
        img.addEventListener('error', () => {
            img.style.display = 'none';
            const mediaContainer = img.closest('.cert-media');
            if (mediaContainer && !mediaContainer.querySelector('.cert-pdf-placeholder')) {
                const placeholder = document.createElement('div');
                placeholder.className = 'cert-pdf-placeholder';
                placeholder.innerHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; gap: 0.5rem; color: var(--accent-cyan);">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M12 18v-6"></path><path d="m9 15 3 3 3-3"></path></svg>
                        <span style="font-size: 0.75rem; font-family: var(--font-heading); font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">PDF Certificate</span>
                    </div>
                `;
                mediaContainer.appendChild(placeholder);
            }
        });
        // Trigger error handler if image is already broken
        if (img.complete && img.naturalWidth === 0) {
            img.dispatchEvent(new Event('error'));
        }
    });

    const openLightbox = (card) => {
        const imagePath = card.getAttribute('data-image');
        const title = card.getAttribute('data-title');
        const desc = card.getAttribute('data-desc');

        if (imagePath.endsWith('.pdf')) {
            // It's a PDF, show iframe and hide image
            lightboxImg.style.display = 'none';
            if (lightboxPdf) {
                lightboxPdf.style.display = 'block';
                lightboxPdf.src = imagePath;
            }
        } else {
            // It's an image, show image and hide iframe
            if (lightboxPdf) lightboxPdf.style.display = 'none';
            lightboxImg.style.display = 'block';
            lightboxImg.src = imagePath;
            lightboxImg.alt = title;
        }

        lightboxTitle.textContent = title;
        lightboxDesc.textContent = desc;

        lightbox.style.display = 'flex';
        // Add timeout for CSS transitions
        setTimeout(() => {
            lightbox.classList.add('active');
            lightbox.setAttribute('aria-hidden', 'false');
        }, 10);
        
        document.body.classList.add('lightbox-lock'); // Prevent scrolls
    };

    const closeLightbox = () => {
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
        
        setTimeout(() => {
            lightbox.style.display = 'none';
            lightboxImg.src = '';
            if (lightboxPdf) lightboxPdf.src = ''; // Stop PDF file loading in background
        }, 300); // match transition length
        
        document.body.classList.remove('lightbox-lock');
    };

    certCards.forEach(card => {
        card.addEventListener('click', () => openLightbox(card));
        
        // Keyboard support (Accessibility)
        card.setAttribute('tabindex', '0');
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(card);
            }
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', closeLightbox);
    }

    // Close when clicking outside content image
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });

    // ESC key close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
};

/* ==========================================================================
   CONTACT FORM SUBMISSION FEEDBACK
   ========================================================================== */
const initContactForm = () => {
    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('form-submit-btn');
    const feedback = document.getElementById('form-feedback');

    if (!form || !submitBtn || !feedback) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Grab inputs
        const nameVal = document.getElementById('form-name').value.trim();
        const emailVal = document.getElementById('form-email').value.trim();
        const msgVal = document.getElementById('form-message').value.trim();

        if (!nameVal || !emailVal || !msgVal) {
            showFeedback('All fields are required.', 'error');
            return;
        }

        // Enter submitting state
        submitBtn.disabled = true;
        const origBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>Sending message...</span>';
        feedback.className = 'form-feedback-message';
        feedback.textContent = '';

        // Simulate fetch post
        setTimeout(() => {
            showFeedback(`Thank you, ${nameVal}! Your message has been sent successfully.`, 'success');
            
            // Reset form
            form.reset();
            
            // Restore button state
            submitBtn.disabled = false;
            submitBtn.innerHTML = origBtnText;
        }, 1200);
    });

    const showFeedback = (text, type) => {
        feedback.textContent = text;
        feedback.className = `form-feedback-message ${type}`;
    };
};

/* ==========================================================================
   INITIALIZER LISTENER
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    initParticleCanvas();
    initMobileNav();
    initScrollSpy();
    initScrollReveal();
    initCardGlow();
    initCarouselFilter();
    initLightbox();
    initContactForm();
});

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Mobile nav toggle
const navToggle = document.querySelector('.mobile-nav-toggle');
const mainNav = document.getElementById('main-nav');
navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', isOpen);
});
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => mainNav.classList.remove('is-open'));
});

// Scroll progress bar
const progressBar = document.getElementById('scroll-progress');
window.addEventListener('scroll', () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progressBar.style.width = pct + '%';
});

// Active nav link highlight on scroll
const sections = document.querySelectorAll('main .section[id]');
const navLinks = document.querySelectorAll('.nav-link[data-nav]');
if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === '#' + id);
                });
            }
        });
    }, { rootMargin: '-40% 0px -50% 0px' });
    sections.forEach(s => navObserver.observe(s));
}

// Scroll-reveal animation — only enable the hidden/animated state when the
// browser actually supports IntersectionObserver, so content is never
// silently stuck invisible.
if ('IntersectionObserver' in window) {
    document.documentElement.classList.add('js-anim');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

// Certificate lightbox
const lightbox = document.getElementById('cert-lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxTitle = document.getElementById('lightbox-title');
const lightboxDesc = document.getElementById('lightbox-desc');

document.querySelectorAll('.cert-item').forEach(item => {
    item.addEventListener('click', () => {
        lightboxImg.src = item.dataset.image;
        lightboxTitle.textContent = item.dataset.title;
        lightboxDesc.textContent = item.dataset.desc;
        lightbox.classList.add('is-open');
        lightbox.setAttribute('aria-hidden', 'false');
    });
});

function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
}
document.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

// Contact form (Formspree) — graceful fallback if not configured yet
const form = document.getElementById('contact-form');
const feedback = document.getElementById('form-feedback');
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('form-submit-btn');
        btn.disabled = true;
        btn.textContent = 'Sending…';
        try {
            const res = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { 'Accept': 'application/json' }
            });
            if (res.ok) {
                feedback.textContent = "Thanks — I'll get back to you soon.";
                form.reset();
            } else {
                feedback.textContent = 'Something went wrong. Please email me directly.';
            }
        } catch (err) {
            feedback.textContent = 'Something went wrong. Please email me directly.';
        }
        btn.disabled = false;
        btn.textContent = 'Send message';
    });
}

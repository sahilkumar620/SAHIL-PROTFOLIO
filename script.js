document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- Typing effect ---------- */
const roles = ['Data Analytics Enthusiast', 'Python Developer', 'Dashboard Builder'];
const typedEl = document.getElementById('typed-role');
let roleIndex = 0, charIndex = 0, deleting = false;

function typeLoop() {
    const current = roles[roleIndex];
    if (!deleting) {
        charIndex++;
        typedEl.textContent = current.slice(0, charIndex);
        if (charIndex === current.length) {
            deleting = true;
            setTimeout(typeLoop, 1400);
            return;
        }
    } else {
        charIndex--;
        typedEl.textContent = current.slice(0, charIndex);
        if (charIndex === 0) {
            deleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
        }
    }
    setTimeout(typeLoop, deleting ? 40 : 70);
}
if (typedEl) typeLoop();

/* ---------- Mobile nav ---------- */
const mobileToggle = document.getElementById('mobile-toggle');
const navbarInner = document.querySelector('.navbar-inner');
mobileToggle.addEventListener('click', () => {
    const isOpen = navbarInner.classList.toggle('is-open');
    mobileToggle.setAttribute('aria-expanded', isOpen);
});
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => navbarInner.classList.remove('is-open'));
});

/* ---------- Active nav highlight ---------- */
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

/* ---------- Scroll reveal (fail-safe: content visible without JS) ---------- */
if ('IntersectionObserver' in window) {
    document.documentElement.classList.add('js-anim');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

/* ---------- Back to top ---------- */
const backToTop = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 500);
});
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ---------- Contact form (Formspree) ---------- */
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
            feedback.textContent = res.ok
                ? "Thanks — I'll get back to you soon."
                : 'Something went wrong. Please email me directly.';
            if (res.ok) form.reset();
        } catch (err) {
            feedback.textContent = 'Something went wrong. Please email me directly.';
        }
        btn.disabled = false;
        btn.textContent = 'Send Message';
    });
}

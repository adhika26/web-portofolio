import './style.css';

/* ---------- Typing effect ---------- */
const roles = [
    'Web Developer',
    'Information Systems Graduate',
    'Tech Enthusiast',
];

let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;

const typedTextElement = document.getElementById('typed-text');
const typingSpeed = 90;
const deletingSpeed = 45;
const delayBetweenRoles = 2000;

function typeEffect() {
    if (!typedTextElement) return;

    const currentRole = roles[roleIndex];

    if (isDeleting) {
        typedTextElement.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typedTextElement.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
    }

    let nextSpeed = isDeleting ? deletingSpeed : typingSpeed;

    if (!isDeleting && charIndex === currentRole.length) {
        nextSpeed = delayBetweenRoles;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        nextSpeed = 400;
    }

    setTimeout(typeEffect, nextSpeed);
}

/* ---------- Mobile menu ---------- */
function initMobileMenu() {
    const mobileBtn = document.getElementById('mobile-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const navbar = document.getElementById('navbar');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    function closeMobileMenu() {
        if (!mobileMenu || !navbar) return;
        mobileMenu.classList.add('hidden');
        mobileMenu.classList.remove('flex');
        navbar.classList.add('rounded-full');
        navbar.classList.remove('rounded-2xl');
    }

    mobileBtn?.addEventListener('click', () => {
        if (!mobileMenu || !navbar) return;
        mobileMenu.classList.toggle('hidden');
        mobileMenu.classList.toggle('flex');

        if (mobileMenu.classList.contains('flex')) {
            navbar.classList.remove('rounded-full');
            navbar.classList.add('rounded-2xl');
        } else {
            navbar.classList.add('rounded-full');
            navbar.classList.remove('rounded-2xl');
        }
    });

    mobileLinks.forEach((link) => link.addEventListener('click', closeMobileMenu));
}

/* ---------- Skill filtering ---------- */
function initSkillFilter() {
    const skillTabs = document.querySelectorAll('.skill-tab');
    const techCards = document.querySelectorAll('.tech-card');

    skillTabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            skillTabs.forEach((t) => t.classList.remove('is-active'));
            tab.classList.add('is-active');

            const filter = tab.dataset.filter;

            techCards.forEach((card) => {
                const matches = filter === 'all' || card.dataset.category === filter;
                card.classList.toggle('is-hidden', !matches);
            });
        });
    });
}

/* ---------- Contact form (mailto) ---------- */
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();

        const subject = encodeURIComponent(`Portfolio contact from ${name || 'someone'}`);
        const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);

        window.location.href = `mailto:adhikaseptian5@gmail.com?subject=${subject}&body=${body}`;
    });
}

/* ---------- Scroll reveal ---------- */
function initScrollReveal() {
    const revealTargets = document.querySelectorAll(
        '#skills, #portfolio, #certificates, #services, #contact, .tech-card, .project-card, .cert-card, .service-card'
    );

    revealTargets.forEach((el) => el.classList.add('reveal'));

    if (!('IntersectionObserver' in window)) {
        revealTargets.forEach((el) => el.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12 }
    );

    revealTargets.forEach((el) => observer.observe(el));
}

/* ---------- Footer year ---------- */
function setYear() {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/* ---------- Boot ---------- */
initMobileMenu();
initSkillFilter();
initContactForm();
initScrollReveal();
setYear();

setTimeout(typeEffect, 900);

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
    const iconOpen = document.getElementById('mobile-icon-open');
    const iconClose = document.getElementById('mobile-icon-close');

    function setMenuState(isOpen) {
        if (!mobileMenu || !navbar) return;

        mobileMenu.classList.toggle('hidden', !isOpen);
        mobileMenu.classList.toggle('flex', isOpen);
        navbar.classList.toggle('rounded-full', !isOpen);
        navbar.classList.toggle('rounded-2xl', isOpen);

        if (!mobileBtn) return;
        mobileBtn.setAttribute('aria-expanded', String(isOpen));
        mobileBtn.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');

        iconOpen?.classList.toggle('hidden', isOpen);
        iconOpen?.classList.toggle('flex', !isOpen);
        iconClose?.classList.toggle('hidden', !isOpen);
        iconClose?.classList.toggle('flex', isOpen);
    }

    function closeMobileMenu() {
        setMenuState(false);
    }

    mobileBtn?.addEventListener('click', () => {
        setMenuState(!mobileMenu?.classList.contains('flex'));
    });

    mobileLinks.forEach((link) => link.addEventListener('click', closeMobileMenu));

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && mobileMenu?.classList.contains('flex')) {
            closeMobileMenu();
            mobileBtn?.focus();
        }
    });

    document.addEventListener('click', (event) => {
        if (!mobileMenu?.classList.contains('flex')) return;
        if (navbar?.contains(event.target) || mobileBtn?.contains(event.target)) return;
        closeMobileMenu();
    });
}

/* ---------- Skill filtering ---------- */
function initSkillFilter() {
    const skillTabs = document.querySelectorAll('.skill-tab');
    const techCards = document.querySelectorAll('.tech-card');

    skillTabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            skillTabs.forEach((t) => {
                t.classList.remove('is-active');
                t.setAttribute('aria-pressed', 'false');
            });
            tab.classList.add('is-active');
            tab.setAttribute('aria-pressed', 'true');

            const filter = tab.dataset.filter;

            techCards.forEach((card) => {
                const matches = filter === 'all' || card.dataset.category === filter;
                card.classList.toggle('is-hidden', !matches);
            });
        });
    });
}

/* ---------- CV dropdown ---------- */
function initCvDropdown() {
    const dropdowns = document.querySelectorAll('[data-cv-dropdown]');

    function closeDropdown(dropdown) {
        const toggle = dropdown.querySelector('[data-cv-toggle]');
        const menu = dropdown.querySelector('[data-cv-menu]');
        dropdown.classList.remove('is-open');
        toggle?.setAttribute('aria-expanded', 'false');
        menu?.classList.add('hidden');
    }

    dropdowns.forEach((dropdown) => {
        const toggle = dropdown.querySelector('[data-cv-toggle]');
        const menu = dropdown.querySelector('[data-cv-menu]');
        if (!toggle || !menu) return;

        toggle.addEventListener('click', (event) => {
            event.stopPropagation();
            const isOpen = dropdown.classList.contains('is-open');

            dropdowns.forEach((other) => closeDropdown(other));

            if (!isOpen) {
                dropdown.classList.add('is-open');
                toggle.setAttribute('aria-expanded', 'true');
                menu.classList.remove('hidden');
            }
        });

        menu.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => closeDropdown(dropdown));
        });

        dropdown.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeDropdown(dropdown);
                toggle.focus();
            }
        });
    });

    document.addEventListener('click', () => {
        dropdowns.forEach((dropdown) => closeDropdown(dropdown));
    });
}

/* ---------- Contact form (validated mailto + fallback) ---------- */
function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const messageInput = document.getElementById('message');
    const statusEl = document.getElementById('form-status');
    const fallbackEl = document.getElementById('mail-fallback');
    const mailtoLink = document.getElementById('mailto-link');
    const copyButton = document.getElementById('copy-message');
    const messageCount = document.getElementById('message-count');

    if (!nameInput || !emailInput || !messageInput) return;

    const fields = { name: nameInput, email: emailInput, message: messageInput };
    const errors = {
        name: document.getElementById('name-error'),
        email: document.getElementById('email-error'),
        message: document.getElementById('message-error'),
    };

    const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

    const rules = {
        name(value) {
            if (!value) return 'Nama wajib diisi.';
            if (value.length < 2) return 'Nama minimal 2 karakter.';
            if (value.length > 100) return 'Nama maksimal 100 karakter.';
            return '';
        },
        email(value) {
            if (!value) return 'Email wajib diisi.';
            if (value.length > 254) return 'Email maksimal 254 karakter.';
            if (/\s/.test(value) || value.includes('..')) return 'Format email tidak valid.';
            if (!EMAIL_PATTERN.test(value)) return 'Gunakan format email yang valid, contoh: nama@email.com.';
            return '';
        },
        message(value) {
            if (!value) return 'Pesan wajib diisi.';
            if (value.length < 10) return 'Pesan minimal 10 karakter.';
            if (value.length > 2000) return 'Pesan maksimal 2000 karakter.';
            return '';
        },
    };

    function setError(key, message) {
        const input = fields[key];
        const errorEl = errors[key];
        if (!input || !errorEl) return;

        input.setAttribute('aria-invalid', message ? 'true' : 'false');
        errorEl.textContent = message;
        errorEl.hidden = !message;
    }

    function validateField(key) {
        const value = fields[key].value.trim();
        const message = rules[key](value);
        setError(key, message);
        return !message;
    }

    function validateAll() {
        const results = Object.keys(fields).map(validateField);
        return results.every(Boolean);
    }

    function updateMessageCount() {
        if (!messageCount) return;
        messageCount.textContent = `${messageInput.value.length} / 2000`;
    }

    function setStatus(message, type) {
        if (!statusEl) return;
        statusEl.textContent = message;
        statusEl.hidden = !message;
        statusEl.classList.toggle('is-error', type === 'error');
        statusEl.classList.toggle('is-success', type === 'success');
    }

    async function copyText(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {
            const helper = document.createElement('textarea');
            helper.value = text;
            helper.setAttribute('readonly', '');
            helper.style.position = 'fixed';
            helper.style.opacity = '0';
            document.body.appendChild(helper);
            helper.select();
            const copied = document.execCommand('copy');
            helper.remove();
            return copied;
        }
    }

    Object.entries(fields).forEach(([key, input]) => {
        input.addEventListener('input', () => {
            if (key === 'message') updateMessageCount();
            if (input.getAttribute('aria-invalid') === 'true') validateField(key);
        });

        input.addEventListener('blur', () => {
            if (input.value.trim()) validateField(key);
        });
    });

    updateMessageCount();

    contactForm.addEventListener('submit', (event) => {
        event.preventDefault();
        setStatus('', null);
        if (fallbackEl) fallbackEl.hidden = true;

        if (!validateAll()) {
            const firstInvalid = Object.keys(fields).find(
                (key) => fields[key].getAttribute('aria-invalid') === 'true'
            );
            setStatus('Form belum valid. Periksa kolom yang ditandai.', 'error');
            fields[firstInvalid]?.focus();
            return;
        }

        const name = nameInput.value.trim().replace(/\s+/g, ' ');
        const email = emailInput.value.trim();
        const message = messageInput.value.trim();
        const subject = `Portfolio contact from ${name}`;
        const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
        const mailto = `mailto:adhikaseptian5@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        if (mailtoLink) mailtoLink.href = mailto;
        if (copyButton) {
            copyButton.dataset.message = `To: adhikaseptian5@gmail.com\nSubject: ${subject}\n\n${body}`;
        }

        window.location.href = mailto;
        setStatus('Pesan siap dikirim. Aplikasi email Anda seharusnya sudah terbuka.', 'success');
        if (fallbackEl) fallbackEl.hidden = false;
    });

    copyButton?.addEventListener('click', async () => {
        const text = copyButton.dataset.message || '';
        if (!text) return;

        const copied = await copyText(text);
        copyButton.textContent = copied ? 'Copied!' : 'Copy failed';
        window.setTimeout(() => {
            copyButton.textContent = 'Copy message';
        }, 2000);
    });
}

/* ---------- Scroll reveal ---------- */
function initScrollReveal() {
    const revealTargets = document.querySelectorAll(
        '.tech-card, .project-card, .cert-card, .service-card'
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
initCvDropdown();
initContactForm();
initScrollReveal();
setYear();

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (prefersReducedMotion && typedTextElement) {
    typedTextElement.textContent = roles[0];
} else {
    setTimeout(typeEffect, 900);
}

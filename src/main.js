import './style.css';

const roles = [
    "Web Developer",
    "Information Systems Graduate",
    "Tech Enthusiast"
];

let roleIndex = 0; 
let charIndex = 0; 
let isDeleting = false; 

const typedTextElement = document.getElementById('typed-text');

const typingSpeed = 100;
const deletingSpeed = 50;
const delayBetweenRoles = 2000; 

function typeEffect() {
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
        roleIndex++;
        
        if(roleIndex >= roles.length) {
            roleIndex = 0;
        }
        nextSpeed = 500; 
    }

    setTimeout(typeEffect, nextSpeed);
}

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(typeEffect, 1000);
});

// --- Logika Menu Mobile ---
const mobileBtn = document.getElementById('mobile-btn');
const mobileMenu = document.getElementById('mobile-menu');
const navbar = document.getElementById('navbar');
const mobileLinks = document.querySelectorAll('.mobile-link');

mobileBtn.addEventListener('click', () => {
    // Membuka atau menutup menu
    mobileMenu.classList.toggle('hidden');
    mobileMenu.classList.toggle('flex');
    
    // Mengubah bentuk navbar dari bulat (pil) menjadi kotak bersudut tumpul saat terbuka
    if (mobileMenu.classList.contains('flex')) {
        navbar.classList.remove('rounded-full');
        navbar.classList.add('rounded-2xl');
    } else {
        navbar.classList.add('rounded-full');
        navbar.classList.remove('rounded-2xl');
    }
});

// Menutup menu otomatis saat salah satu link diklik
mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        mobileMenu.classList.remove('flex');
        navbar.classList.add('rounded-full');
        navbar.classList.remove('rounded-2xl');
    });
});
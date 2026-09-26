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
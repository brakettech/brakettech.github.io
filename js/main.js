// ================================================
// Braket Technologies - Main JavaScript
// ================================================

(function () {
    'use strict';

    // ---- CONFIGURATION ----
    // TODO: Replace this with your Formspree form ID after account setup
    const FORMSPREE_FORM_ID = 'xnjbpkjw'; // Replace with your Formspree form ID (e.g., 'abc123xyz')

    // ---- DOM REFERENCES ----
    const openModalBtn = document.getElementById('openModal');
    const closeModalBtn = document.getElementById('closeModal');
    const modalOverlay = document.getElementById('modalOverlay');
    const contactForm = document.getElementById('contactForm');
    const successState = document.getElementById('successState');
    const submitBtn = document.getElementById('submitBtn');

    // ---- MODAL LOGIC ----
    function openModal() {
        modalOverlay.hidden = false;
        // Force reflow then add visible class for CSS transition
        requestAnimationFrame(() => {
            modalOverlay.classList.add('is-visible');
        });
        document.body.style.overflow = 'hidden';
        // Trap focus inside modal
        closeModalBtn.focus();
        document.addEventListener('keydown', handleEscKey);
    }

    function closeModal() {
        modalOverlay.classList.remove('is-visible');
        modalOverlay.addEventListener('transitionend', function handler() {
            modalOverlay.hidden = true;
            modalOverlay.removeEventListener('transitionend', handler);
            // Reset form and states
            contactForm.reset();
            contactForm.hidden = false;
            successState.hidden = true;
            clearAllErrors();
        }, { once: true });
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEscKey);
        openModalBtn.focus(); // Return focus to trigger
    }

    function handleEscKey(e) {
        if (e.key === 'Escape') closeModal();
    }

    openModalBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', function (e) {
        if (e.target === modalOverlay) closeModal();
    });

    // ---- FORM VALIDATION ----
    const validators = {
        firstName: (v) => v.trim() ? '' : 'First name is required',
        lastName:  (v) => v.trim() ? '' : 'Last name is required',
        company:   (v) => v.trim() ? '' : 'Company is required',
        email:     (v) => {
            if (!v.trim()) return 'Email is required';
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email';
            return '';
        },
        message:   (v) => v.trim() ? '' : 'Message is required',
    };

    function validateField(name) {
        const input = contactForm.elements[name];
        const error = input.closest('.form-group').querySelector('.form-error');
        const msg = validators[name](input.value);
        error.textContent = msg;
        input.classList.toggle('is-invalid', !!msg);
        return !msg;
    }

    function validateAll() {
        let valid = true;
        Object.keys(validators).forEach((name) => {
            if (!validateField(name)) valid = false;
        });
        return valid;
    }

    function clearAllErrors() {
        contactForm.querySelectorAll('.form-error').forEach(el => el.textContent = '');
        contactForm.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    }

    // Live validation on blur
    Object.keys(validators).forEach((name) => {
        const element = contactForm.elements[name];
        if (element) {
            element.addEventListener('blur', () => validateField(name));
        }
    });

    // ---- FORM SUBMISSION ----
    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        if (!validateAll()) return;

        // Check if Formspree is configured
        if (FORMSPREE_FORM_ID === 'YOUR_FORM_ID') {
            alert('Formspree is not configured yet. Please update FORMSPREE_FORM_ID in js/main.js.\n\nFor now, here are the form details:\n\n' +
                'Name: ' + contactForm.elements.firstName.value + ' ' + contactForm.elements.lastName.value + '\n' +
                'Company: ' + contactForm.elements.company.value + '\n' +
                'Email: ' + contactForm.elements.email.value + '\n' +
                'Message: ' + contactForm.elements.message.value
            );
            // Show success for demo purposes
            contactForm.hidden = true;
            successState.hidden = false;
            return;
        }

        // Show loading state
        submitBtn.querySelector('.form__submit-text').hidden = true;
        submitBtn.querySelector('.form__submit-spinner').hidden = false;
        submitBtn.disabled = true;

        // Prepare form data
        const formData = new FormData();
        formData.append('firstName', contactForm.elements.firstName.value.trim());
        formData.append('lastName', contactForm.elements.lastName.value.trim());
        formData.append('company', contactForm.elements.company.value.trim());
        formData.append('email', contactForm.elements.email.value.trim());
        formData.append('message', contactForm.elements.message.value.trim());

        try {
            const response = await fetch(`https://formspree.io/f/${FORMSPREE_FORM_ID}`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // Show success
                contactForm.hidden = true;
                successState.hidden = false;
            } else {
                throw new Error('Form submission failed');
            }
        } catch (err) {
            console.error('Formspree error:', err);
            alert('Something went wrong. Please try again or email scott@brakettech.com directly.');
        } finally {
            submitBtn.querySelector('.form__submit-text').hidden = false;
            submitBtn.querySelector('.form__submit-spinner').hidden = true;
            submitBtn.disabled = false;
        }
    });
})();

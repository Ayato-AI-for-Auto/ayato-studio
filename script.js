document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll for anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    const sections = document.querySelectorAll('.card, .project-card, .section-title');
    sections.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });
    // --- Config Loading ---
    const applyConfig = () => {
        if (typeof CONFIG === 'undefined') {
            console.warn("Config not loaded");
            return;
        }

        // Apply X (Twitter) Link
        const xLinks = document.querySelectorAll('.x-link, a[href*="twitter.com"]');
        xLinks.forEach(el => el.href = CONFIG.X_URL);

        // Apply Email Link
        const emailLinks = document.querySelectorAll('.email-link, a[href^="mailto:"]');
        emailLinks.forEach(el => el.href = `mailto:${CONFIG.EMAIL}`);

        // Update CTA Text if needed (Example)
        const ctaBtn = document.querySelector('.cta-button');
        if (ctaBtn && CONFIG.X_URL) {
            // Extract handle from URL for display if it's a generic link
            // For now, keep the text static or update provided handle manually in HTML is better for design.
            ctaBtn.href = CONFIG.X_URL;
        }
    };

    applyConfig();
});

// 1. ФУНКЦИЯ ПЕРЕВОДА
async function setLanguage(lang) {
    try {
        const isProjectPage = window.location.pathname.includes('/projects/');
        const pathPrefix = isProjectPage ? '../' : './';
        
        const response = await fetch(`${pathPrefix}locales/${lang}.json`);
        if (!response.ok) throw new Error('Translation file not found');
        const translations = await response.json();

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[key]) {
                // Используем innerHTML для поддержки тегов в JSON
                el.innerHTML = translations[key];
            }
        });
        
        localStorage.setItem('lang', lang);
    } catch (error) {
        console.error("Translation error:", error);
    }
}

// 2. ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ
document.addEventListener('DOMContentLoaded', () => {
    const langSelect = document.getElementById('lang-select');
    const savedLang = localStorage.getItem('lang') || 'en';

    // Сразу переводим любую страницу (главную или в папке projects)
    setLanguage(savedLang); 

    if (langSelect) {
        langSelect.value = savedLang;
        langSelect.addEventListener('change', (e) => {
            setLanguage(e.target.value);
            // Update button text dynamically if it exists
            updateReadMoreButtonText(e.target.value);
        });
    }

    // --- ЛОГИКА МЕНЮ ---
    const menuBtn = document.getElementById('menu-btn');
    const overlay = document.getElementById('menu-overlay');
    const navLinks = document.querySelectorAll('.mobile-nav a');

    if (menuBtn && overlay) {
        menuBtn.addEventListener('click', () => overlay.classList.toggle('active'));
        document.addEventListener('click', (e) => {
            if (!overlay.contains(e.target) && !menuBtn.contains(e.target)) {
                overlay.classList.remove('active');
            }
        });
        navLinks.forEach(link => link.addEventListener('click', () => overlay.classList.remove('active')));
    }

    // --- READ MORE LOGIC ---
    const readMoreBtn = document.getElementById('read-more-btn');
    const hideDetailsBtn = document.getElementById('hide-details-btn');
    const projectDetails = document.getElementById('project-details');

    if (readMoreBtn && projectDetails) {
        readMoreBtn.addEventListener('click', () => {
            projectDetails.classList.add('expanded');
            // Hide the Read More button itself
            readMoreBtn.parentElement.style.display = 'none';
            
            // Smooth scroll to the details section with a slight offset
            setTimeout(() => {
                const headerOffset = 100;
                const elementPosition = projectDetails.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }, 100);
        });
    }

    if (hideDetailsBtn && projectDetails) {
        hideDetailsBtn.addEventListener('click', () => {
            projectDetails.classList.remove('expanded');
            // Show the Read More button again
            if (readMoreBtn) {
                readMoreBtn.parentElement.style.display = 'flex';
                // Scroll back to the Read More button
                readMoreBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }

    // --- SIDEBAR ACTIVE STATE LOGIC ---
    const sections = document.querySelectorAll('.details-content section');
    const navLinksList = document.querySelectorAll('.toc a');

    if (sections.length > 0 && navLinksList.length > 0) {
        window.addEventListener('scroll', () => {
            let current = '';
            const scrollY = window.scrollY;
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                // Offset for fixed header (approx 100px)
                if (scrollY >= (sectionTop - 150)) {
                    current = section.getAttribute('id');
                }
            });

            navLinksList.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href').includes(current)) {
                    link.classList.add('active');
                }
            });
        });
    }
});

function updateReadMoreButtonText(lang) {
    // This function is less critical now that we hide the button,
    // but useful if we ever switch back to a toggle style.
    const readMoreBtn = document.getElementById('read-more-btn');
    if (readMoreBtn) {
        // Just refresh translation
        setLanguage(lang);
    }
}

// --- ТВОИ АНИМАЦИИ (REVEAL & ZOOM) ---
const revealItems = document.querySelectorAll(".reveal");
const zoomSections = document.querySelectorAll(".scroll-zoom");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const element = entry.target;
        const delay = element.dataset.delay ? Number(element.dataset.delay) : 0;
        window.setTimeout(() => { element.classList.add("is-visible"); }, delay);
        observer.unobserve(element);
    });
}, { root: null, rootMargin: "0px 0px -10% 0px", threshold: 0.2 });

revealItems.forEach((item, index) => {
    item.dataset.delay = String(index * 80);
    revealObserver.observe(item);
});

if (!prefersReducedMotion && zoomSections.length > 0) {
    let rafId = 0;
    const updateScrollZoom = () => {
        const viewportHeight = window.innerHeight;
        zoomSections.forEach((section) => {
            const rect = section.getBoundingClientRect();
            const distance = viewportHeight - rect.top;
            const progress = Math.min(Math.max(distance / (viewportHeight * 0.9), 0), 1);
            const scale = 0.955 + progress * 0.045;
            const translateY = (1 - progress) * 32;
            section.style.setProperty("--scroll-scale", scale.toFixed(3));
            section.style.setProperty("--scroll-y", `${translateY.toFixed(1)}px`);
        });
        rafId = 0;
    };
    const onScroll = () => {
        if (rafId !== 0) return;
        rafId = window.requestAnimationFrame(updateScrollZoom);
    };
    updateScrollZoom();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
}

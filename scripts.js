async function setLanguage(lang) {
    try {
        const path = window.location.pathname;
        let pathPrefix = './';

        if (path.includes('/Auto.Tg/') || path.includes('/What_is/')) {
            pathPrefix = '../../'; 
        } else if (path.includes('/projects/')) {
            pathPrefix = '../';   
        }
        
        const response = await fetch(`${pathPrefix}locales/${lang}.json`);
        if (!response.ok) throw new Error('Translation file not found');
        const translations = await response.json();

        const urlParams = new URLSearchParams(window.location.search);
        const techId = urlParams.get('id');
        const fromSource = urlParams.get('from');

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            let text = "";

            if (techId && translations[techId]) {
                if (fromSource === 'project-automation') {
                    if (key === "full-sec-project-case-text") {
                        text = translations[techId][key];
                        if (el.closest('article')) el.closest('article').style.display = 'block';
                    } else if (key === "full-sec-project-case-title") {
                        text = translations[techId]["full-sec-project-case-title"];
                        if (el.closest('article')) el.closest('article').style.display = 'block';
                    } else if (key.startsWith("full-sec-1") || key.startsWith("full-sec-2")) {
                        if (el.closest('article')) el.closest('article').style.display = 'none';
                    } else {
                        text = translations[techId][key] || translations[key];
                    }
                } else {
                    if (key.includes("project-case")) {
                        if (el.closest('article')) el.closest('article').style.display = 'none';
                    } else {
                        text = translations[techId][key] || translations[key];
                        if (el.closest('article')) el.closest('article').style.display = 'block';
                    }
                }
            } else {
                text = translations[key];
            }

            if (text) el.innerHTML = text;
        });
        
        localStorage.setItem('lang', lang);
    } catch (error) {
        console.error("Translation error:", error);
    }
}






document.addEventListener('DOMContentLoaded', () => {
    const langSelect = document.getElementById('lang-select');
    const savedLang = localStorage.getItem('lang') || 'en';

    setLanguage(savedLang); 

    if (langSelect) {
        langSelect.value = savedLang;
        langSelect.addEventListener('change', (e) => {
            setLanguage(e.target.value);
            updateReadMoreButtonText(e.target.value);
        });
    }

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

    const readMoreBtn = document.getElementById('read-more-btn');
    const hideDetailsBtn = document.getElementById('hide-details-btn');
    const projectDetails = document.getElementById('project-details');

    if (readMoreBtn && projectDetails) {
        readMoreBtn.addEventListener('click', () => {
            projectDetails.classList.add('expanded');
            readMoreBtn.parentElement.style.display = 'none';
            
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
            if (readMoreBtn) {
                readMoreBtn.parentElement.style.display = 'flex';
                readMoreBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }

    const sections = document.querySelectorAll('.details-content section');
    const navLinksList = document.querySelectorAll('.toc a, .mobile-toc a');

    if (sections.length > 0 && navLinksList.length > 0) {
        const observerOptions = {
            root: null,
            rootMargin: '-15% 0px -80% 0px', 
            threshold: 0
        };

const observerCallback = (entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            
            navLinksList.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${id}`) {
                    link.classList.add('active');
                    if (link.classList.contains('toc-item')) {
                        link.parentElement.scrollTo({
                            left: link.offsetLeft - (link.parentElement.offsetWidth / 2) + (link.offsetWidth / 2),
                            behavior: 'smooth'
                        });
                    }
                }
            });
        }
    });
};

        const observer = new IntersectionObserver(observerCallback, observerOptions);
        sections.forEach(section => observer.observe(section));
    }
});

function updateReadMoreButtonText(lang) {
    const readMoreBtn = document.getElementById('read-more-btn');
    if (readMoreBtn) {
        setLanguage(lang);
    }
}

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

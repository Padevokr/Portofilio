async function setLanguage(lang) {
    try {
        const path = window.location.pathname;
        const normalizedPath = path.endsWith('/') ? `${path}index.html` : path;
        const segments = normalizedPath.split('/').filter(Boolean);
        const fileDepth = Math.max(0, segments.length - 1);
        const pathPrefix = fileDepth === 0 ? './' : '../'.repeat(fileDepth);
        
        const response = await fetch(`${pathPrefix}locales/${lang}.json?v=20260307`, {
            cache: 'no-store'
        });
        if (!response.ok) throw new Error('Translation file not found');
        const translations = await response.json();
        
        const urlParams = new URLSearchParams(window.location.search);
        const techId = urlParams.get('id');
        const fromSource = urlParams.get('from');

	        const backLink = document.getElementById('dynamic-back-link');
	        if (backLink) {
	            if (fromSource === 'project-automation') {
	                backLink.href = "../Auto.Tg/project-automation.html#d-stack";
	                backLink.setAttribute('data-i18n', 'back-to-Giveaway-Bot-&-Admin-Dashboard'); 
	            } else if (fromSource === 'project-ai-userbot') {
	                backLink.href = "../AI.Userbot/project-ai-userbot.html#ai-stack";
	                backLink.setAttribute('data-i18n', 'back-to-Dekrov-AI-Userbot');
	            } else {
	                backLink.href = "../../index.html";
	                backLink.setAttribute('data-i18n', 'back-to-home');   
	            }
        }

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

        document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
            const key = el.getAttribute('data-i18n-aria-label');
            const text = translations[key];
            if (text) {
                el.setAttribute('aria-label', text);
            }
        });

        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            const text = translations[key];
            if (text) {
                el.setAttribute('title', text);
            }
        });

        document.querySelectorAll('[data-i18n-content]').forEach(el => {
            const key = el.getAttribute('data-i18n-content');
            const text = translations[key];
            if (text) {
                el.setAttribute('content', text);
            }
        });
        
        localStorage.setItem('lang', lang);
    } catch (error) {
        console.error("Translation error:", error);
    }
}

function initGridEffects() {
    const grid = document.querySelector('.bg-grid');
    if (!grid) return;
    const desktopEffectsMedia = window.matchMedia('(min-width: 768px) and (pointer: fine) and (hover: hover)');

    if (prefersReducedMotion || !desktopEffectsMedia.matches) return;

    const pulsePool = Array.from({ length: 5 }, () => {
        const pulse = document.createElement('span');
        pulse.className = 'grid-pulse';
        pulse.setAttribute('aria-hidden', 'true');
        pulse.addEventListener('animationend', () => {
            pulse.className = 'grid-pulse';
        });
        grid.appendChild(pulse);
        return pulse;
    });

    const triggerPulse = () => {
        const pulse = pulsePool.find((item) => !item.classList.contains('is-active'))
            || pulsePool[Math.floor(Math.random() * pulsePool.length)];

        const gridSize = parseFloat(getComputedStyle(grid).getPropertyValue('--grid-size')) || 60;
        const isVertical = Math.random() > 0.45;
        const lineCount = isVertical
            ? Math.max(1, Math.ceil(window.innerWidth / gridSize))
            : Math.max(1, Math.ceil(window.innerHeight / gridSize));
        const lineIndex = Math.floor(Math.random() * lineCount);
        const lineOffset = lineIndex * gridSize;
        const viewportSpan = isVertical ? window.innerHeight : window.innerWidth;
        const pulseLength = Math.max(120, Math.min(Math.round(viewportSpan * (0.14 + Math.random() * 0.12)), 280));
        const pulseDuration = Math.round(1600 + Math.random() * 1900);

        pulse.className = 'grid-pulse';
        pulse.style.setProperty('--line-offset', `${lineOffset}px`);
        pulse.style.setProperty('--pulse-length', `${pulseLength}px`);
        pulse.style.setProperty('--pulse-duration', `${pulseDuration}ms`);
        pulse.classList.add(isVertical ? 'is-vertical' : 'is-horizontal');

        void pulse.offsetWidth;
        pulse.classList.add('is-active');
    };

    const schedulePulse = () => {
        triggerPulse();
        const nextDelay = 1200 + Math.random() * 2600;
        window.setTimeout(schedulePulse, nextDelay);
    };

    window.setTimeout(schedulePulse, 900);
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
	    const expandProjectDetails = () => {
	        if (!projectDetails) return;
	        projectDetails.classList.add('expanded');
	        if (readMoreBtn?.parentElement) {
	            readMoreBtn.parentElement.style.display = 'none';
	        }
	    };

	    const scrollToHashSection = () => {
	        if (!projectDetails || !window.location.hash) return;
	        const hashTarget = document.querySelector(window.location.hash);
	        if (!hashTarget || !projectDetails.contains(hashTarget)) return;

	        expandProjectDetails();
	        window.setTimeout(() => {
	            hashTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
	        }, 120);
	    };

	    if (readMoreBtn && projectDetails) {
	        readMoreBtn.addEventListener('click', () => {
	            expandProjectDetails();
	            
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

	    scrollToHashSection();
	    window.addEventListener('hashchange', scrollToHashSection);

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

    initGridEffects();
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
            const translateY = Math.round((1 - progress) * 18);
            section.style.setProperty("--scroll-scale", "1");
            section.style.setProperty("--scroll-y", `${translateY}px`);
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

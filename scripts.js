const PROJECT_CASE_CONFIG = {
    "project-automation": {
        titleKey: "full-sec-project-case-title",
        textKey: "full-sec-project-case-text",
        hideGenericSections: true
    },
    "project-ai-userbot": {
        titleKey: "project-ai-userbot-case-title",
        textKey: "project-ai-userbot-case-text",
        hideGenericSections: false
    },
    "project-visitor-ai": {
        titleKey: "project-visitor-ai-case-title",
        textKey: "project-visitor-ai-case-text",
        hideGenericSections: false
    }
};

const PROJECT_CASE_FALLBACKS = {
    "project-ai-userbot": {
        "python": {
            title: "Project Application: Dekrov AI Userbot",
            text: "In Dekrov AI Userbot, Python is the orchestration layer for command parsing, memory, reminders, action routing, chat-bot support, and owner workflows. The value here is not just language familiarity but the ability to keep one Telegram-native system modular while it coordinates AI, automation, and runtime state in one process."
        },
        "pyrogram": {
            title: "Project Application: Dekrov AI Userbot",
            text: "Pyrogram is what makes the userbot side possible. Dekrov AI Userbot works through the owner's real Telegram account, so dialog access, media handling, cross-chat actions, and account-level automation all depend on a client library that exposes Telegram beyond the regular Bot API."
        },
        "groq": {
            title: "Project Application: Dekrov AI Userbot",
            text: "Groq is the inference layer behind dialogue, .b tasks, transcription, vision, and model fallback inside the userbot ecosystem. In this project, speed matters because the assistant is part of a live Telegram workflow where answers, tools, and action planning need to stay responsive."
        },
        "asyncio": {
            title: "Project Application: Dekrov AI Userbot",
            text: "Asyncio is the architectural backbone of Dekrov AI Userbot: reminders, live requests, background jobs, auto-replies, and command execution all coexist in one persistent runtime. The project uses asynchrony as a system design choice, not as a small implementation detail."
        },
        "httpx": {
            title: "Project Application: Dekrov AI Userbot",
            text: "HTTPX is the network layer for live tools, retrieval, and grounded answers inside Dekrov AI Userbot. Search, rates, weather, article fetching, and other external lookups all depend on a client that behaves predictably inside an async assistant pipeline."
        },
        "json-persistence": {
            title: "Project Application: Dekrov AI Userbot",
            text: "JSON persistence is part of why Dekrov AI Userbot stays portable: runtime state, owner knowledge, reminders, memory layers, and control settings can survive restarts without a separate database server. That tradeoff matches the product well because it keeps inspection, backup, and deployment straightforward."
        }
    },
    "project-visitor-ai": {
        "python": {
            title: "Project Application: Visitor AI Assistant",
            text: "In Visitor AI Assistant, Python holds together the public consultation flow: session lifecycle, moderation counters, drift detection, request drafting, and owner handoff all live in the same runtime. It is the layer that keeps the assistant helpful and structured instead of turning into a loose generic chatbot."
        },
        "aiogram": {
            title: "Project Application: Visitor AI Assistant",
            text: "Aiogram is the transport layer of the visitor assistant: consultation start buttons, callbacks, moderation actions, and public chat routing are all built around bot-first interaction patterns. That makes it a strong fit for a visitor product that must feel responsive while still preserving clear boundaries."
        },
        "groq": {
            title: "Project Application: Visitor AI Assistant",
            text: "In the visitor layer, Groq powers consultation replies, request drafting, and quality review of public-facing answers. Here the goal is not just raw generation, but fast and stable guidance during the first contact with a visitor."
        },
        "asyncio": {
            title: "Project Application: Visitor AI Assistant",
            text: "Visitor AI Assistant relies on asyncio for concurrent message handling, session updates, cooldowns, and moderation checks. That lets the public assistant stay responsive while still maintaining state and background logic in parallel."
        },
        "json-persistence": {
            title: "Project Application: Visitor AI Assistant",
            text: "For the visitor assistant, JSON persistence stores lightweight session state, moderation state, and review signals without introducing a heavy backend. It keeps the public layer simple to deploy while still letting consultations feel stateful and controlled."
        }
    }
};

async function setLanguage(lang) {
    try {
        const path = window.location.pathname;
        const normalizedPath = path.endsWith('/') ? `${path}index.html` : path;
        const segments = normalizedPath.split('/').filter(Boolean);
        const fileDepth = Math.max(0, segments.length - 1);
        const pathPrefix = fileDepth === 0 ? './' : '../'.repeat(fileDepth);
        const urlParams = new URLSearchParams(window.location.search);
        const techId = urlParams.get('id');
        const fromSource = urlParams.get('from');

        const backLink = document.getElementById('dynamic-back-link');
        let backLinkKey = 'back-to-home';
        if (backLink) {
            if (fromSource === 'project-automation') {
                backLink.href = "../Auto.Tg/project-automation.html#d-stack";
                backLinkKey = 'back-to-Giveaway-Bot-&-Admin-Dashboard';
            } else if (fromSource === 'project-ai-userbot') {
                backLink.href = "../AI.Userbot/project-ai-userbot.html#ai-stack";
                backLinkKey = 'back-to-Dekrov-AI-Userbot';
            } else if (fromSource === 'project-visitor-ai') {
                backLink.href = "../Visitor/project-visitor-ai.html#vis-stack";
                backLinkKey = 'back-to-Visitor-AI-Assistant';
            } else {
                backLink.href = "../../index.html";
            }
            backLink.setAttribute('data-i18n', backLinkKey);
        }
        
        const response = await fetch(`${pathPrefix}locales/${lang}.json?v=20260307`, {
            cache: 'no-store'
        });
        if (!response.ok) throw new Error('Translation file not found');
        const translations = await response.json();

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            let text = "";
            if (techId && translations[techId]) {
                const techTranslations = translations[techId];
                const projectCaseConfig = PROJECT_CASE_CONFIG[fromSource];
                const fallbackGenericProjectTitle = techTranslations["full-sec-project-case-title"] || "";
                const fallbackGenericProjectText = techTranslations["full-sec-project-case-text"] || "";
                const localizedProjectTitle = projectCaseConfig ? techTranslations[projectCaseConfig.titleKey] : "";
                const localizedProjectText = projectCaseConfig ? techTranslations[projectCaseConfig.textKey] : "";
                const fallbackProjectCase = PROJECT_CASE_FALLBACKS[fromSource]?.[techId];
                const resolvedProjectTitle = localizedProjectTitle || fallbackProjectCase?.title || fallbackGenericProjectTitle;
                const resolvedProjectText = localizedProjectText || fallbackProjectCase?.text || fallbackGenericProjectText;
                const hasProjectCase = Boolean(
                    resolvedProjectTitle && resolvedProjectText
                );

                if (projectCaseConfig && projectCaseConfig.hideGenericSections) {
                    if (key === "full-sec-project-case-text") {
                        text = resolvedProjectText;
                        if (el.closest('article')) el.closest('article').style.display = hasProjectCase ? 'block' : 'none';
                    } else if (key === "full-sec-project-case-title") {
                        text = resolvedProjectTitle;
                        if (el.closest('article')) el.closest('article').style.display = hasProjectCase ? 'block' : 'none';
                    } else if (key.startsWith("full-sec-1") || key.startsWith("full-sec-2")) {
                        if (el.closest('article')) el.closest('article').style.display = 'none';
                    } else {
                        text = techTranslations[key] || translations[key];
                    }
                } else {
                    if (key === "full-sec-project-case-title") {
                        text = resolvedProjectTitle;
                        if (el.closest('article')) el.closest('article').style.display = hasProjectCase ? 'block' : 'none';
                    } else if (key === "full-sec-project-case-text") {
                        text = resolvedProjectText;
                        if (el.closest('article')) el.closest('article').style.display = hasProjectCase ? 'block' : 'none';
                    } else {
                        text = techTranslations[key] || translations[key];
                        if (key.includes("project-case") && el.closest('article')) {
                            el.closest('article').style.display = hasProjectCase ? 'block' : 'none';
                        } else if (el.closest('article')) {
                            el.closest('article').style.display = 'block';
                        }
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


// ============================================================
// INSTA CROWN 👑
// FILE: js/pages/about.js
// ABOUT PAGE JAVASCRIPT CONTROLLER
//
// FEATURES:
// 1. About Page Initialization
// 2. Animated Statistics
// 3. FAQ Accordion
// 4. Smooth Section Navigation
// 5. Scroll Reveal Effects
// 6. Team Card Interactions
// 7. Contact Button Navigation
// 8. Copy Email Address
// 9. Social Link Handling
// 10. Back To Top
// 11. Accessibility Support
// 12. Mobile Friendly Interactions
//
// ============================================================

(function () {

    "use strict";


    // --------------------------------------------------------
    // 1. ABOUT CONFIGURATION
    // --------------------------------------------------------

    const AboutConfig = {

        selectors: {

            page: "[data-about-page]",

            statistics: "[data-about-stat]",

            counters: "[data-about-counter]",

            faqItems: "[data-about-faq]",

            faqButtons: "[data-about-faq-button]",

            faqAnswers: "[data-about-faq-answer]",

            revealItems: "[data-about-reveal]",

            sectionLinks: "[data-about-section-link]",

            teamCards: "[data-about-team-card]",

            contactButtons: "[data-about-contact]",

            copyEmailButtons: "[data-copy-email]",

            backToTop: "[data-about-back-top]",

            socialLinks: "[data-about-social]"
        },

        animationDuration: 1600,

        observerThreshold: 0.2,

        defaultEmail: "support@instacrown.com",

        contactPage: "contact.html"
    };


    // --------------------------------------------------------
    // 2. ABOUT PAGE MANAGER
    // --------------------------------------------------------

    class AboutPageManager {

        constructor() {

            this.page = document.querySelector(
                AboutConfig.selectors.page
            );

            this.observers = [];

            this.animatedCounters = new WeakSet();

            this.activeFAQ = null;

            this.init();
        }


        // ----------------------------------------------------
        // 3. INITIALIZATION
        // ----------------------------------------------------

        init() {

            this.bindFAQ();

            this.bindSectionNavigation();

            this.bindContactButtons();

            this.bindEmailCopy();

            this.bindTeamCards();

            this.bindSocialLinks();

            this.bindBackToTop();

            this.initializeCounters();

            this.initializeRevealAnimations();

            this.initializeScrollEffects();

            console.log(
                "Insta Crown About Page Initialized 👑"
            );
        }


        // ----------------------------------------------------
        // 4. FAQ ACCORDION
        // ----------------------------------------------------

        bindFAQ() {

            const buttons = document.querySelectorAll(
                AboutConfig.selectors.faqButtons
            );

            buttons.forEach((button) => {

                button.addEventListener(
                    "click",
                    () => {

                        const item = button.closest(
                            AboutConfig.selectors.faqItems
                        );

                        if (!item) return;

                        this.toggleFAQ(item, button);
                    }
                );


                button.addEventListener(
                    "keydown",
                    (event) => {

                        if (
                            event.key !== "Enter" &&
                            event.key !== " "
                        ) {
                            return;
                        }

                        event.preventDefault();

                        button.click();
                    }
                );

            });
        }


        // ----------------------------------------------------
        // 5. TOGGLE FAQ
        // ----------------------------------------------------

        toggleFAQ(item, button) {

            const answer = item.querySelector(
                AboutConfig.selectors.faqAnswers
            );

            if (!answer) return;


            const isOpen =
                button.getAttribute("aria-expanded") === "true";


            // Close all other FAQ items.

            document.querySelectorAll(
                AboutConfig.selectors.faqItems
            ).forEach((faqItem) => {

                if (faqItem === item) return;

                const otherButton = faqItem.querySelector(
                    AboutConfig.selectors.faqButtons
                );

                const otherAnswer = faqItem.querySelector(
                    AboutConfig.selectors.faqAnswers
                );

                if (otherButton && otherAnswer) {

                    otherButton.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                    otherAnswer.hidden = true;

                    faqItem.classList.remove("is-open");
                }

            });


            if (isOpen) {

                button.setAttribute(
                    "aria-expanded",
                    "false"
                );

                answer.hidden = true;

                item.classList.remove("is-open");

                this.activeFAQ = null;

            } else {

                button.setAttribute(
                    "aria-expanded",
                    "true"
                );

                answer.hidden = false;

                item.classList.add("is-open");

                this.activeFAQ = item;
            }
        }


        // ----------------------------------------------------
        // 6. SECTION NAVIGATION
        // ----------------------------------------------------

        bindSectionNavigation() {

            const links = document.querySelectorAll(
                AboutConfig.selectors.sectionLinks
            );

            links.forEach((link) => {

                link.addEventListener(
                    "click",
                    (event) => {

                        const targetID =
                            link.getAttribute("href");

                        if (
                            !targetID ||
                            !targetID.startsWith("#")
                        ) {
                            return;
                        }

                        const target =
                            document.querySelector(targetID);

                        if (!target) return;

                        event.preventDefault();

                        this.scrollToSection(target);
                    }
                );

            });
        }


        // ----------------------------------------------------
        // 7. SMOOTH SCROLL
        // ----------------------------------------------------

        scrollToSection(target) {

            target.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

            if (!target.hasAttribute("tabindex")) {

                target.setAttribute("tabindex", "-1");
            }

            setTimeout(() => {

                target.focus({
                    preventScroll: true
                });

            }, 500);
        }


        // ----------------------------------------------------
        // 8. CONTACT BUTTONS
        // ----------------------------------------------------

        bindContactButtons() {

            const buttons = document.querySelectorAll(
                AboutConfig.selectors.contactButtons
            );

            buttons.forEach((button) => {

                button.addEventListener(
                    "click",
                    () => {

                        const customURL =
                            button.dataset.contactUrl;

                        const destination =
                            customURL || AboutConfig.contactPage;

                        window.location.href = destination;
                    }
                );

            });
        }


        // ----------------------------------------------------
        // 9. COPY EMAIL ADDRESS
        // ----------------------------------------------------

        bindEmailCopy() {

            const buttons = document.querySelectorAll(
                AboutConfig.selectors.copyEmailButtons
            );

            buttons.forEach((button) => {

                button.addEventListener(
                    "click",
                    async () => {

                        const email =
                            button.dataset.email ||
                            AboutConfig.defaultEmail;

                        await this.copyEmail(email, button);
                    }
                );

            });
        }


        // ----------------------------------------------------
        // 10. COPY EMAIL HELPER
        // ----------------------------------------------------

        async copyEmail(email, button) {

            try {

                if (
                    window.ClipboardManager &&
                    typeof window.ClipboardManager.copy ===
                    "function"
                ) {

                    await window.ClipboardManager.copy(email);

                } else if (navigator.clipboard) {

                    await navigator.clipboard.writeText(email);

                } else {

                    throw new Error(
                        "Clipboard unavailable."
                    );
                }


                const originalText =
                    button.textContent;

                button.textContent = "Copied!";

                button.classList.add("copied");


                setTimeout(() => {

                    button.textContent = originalText;

                    button.classList.remove("copied");

                }, 1800);


                this.showToast(
                    "Email address copied!",
                    "success"
                );


            } catch (error) {

                this.showToast(
                    "Email copy nahi ho paya.",
                    "error"
                );
            }
        }


        // ----------------------------------------------------
        // 11. TEAM CARD INTERACTIONS
        // ----------------------------------------------------

        bindTeamCards() {

            const cards = document.querySelectorAll(
                AboutConfig.selectors.teamCards
            );

            cards.forEach((card) => {

                card.addEventListener(
                    "mouseenter",
                    () => {

                        card.classList.add("team-card-active");
                    }
                );


                card.addEventListener(
                    "mouseleave",
                    () => {

                        card.classList.remove("team-card-active");
                    }
                );


                card.addEventListener(
                    "focusin",
                    () => {

                        card.classList.add("team-card-active");
                    }
                );


                card.addEventListener(
                    "focusout",
                    () => {

                        card.classList.remove("team-card-active");
                    }
                );

            });
        }


        // ----------------------------------------------------
        // 12. SOCIAL LINKS
        // ----------------------------------------------------

        bindSocialLinks() {

            const links = document.querySelectorAll(
                AboutConfig.selectors.socialLinks
            );

            links.forEach((link) => {

                link.addEventListener(
                    "click",
                    () => {

                        const url = link.getAttribute("href");

                        if (!url || url === "#") {

                            console.warn(
                                "Social media URL is not configured."
                            );
                        }
                    }
                );

            });
        }


        // ----------------------------------------------------
        // 13. ANIMATED COUNTERS
        // ----------------------------------------------------

        initializeCounters() {

            const counters = document.querySelectorAll(
                AboutConfig.selectors.counters
            );

            if (!counters.length) return;


            if (!("IntersectionObserver" in window)) {

                counters.forEach((counter) => {
                    this.animateCounter(counter);
                });

                return;
            }


            const observer = new IntersectionObserver(
                (entries) => {

                    entries.forEach((entry) => {

                        if (!entry.isIntersecting) {
                            return;
                        }

                        this.animateCounter(entry.target);

                        observer.unobserve(entry.target);
                    });

                },
                {
                    threshold: AboutConfig.observerThreshold
                }
            );


            counters.forEach((counter) => {

                observer.observe(counter);
            });


            this.observers.push(observer);
        }


        // ----------------------------------------------------
        // 14. COUNTER ANIMATION
        // ----------------------------------------------------

        animateCounter(element) {

            if (
                this.animatedCounters.has(element)
            ) {
                return;
            }


            this.animatedCounters.add(element);


            const target = Number(
                element.dataset.aboutCounter
            );


            if (!Number.isFinite(target)) {
                return;
            }


            const suffix =
                element.dataset.counterSuffix || "";

            const prefix =
                element.dataset.counterPrefix || "";


            const duration =
                Number(element.dataset.counterDuration) ||
                AboutConfig.animationDuration;


            const startTime = performance.now();


            const update = (currentTime) => {

                const elapsed = currentTime - startTime;

                const progress = Math.min(
                    elapsed / duration,
                    1
                );


                const eased =
                    1 - Math.pow(1 - progress, 4);


                const currentValue = Math.floor(
                    target * eased
                );


                element.textContent =
                    prefix +
                    currentValue.toLocaleString("en-IN") +
                    suffix;


                if (progress < 1) {

                    requestAnimationFrame(update);

                } else {

                    element.textContent =
                        prefix +
                        target.toLocaleString("en-IN") +
                        suffix;
                }
            };


            requestAnimationFrame(update);
        }


        // ----------------------------------------------------
        // 15. STATISTICS ANIMATION
        // ----------------------------------------------------

        initializeStatistics() {

            const statistics = document.querySelectorAll(
                AboutConfig.selectors.statistics
            );

            statistics.forEach((item, index) => {

                item.style.setProperty(
                    "--about-stat-delay",
                    `${index * 100}ms`
                );

                item.classList.add(
                    "about-stat-ready"
                );
            });
        }


        // ----------------------------------------------------
        // 16. SCROLL REVEAL ANIMATIONS
        // ----------------------------------------------------

        initializeRevealAnimations() {

            const elements = document.querySelectorAll(
                AboutConfig.selectors.revealItems
            );

            if (!elements.length) return;


            if (!("IntersectionObserver" in window)) {

                elements.forEach((element) => {

                    element.classList.add("is-visible");
                });

                return;
            }


            const observer = new IntersectionObserver(
                (entries) => {

                    entries.forEach((entry) => {

                        if (!entry.isIntersecting) {
                            return;
                        }


                        entry.target.classList.add(
                            "is-visible"
                        );


                        observer.unobserve(entry.target);
                    });

                },
                {
                    threshold: 0.12,
                    rootMargin: "0px 0px -40px 0px"
                }
            );


            elements.forEach((element) => {

                element.classList.add("about-reveal");

                observer.observe(element);
            });


            this.observers.push(observer);
        }


        // ----------------------------------------------------
        // 17. SCROLL EFFECTS
        // ----------------------------------------------------

        initializeScrollEffects() {

            let ticking = false;


            window.addEventListener(
                "scroll",
                () => {

                    if (ticking) return;

                    ticking = true;


                    requestAnimationFrame(() => {

                        this.updateScrollEffects();

                        ticking = false;
                    });

                },
                {
                    passive: true
                }
            );
        }


        // ----------------------------------------------------
        // 18. UPDATE SCROLL EFFECTS
        // ----------------------------------------------------

        updateScrollEffects() {

            const backButton = document.querySelector(
                AboutConfig.selectors.backToTop
            );

            if (!backButton) return;


            const shouldShow =
                window.scrollY > 400;


            backButton.classList.toggle(
                "is-visible",
                shouldShow
            );


            backButton.setAttribute(
                "aria-hidden",
                String(!shouldShow)
            );
        }


        // ----------------------------------------------------
        // 19. BACK TO TOP
        // ----------------------------------------------------

        bindBackToTop() {

            const button = document.querySelector(
                AboutConfig.selectors.backToTop
            );

            if (!button) return;


            button.addEventListener(
                "click",
                () => {

                    window.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    });
                }
            );
        }


        // ----------------------------------------------------
        // 20. TOAST NOTIFICATION
        // ----------------------------------------------------

        showToast(message, type = "info") {

            if (
                window.Toast &&
                typeof window.Toast.show === "function"
            ) {

                window.Toast.show(message, type);

            } else {

                console.log(
                    "[Insta Crown]",
                    type,
                    message
                );
            }
        }


        // ----------------------------------------------------
        // 21. REFRESH PAGE ANIMATIONS
        // ----------------------------------------------------

        refreshAnimations() {

            this.initializeStatistics();

            this.initializeRevealAnimations();

            this.initializeCounters();
        }


        // ----------------------------------------------------
        // 22. DESTROY MANAGER
        // ----------------------------------------------------

        destroy() {

            this.observers.forEach((observer) => {

                observer.disconnect();
            });


            this.observers = [];


            console.log(
                "About Page Manager Destroyed."
            );
        }

    }


    // --------------------------------------------------------
    // 23. INITIALIZE ABOUT PAGE
    // --------------------------------------------------------

    function initializeAboutPage() {

        const aboutPage = document.querySelector(
            AboutConfig.selectors.page
        );


        if (!aboutPage) {
            return;
        }


        if (window.AboutPageManager) {
            return;
        }


        const manager = new AboutPageManager();


        manager.initializeStatistics();


        window.AboutPageManager = manager;

        window.InstaCrownAbout = manager;


        console.log(
            "Insta Crown About System Ready 👑"
        );
    }


    // --------------------------------------------------------
    // 24. DOCUMENT READY
    // --------------------------------------------------------

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            initializeAboutPage,
            { once: true }
        );

    } else {

        initializeAboutPage();
    }


})();


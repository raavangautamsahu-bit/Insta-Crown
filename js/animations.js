
/* =========================================================
   INSTA CROWN 👑
   FILE: js/animations.js
   PURPOSE: Website Animations & Visual Effects
   ========================================================= */

(function () {
    "use strict";

    /* -----------------------------------------------------
       1. ANIMATION CONFIGURATION
    ----------------------------------------------------- */

    const AnimationConfig = {

        revealSelector: [
            ".reveal",
            ".reveal-up",
            ".reveal-down",
            ".reveal-left",
            ".reveal-right",
            ".fade-in",
            ".animate-on-scroll"
        ].join(","),

        staggerSelector: [
            ".stagger-animation",
            ".tools-grid",
            ".benefits-grid",
            ".steps-grid"
        ].join(","),

        rippleSelector: [
            ".btn",
            ".primary-button",
            ".secondary-button",
            ".icon-button",
            ".tool-card"
        ].join(","),

        animationDuration: 700,

        staggerDelay: 100,

        intersectionThreshold: 0.12,

        reducedMotion: window.matchMedia
            ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
            : false

    };


    /* -----------------------------------------------------
       2. ANIMATION MANAGER
    ----------------------------------------------------- */

    const AnimationManager = {

        initialized: false,

        observer: null,

        scrollTicking: false,


        /* -------------------------------------------------
           3. CHECK REDUCED MOTION
        ------------------------------------------------- */

        prefersReducedMotion: function () {

            return AnimationConfig.reducedMotion;

        },


        /* -------------------------------------------------
           4. CREATE INTERSECTION OBSERVER
        ------------------------------------------------- */

        createObserver: function () {

            if (
                !("IntersectionObserver" in window) ||
                this.prefersReducedMotion()
            ) {
                return null;
            }

            return new IntersectionObserver(
                (entries, observer) => {

                    entries.forEach((entry) => {

                        if (entry.isIntersecting) {

                            entry.target.classList.add(
                                "is-visible"
                            );

                            entry.target.classList.add(
                                "revealed"
                            );

                            observer.unobserve(entry.target);

                        }

                    });

                },
                {
                    threshold: AnimationConfig.intersectionThreshold,
                    rootMargin: "0px 0px -45px 0px"
                }
            );

        },


        /* -------------------------------------------------
           5. INITIALIZE SCROLL REVEAL
        ------------------------------------------------- */

        initScrollReveal: function () {

            const elements = document.querySelectorAll(
                AnimationConfig.revealSelector
            );

            if (!elements.length) {
                return;
            }

            if (this.prefersReducedMotion()) {

                elements.forEach((element) => {

                    element.classList.add("is-visible");

                });

                return;

            }

            this.observer = this.createObserver();

            if (!this.observer) {

                elements.forEach((element) => {

                    element.classList.add("is-visible");

                });

                return;

            }

            elements.forEach((element) => {

                if (
                    element.classList.contains("is-visible") ||
                    element.classList.contains("revealed")
                ) {
                    return;
                }

                this.observer.observe(element);

            });

        },


        /* -------------------------------------------------
           6. STAGGERED CARD ANIMATIONS
        ------------------------------------------------- */

        initStaggerAnimations: function () {

            const containers = document.querySelectorAll(
                AnimationConfig.staggerSelector
            );

            containers.forEach((container) => {

                const children = Array.from(
                    container.children
                );

                children.forEach((child, index) => {

                    if (
                        this.prefersReducedMotion()
                    ) {
                        return;
                    }

                    child.style.setProperty(
                        "--stagger-delay",
                        (index * AnimationConfig.staggerDelay) + "ms"
                    );

                    child.classList.add(
                        "stagger-item"
                    );

                });

            });

        },


        /* -------------------------------------------------
           7. BUTTON RIPPLE EFFECT
        ------------------------------------------------- */

        createRipple: function (event, element) {

            if (this.prefersReducedMotion()) {
                return;
            }

            const oldRipple = element.querySelectorAll(
                ".ripple-effect"
            );

            oldRipple.forEach((ripple) => ripple.remove());

            const rect = element.getBoundingClientRect();

            const ripple = document.createElement("span");

            const size = Math.max(
                rect.width,
                rect.height
            );

            const x = event.clientX - rect.left - size / 2;

            const y = event.clientY - rect.top - size / 2;

            ripple.className = "ripple-effect";

            ripple.style.width = size + "px";

            ripple.style.height = size + "px";

            ripple.style.left = x + "px";

            ripple.style.top = y + "px";

            element.appendChild(ripple);

            window.setTimeout(() => {

                ripple.remove();

            }, 700);

        },


        /* -------------------------------------------------
           8. INITIALIZE RIPPLE EVENTS
        ------------------------------------------------- */

        initRippleEffects: function () {

            const elements = document.querySelectorAll(
                AnimationConfig.rippleSelector
            );

            elements.forEach((element) => {

                if (
                    element.dataset.rippleInitialized === "true"
                ) {
                    return;
                }

                element.dataset.rippleInitialized = "true";

                element.style.position =
                    element.style.position || "relative";

                element.style.overflow = "hidden";

                element.addEventListener(
                    "click",
                    (event) => {

                        this.createRipple(event, element);

                    }
                );

            });

        },


        /* -------------------------------------------------
           9. FLOATING ANIMATIONS
        ------------------------------------------------- */

        initFloatingElements: function () {

            const elements = document.querySelectorAll(
                ".floating-element, .float-animation"
            );

            elements.forEach((element, index) => {

                if (this.prefersReducedMotion()) {
                    return;
                }

                element.style.animationDelay =
                    (index * 0.25) + "s";

            });

        },


        /* -------------------------------------------------
           10. CARD HOVER EFFECTS
        ------------------------------------------------- */

        initCardHoverEffects: function () {

            const cards = document.querySelectorAll(
                ".tool-card, .benefit-card, .feature-card"
            );

            cards.forEach((card) => {

                if (
                    card.dataset.hoverInitialized === "true"
                ) {
                    return;
                }

                card.dataset.hoverInitialized = "true";

                card.addEventListener("mouseenter", () => {

                    if (this.prefersReducedMotion()) {
                        return;
                    }

                    card.classList.add("card-hover-active");

                });

                card.addEventListener("mouseleave", () => {

                    card.classList.remove("card-hover-active");

                });

            });

        },


        /* -------------------------------------------------
           11. IMAGE LOADING EFFECTS
        ------------------------------------------------- */

        initImageAnimations: function () {

            const images = document.querySelectorAll("img");

            images.forEach((image) => {

                if (
                    image.dataset.imageAnimationInitialized === "true"
                ) {
                    return;
                }

                image.dataset.imageAnimationInitialized = "true";

                if (image.complete) {

                    image.classList.add("image-loaded");

                } else {

                    image.addEventListener(
                        "load",
                        () => {

                            image.classList.add("image-loaded");

                        },
                        { once: true }
                    );

                    image.addEventListener(
                        "error",
                        () => {

                            image.classList.add("image-error");

                        },
                        { once: true }
                    );

                }

            });

        },


        /* -------------------------------------------------
           12. SMOOTH SCROLL
        ------------------------------------------------- */

        initSmoothScroll: function () {

            const links = document.querySelectorAll(
                'a[href^="#"]'
            );

            links.forEach((link) => {

                if (
                    link.dataset.smoothScrollInitialized === "true"
                ) {
                    return;
                }

                link.dataset.smoothScrollInitialized = "true";

                link.addEventListener("click", (event) => {

                    const targetId = link.getAttribute("href");

                    if (
                        !targetId ||
                        targetId === "#"
                    ) {
                        return;
                    }

                    const target = document.querySelector(targetId);

                    if (!target) {
                        return;
                    }

                    event.preventDefault();

                    target.scrollIntoView({

                        behavior: this.prefersReducedMotion()
                            ? "auto"
                            : "smooth",

                        block: "start"

                    });

                });

            });

        },


        /* -------------------------------------------------
           13. PAGE ENTRY ANIMATION
        ------------------------------------------------- */

        initPageEntry: function () {

            if (this.prefersReducedMotion()) {
                return;
            }

            document.body.classList.add(
                "page-enter"
            );

            requestAnimationFrame(() => {

                document.body.classList.add(
                    "page-enter-active"
                );

            });

        },


        /* -------------------------------------------------
           14. SCROLL PROGRESS
        ------------------------------------------------- */

        initScrollProgress: function () {

            let progressBar = document.getElementById(
                "scrollProgress"
            );

            if (!progressBar) {

                progressBar = document.createElement("div");

                progressBar.id = "scrollProgress";

                progressBar.className = "scroll-progress";

                progressBar.setAttribute(
                    "aria-hidden",
                    "true"
                );

                document.body.appendChild(progressBar);

            }

            const updateProgress = () => {

                const scrollTop =
                    window.scrollY ||
                    document.documentElement.scrollTop;

                const scrollHeight =
                    document.documentElement.scrollHeight -
                    window.innerHeight;

                const progress = scrollHeight > 0
                    ? (scrollTop / scrollHeight) * 100
                    : 0;

                progressBar.style.width =
                    Math.min(100, Math.max(0, progress)) + "%";

            };

            window.addEventListener(
                "scroll",
                () => {

                    if (this.scrollTicking) {
                        return;
                    }

                    this.scrollTicking = true;

                    requestAnimationFrame(() => {

                        updateProgress();

                        this.scrollTicking = false;

                    });

                },
                { passive: true }
            );

            updateProgress();

        },


        /* -------------------------------------------------
           15. BACK TO TOP BUTTON ANIMATION
        ------------------------------------------------- */

        initBackToTopAnimation: function () {

            const button = document.getElementById(
                "backToTop"
            );

            if (!button) {
                return;
            }

            button.addEventListener("click", () => {

                window.scrollTo({

                    top: 0,

                    behavior: this.prefersReducedMotion()
                        ? "auto"
                        : "smooth"

                });

            });

        },


        /* -------------------------------------------------
           16. INPUT FOCUS ANIMATIONS
        ------------------------------------------------- */

        initInputAnimations: function () {

            const inputs = document.querySelectorAll(
                "input, textarea, select"
            );

            inputs.forEach((input) => {

                if (
                    input.dataset.inputAnimationInitialized === "true"
                ) {
                    return;
                }

                input.dataset.inputAnimationInitialized = "true";

                input.addEventListener("focus", () => {

                    input.classList.add("input-focused");

                });

                input.addEventListener("blur", () => {

                    input.classList.remove("input-focused");

                });

            });

        },


        /* -------------------------------------------------
           17. DYNAMIC ELEMENT SUPPORT
        ------------------------------------------------- */

        observeNewElements: function (root = document) {

            if (!this.observer) {
                return;
            }

            const elements = root.querySelectorAll
                ? root.querySelectorAll(
                    AnimationConfig.revealSelector
                )
                : [];

            elements.forEach((element) => {

                if (
                    element.classList.contains("is-visible") ||
                    element.classList.contains("revealed")
                ) {
                    return;
                }

                this.observer.observe(element);

            });

        },


        /* -------------------------------------------------
           18. REFRESH ALL ANIMATIONS
        ------------------------------------------------- */

        refresh: function () {

            this.initScrollReveal();

            this.initStaggerAnimations();

            this.initRippleEffects();

            this.initFloatingElements();

            this.initCardHoverEffects();

            this.initImageAnimations();

            this.initSmoothScroll();

            this.initInputAnimations();

        },


        /* -------------------------------------------------
           19. CLEAN UP OBSERVER
        ------------------------------------------------- */

        destroy: function () {

            if (this.observer) {

                this.observer.disconnect();

                this.observer = null;

            }

            this.initialized = false;

        },


        /* -------------------------------------------------
           20. INITIALIZE ANIMATION SYSTEM
        ------------------------------------------------- */

        init: function () {

            if (this.initialized) {
                return;
            }

            this.initPageEntry();

            this.initScrollReveal();

            this.initStaggerAnimations();

            this.initRippleEffects();

            this.initFloatingElements();

            this.initCardHoverEffects();

            this.initImageAnimations();

            this.initSmoothScroll();

            this.initScrollProgress();

            this.initBackToTopAnimation();

            this.initInputAnimations();

            this.initialized = true;

            console.log(
                "Insta Crown: Animation Manager initialized."
            );

        }

    };


    /* -----------------------------------------------------
       21. GLOBAL ANIMATION FUNCTIONS
    ----------------------------------------------------- */

    window.AnimationManager = AnimationManager;

    window.refreshAnimations = function () {

        AnimationManager.refresh();

    };

    window.observeNewAnimations = function (element) {

        AnimationManager.observeNewElements(element);

    };


    /* -----------------------------------------------------
       22. INITIALIZE WHEN DOCUMENT IS READY
    ----------------------------------------------------- */

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            function () {

                AnimationManager.init();

            },
            { once: true }
        );

    } else {

        AnimationManager.init();

    }


})();


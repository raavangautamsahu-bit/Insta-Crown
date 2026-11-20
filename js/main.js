
/* =========================================================
   INSTA CROWN — MAIN.JS
   Main Website Controller
   ========================================================= */

"use strict";


/* ---------------------------------------------------------
   01. GLOBAL WEBSITE CONFIGURATION
   --------------------------------------------------------- */

const InstaCrown = {

    name: "Insta Crown",

    version: "1.0.0",

    author: "Insta Crown Team",

    website: window.location.origin,

    initialized: false,

    settings: {
        loaderDuration: 500,
        toastDuration: 3000,
        scrollOffset: 300,
        animationDelay: 100
    }

};


/* ---------------------------------------------------------
   02. DOM ELEMENT SELECTOR UTILITIES
   --------------------------------------------------------- */

const $ = (selector, parent = document) => {
    return parent.querySelector(selector);
};

const $$ = (selector, parent = document) => {
    return Array.from(parent.querySelectorAll(selector));
};

const getElement = (id) => {
    return document.getElementById(id);
};

const createElement = (tag, className = "", text = "") => {

    const element = document.createElement(tag);

    if (className) {
        element.className = className;
    }

    if (text) {
        element.textContent = text;
    }

    return element;

};


/* ---------------------------------------------------------
   03. WEBSITE LOADER
   --------------------------------------------------------- */

const WebsiteLoader = {

    element: null,

    start() {

        this.element = getElement("websiteLoader");

        if (!this.element) return;

        this.element.classList.remove("loader-hidden");

    },

    hide() {

        if (!this.element) {
            this.element = getElement("websiteLoader");
        }

        if (!this.element) return;

        setTimeout(() => {

            this.element.classList.add("loader-hidden");

        }, InstaCrown.settings.loaderDuration);

    },

    remove() {

        if (!this.element) return;

        this.element.remove();

    }

};


/* ---------------------------------------------------------
   04. TOAST NOTIFICATION SYSTEM
   --------------------------------------------------------- */

const Toast = {

    container: null,

    initialize() {

        this.container = getElement("toastContainer");

        if (!this.container) {

            this.container = createElement(
                "div",
                "toast-container"
            );

            this.container.id = "toastContainer";

            document.body.appendChild(this.container);

        }

    },

    show(message, type = "info", duration = null) {

        this.initialize();

        const toast = createElement(
            "div",
            `toast-message toast-${type}`
        );

        const icon = createElement("span", "toast-icon");

        const text = createElement("span", "toast-text", message);

        const closeButton = createElement(
            "button",
            "toast-close",
            "×"
        );

        closeButton.type = "button";

        closeButton.setAttribute("aria-label", "Close notification");

        const icons = {
            success: "✓",
            error: "✕",
            warning: "⚠",
            info: "ℹ"
        };

        icon.textContent = icons[type] || icons.info;

        toast.append(icon, text, closeButton);

        this.container.appendChild(toast);

        const removeToast = () => {

            if (!toast.isConnected) return;

            toast.classList.add("toast-hide");

            setTimeout(() => {
                toast.remove();
            }, 300);

        };

        closeButton.addEventListener("click", removeToast);

        const toastDuration =
            duration || InstaCrown.settings.toastDuration;

        setTimeout(removeToast, toastDuration);

        return toast;

    },

    success(message) {
        return this.show(message, "success");
    },

    error(message) {
        return this.show(message, "error");
    },

    warning(message) {
        return this.show(message, "warning");
    },

    info(message) {
        return this.show(message, "info");
    }

};


/* ---------------------------------------------------------
   05. BACK TO TOP BUTTON
   --------------------------------------------------------- */

const BackToTop = {

    button: null,

    initialize() {

        this.button = getElement("backToTop");

        if (!this.button) {

            this.button = createElement(
                "button",
                "back-to-top"
            );

            this.button.id = "backToTop";

            this.button.type = "button";

            this.button.innerHTML = "↑";

            this.button.setAttribute(
                "aria-label",
                "Back to top"
            );

            document.body.appendChild(this.button);

        }

        this.button.addEventListener("click", () => {

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        });

        this.updateVisibility();

    },

    updateVisibility() {

        if (!this.button) return;

        const shouldShow =
            window.scrollY > InstaCrown.settings.scrollOffset;

        this.button.classList.toggle("visible", shouldShow);

    }

};


/* ---------------------------------------------------------
   06. SCROLL EVENT MANAGEMENT
   --------------------------------------------------------- */

const ScrollManager = {

    ticking: false,

    initialize() {

        window.addEventListener(
            "scroll",
            () => {

                if (this.ticking) return;

                this.ticking = true;

                window.requestAnimationFrame(() => {

                    BackToTop.updateVisibility();

                    this.ticking = false;

                });

            },
            { passive: true }
        );

    }

};


/* ---------------------------------------------------------
   07. PAGE TITLE MANAGEMENT
   --------------------------------------------------------- */

const PageTitle = {

    set(title) {

        if (!title) return;

        document.title = `${title} | Insta Crown`;

    },

    get() {

        return document.title;

    }

};


/* ---------------------------------------------------------
   08. DATE AND TIME UTILITIES
   --------------------------------------------------------- */

const DateUtils = {

    now() {
        return new Date();
    },

    format(date = new Date()) {

        return new Intl.DateTimeFormat("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }).format(date);

    },

    formatTime(date = new Date()) {

        return new Intl.DateTimeFormat("en-IN", {
            hour: "2-digit",
            minute: "2-digit"
        }).format(date);

    },

    getTimestamp() {

        return Date.now();

    }

};


/* ---------------------------------------------------------
   09. LOCAL STORAGE UTILITIES
   --------------------------------------------------------- */

const Storage = {

    set(key, value) {

        try {

            localStorage.setItem(
                key,
                JSON.stringify(value)
            );

            return true;

        } catch (error) {

            console.error("Storage save error:", error);

            return false;

        }

    },

    get(key, defaultValue = null) {

        try {

            const value = localStorage.getItem(key);

            return value === null
                ? defaultValue
                : JSON.parse(value);

        } catch (error) {

            console.error("Storage read error:", error);

            return defaultValue;

        }

    },

    remove(key) {

        try {

            localStorage.removeItem(key);

        } catch (error) {

            console.error("Storage remove error:", error);

        }

    },

    clear() {

        try {

            localStorage.clear();

        } catch (error) {

            console.error("Storage clear error:", error);

        }

    }

};


/* ---------------------------------------------------------
   10. CLIPBOARD UTILITY
   --------------------------------------------------------- */

const Clipboard = {

    async copy(text) {

        if (!text) {
            Toast.warning("Nothing to copy.");
            return false;
        }

        try {

            await navigator.clipboard.writeText(text);

            Toast.success("Copied to clipboard!");

            return true;

        } catch (error) {

            const textarea = createElement("textarea");

            textarea.value = text;

            textarea.style.position = "fixed";
            textarea.style.opacity = "0";

            document.body.appendChild(textarea);

            textarea.select();

            try {

                const success = document.execCommand("copy");

                textarea.remove();

                if (success) {
                    Toast.success("Copied to clipboard!");
                    return true;
                }

            } catch (fallbackError) {

                textarea.remove();

            }

            Toast.error("Unable to copy text.");

            return false;

        }

    }

};


/* ---------------------------------------------------------
   11. NETWORK STATUS
   --------------------------------------------------------- */

const NetworkStatus = {

    online: navigator.onLine,

    initialize() {

        window.addEventListener("online", () => {

            this.online = true;

            Toast.success("Internet connection restored.");

        });

        window.addEventListener("offline", () => {

            this.online = false;

            Toast.warning("You are currently offline.");

        });

    },

    isOnline() {

        return navigator.onLine;

    }

};


/* ---------------------------------------------------------
   12. BUTTON LOADING MANAGER
   --------------------------------------------------------- */

const ButtonLoader = {

    start(button, loadingText = "Please wait...") {

        if (!button) return;

        if (!button.dataset.originalText) {

            button.dataset.originalText = button.innerHTML;

        }

        button.disabled = true;

        button.classList.add("button-loading");

        button.textContent = loadingText;

    },

    stop(button) {

        if (!button) return;

        button.disabled = false;

        button.classList.remove("button-loading");

        if (button.dataset.originalText) {

            button.innerHTML = button.dataset.originalText;

            delete button.dataset.originalText;

        }

    }

};


/* ---------------------------------------------------------
   13. ELEMENT VISIBILITY UTILITIES
   --------------------------------------------------------- */

const Visibility = {

    show(element) {

        if (!element) return;

        element.classList.remove("hidden");

        element.removeAttribute("hidden");

    },

    hide(element) {

        if (!element) return;

        element.classList.add("hidden");

    },

    toggle(element) {

        if (!element) return;

        element.classList.toggle("hidden");

    }

};


/* ---------------------------------------------------------
   14. DEBOUNCE UTILITY
   --------------------------------------------------------- */

const debounce = (callback, delay = 300) => {

    let timer;

    return (...args) => {

        clearTimeout(timer);

        timer = setTimeout(() => {

            callback(...args);

        }, delay);

    };

};


/* ---------------------------------------------------------
   15. THROTTLE UTILITY
   --------------------------------------------------------- */

const throttle = (callback, delay = 300) => {

    let lastCall = 0;

    return (...args) => {

        const now = Date.now();

        if (now - lastCall >= delay) {

            lastCall = now;

            callback(...args);

        }

    };

};


/* ---------------------------------------------------------
   16. SCROLL REVEAL FALLBACK
   --------------------------------------------------------- */

const RevealFallback = {

    initialize() {

        const elements = $$(".reveal");

        if (!elements.length) return;

        if (!("IntersectionObserver" in window)) {

            elements.forEach(element => {
                element.classList.add("is-visible");
            });

            return;

        }

        const observer = new IntersectionObserver(
            (entries, currentObserver) => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add("is-visible");

                        currentObserver.unobserve(entry.target);

                    }

                });

            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -35px 0px"
            }
        );

        elements.forEach(element => {

            observer.observe(element);

        });

    }

};


/* ---------------------------------------------------------
   17. GLOBAL ERROR HANDLING
   --------------------------------------------------------- */

window.addEventListener("error", (event) => {

    console.error(
        "Insta Crown JavaScript Error:",
        event.message,
        event.filename,
        event.lineno
    );

});

window.addEventListener("unhandledrejection", (event) => {

    console.error(
        "Insta Crown Promise Error:",
        event.reason
    );

});


/* ---------------------------------------------------------
   18. DOCUMENT READY EVENT
   --------------------------------------------------------- */

const DocumentReady = {

    callbacks: [],

    add(callback) {

        if (typeof callback !== "function") return;

        if (document.readyState === "loading") {

            document.addEventListener(
                "DOMContentLoaded",
                callback,
                { once: true }
            );

        } else {

            callback();

        }

    }

};


/* ---------------------------------------------------------
   19. WEBSITE INITIALIZATION
   --------------------------------------------------------- */

const initializeInstaCrown = () => {

    if (InstaCrown.initialized) return;

    InstaCrown.initialized = true;

    console.log(
        `%c👑 ${InstaCrown.name} v${InstaCrown.version}`,
        "color:#ec4899;font-size:18px;font-weight:bold;"
    );

    WebsiteLoader.start();

    Toast.initialize();

    BackToTop.initialize();

    ScrollManager.initialize();

    NetworkStatus.initialize();

    RevealFallback.initialize();

    WebsiteLoader.hide();

};


/* ---------------------------------------------------------
   20. START WEBSITE
   --------------------------------------------------------- */

DocumentReady.add(() => {

    initializeInstaCrown();

});


/* ---------------------------------------------------------
   21. GLOBAL EXPORTS
   --------------------------------------------------------- */

window.InstaCrown = InstaCrown;

window.Toast = Toast;

window.Storage = Storage;

window.Clipboard = Clipboard;

window.ButtonLoader = ButtonLoader;

window.Visibility = Visibility;

window.PageTitle = PageTitle;

window.DateUtils = DateUtils;

window.debounce = debounce;

window.throttle = throttle;

window.$ = $;

window.$$ = $$;


/* =========================================================
   END OF INSTA CROWN MAIN.JS
   ========================================================= */


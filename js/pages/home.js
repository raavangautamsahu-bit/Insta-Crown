
/* ============================================================
   INSTA CROWN 👑
   HOME PAGE CONTROLLER
   File: js/pages/home.js

   FEATURES:
   1. Home Page Initialization
   2. Downloader Form Controller
   3. Instagram URL Input
   4. URL Validation
   5. Paste From Clipboard
   6. Clear URL Input
   7. Download Button Controller
   8. Loading Animation
   9. FAQ Accordion
   10. Quick Tool Navigation
   11. Copy URL
   12. Recent Activity
   13. User Greeting
   14. Home Page Statistics
   15. Scroll Interactions
============================================================ */

(function () {

    "use strict";


    /* ========================================================
       1. HOME PAGE CONFIGURATION
    ======================================================== */

    const HomeConfig = {

        selectors: {

            urlInput:
                "#instagramUrl",

            downloaderForm:
                "#downloaderForm",

            downloadButton:
                "#downloadButton",

            pasteButton:
                "[data-home-paste]",

            clearButton:
                "[data-home-clear]",

            faqItems:
                ".faq-item",

            faqQuestions:
                ".faq-question",

            quickTools:
                "[data-quick-tool]",

            greeting:
                "[data-home-greeting]",

            recentActivity:
                "[data-home-activity]"

        },

        messages: {

            emptyURL:
                "Please paste an Instagram link first.",

            invalidURL:
                "Please enter a valid Instagram URL.",

            pasted:
                "Link pasted successfully!",

            copied:
                "Link copied successfully!",

            cleared:
                "Input cleared.",

            loginRequired:
                "Login to access your saved activity."

        },

        pages: {

            reels: "reels.html",

            posts: "posts.html",

            stories: "stories.html",

            profile: "profile.html",

            about: "about.html"

        }

    };


    /* ========================================================
       2. HOME PAGE MANAGER
    ======================================================== */

    class HomePageManager {

        constructor() {

            this.urlInput = null;

            this.downloaderForm = null;

            this.downloadButton = null;

            this.isInitialized = false;

            this.recentLinks = [];

            this.init();

        }


        /* ====================================================
           3. INITIALIZE HOME PAGE
        ==================================================== */

        init() {

            if (this.isInitialized) {
                return;
            }

            if (
                !document.querySelector(
                    HomeConfig.selectors.downloaderForm
                )
            ) {

                return;

            }

            this.urlInput =
                document.querySelector(
                    HomeConfig.selectors.urlInput
                );

            this.downloaderForm =
                document.querySelector(
                    HomeConfig.selectors.downloaderForm
                );

            this.downloadButton =
                document.querySelector(
                    HomeConfig.selectors.downloadButton
                );

            this.setupEventListeners();

            this.setupFAQ();

            this.setupQuickTools();

            this.setupGreeting();

            this.setupInputInteractions();

            this.loadRecentActivity();

            this.setupHomeAnimations();

            this.isInitialized = true;

            console.log(
                "Insta Crown Home Page Ready 👑"
            );

        }


        /* ====================================================
           4. EVENT LISTENERS
        ==================================================== */

        setupEventListeners() {

            if (this.downloaderForm) {

                this.downloaderForm.addEventListener(
                    "submit",
                    (event) => {

                        event.preventDefault();

                        this.handleDownload();

                    }
                );

            }


            document.addEventListener(
                "click",
                (event) => {

                    const pasteButton =
                        event.target.closest(
                            HomeConfig.selectors.pasteButton
                        );

                    if (pasteButton) {

                        this.pasteURL();

                    }


                    const clearButton =
                        event.target.closest(
                            HomeConfig.selectors.clearButton
                        );

                    if (clearButton) {

                        this.clearInput();

                    }

                }
            );


            if (this.urlInput) {

                this.urlInput.addEventListener(
                    "input",
                    () => {

                        this.updateInputState();

                    }
                );

                this.urlInput.addEventListener(
                    "keydown",
                    (event) => {

                        if (
                            event.key === "Enter" &&
                            !event.shiftKey
                        ) {

                            event.preventDefault();

                            this.handleDownload();

                        }

                    }
                );

            }

        }


        /* ====================================================
           5. HANDLE DOWNLOAD REQUEST
        ==================================================== */

        async handleDownload() {

            if (!this.urlInput) {
                return;
            }

            const url =
                this.urlInput.value.trim();

            if (!url) {

                this.showMessage(
                    HomeConfig.messages.emptyURL,
                    "error"
                );

                this.urlInput.focus();

                return;

            }

            if (!this.validateURL(url)) {

                this.showMessage(
                    HomeConfig.messages.invalidURL,
                    "error"
                );

                this.urlInput.focus();

                return;

            }

            this.saveRecentLink(url);

            if (
                window.InstaCrownDownloader &&
                typeof window.startDownload === "function"
            ) {

                await window.startDownload(url);

                return;

            }

            this.showMessage(
                "Downloader service is not connected yet.",
                "warning"
            );

        }


        /* ====================================================
           6. VALIDATE INSTAGRAM URL
        ==================================================== */

        validateURL(url) {

            if (
                window.ValidationManager &&
                typeof window.ValidationManager.validateInstagramURL === "function"
            ) {

                return window.ValidationManager
                    .validateInstagramURL(url)
                    .isValid;

            }

            try {

                const parsed =
                    new URL(url);

                const allowedHosts = [

                    "instagram.com",

                    "www.instagram.com",

                    "m.instagram.com",

                    "instagr.am",

                    "www.instagr.am"

                ];

                return allowedHosts.includes(
                    parsed.hostname.toLowerCase()
                );

            } catch (error) {

                return false;

            }

        }


        /* ====================================================
           7. PASTE URL FROM CLIPBOARD
        ==================================================== */

        async pasteURL() {

            try {

                if (!this.urlInput) {
                    return;
                }

                let clipboardText = "";

                if (
                    window.ClipboardManager &&
                    typeof window.ClipboardManager.read === "function"
                ) {

                    clipboardText =
                        await window.ClipboardManager.read();

                } else {

                    clipboardText =
                        await navigator.clipboard.readText();

                }

                if (!clipboardText) {

                    this.showMessage(
                        "Clipboard is empty.",
                        "warning"
                    );

                    return;

                }

                this.urlInput.value =
                    clipboardText.trim();

                this.updateInputState();

                this.urlInput.focus();

                this.showMessage(
                    HomeConfig.messages.pasted,
                    "success"
                );

            } catch (error) {

                console.error(
                    "Clipboard error:",
                    error
                );

                this.showMessage(
                    "Unable to access clipboard. Paste manually.",
                    "error"
                );

            }

        }


        /* ====================================================
           8. CLEAR URL INPUT
        ==================================================== */

        clearInput() {

            if (!this.urlInput) {
                return;
            }

            this.urlInput.value = "";

            this.updateInputState();

            this.urlInput.focus();

            this.showMessage(
                HomeConfig.messages.cleared,
                "success"
            );

        }


        /* ====================================================
           9. UPDATE INPUT STATE
        ==================================================== */

        updateInputState() {

            if (!this.urlInput) {
                return;
            }

            const value =
                this.urlInput.value.trim();

            const container =
                this.urlInput.closest(
                    ".downloader-input-wrapper"
                );

            if (container) {

                container.classList.toggle(
                    "has-value",
                    Boolean(value)
                );

                container.classList.toggle(
                    "is-valid",
                    Boolean(value) &&
                    this.validateURL(value)
                );

                container.classList.toggle(
                    "is-invalid",
                    Boolean(value) &&
                    !this.validateURL(value)
                );

            }

            this.urlInput.setAttribute(
                "aria-invalid",
                Boolean(value) &&
                !this.validateURL(value)
                    ? "true"
                    : "false"
            );

        }


        /* ====================================================
           10. FAQ ACCORDION
        ==================================================== */

        setupFAQ() {

            const questions =
                document.querySelectorAll(
                    HomeConfig.selectors.faqQuestions
                );

            questions.forEach((question) => {

                question.addEventListener(
                    "click",
                    () => {

                        const item =
                            question.closest(
                                HomeConfig.selectors.faqItems
                            );

                        if (!item) {
                            return;
                        }

                        const wasOpen =
                            item.classList.contains(
                                "active"
                            );

                        document
                            .querySelectorAll(
                                HomeConfig.selectors.faqItems
                            )
                            .forEach((otherItem) => {

                                otherItem.classList.remove(
                                    "active"
                                );

                                const otherQuestion =
                                    otherItem.querySelector(
                                        ".faq-question"
                                    );

                                if (otherQuestion) {

                                    otherQuestion.setAttribute(
                                        "aria-expanded",
                                        "false"
                                    );

                                }

                            });

                        if (!wasOpen) {

                            item.classList.add(
                                "active"
                            );

                            question.setAttribute(
                                "aria-expanded",
                                "true"
                            );

                        }

                    }
                );

            });

        }


        /* ====================================================
           11. QUICK TOOL NAVIGATION
        ==================================================== */

        setupQuickTools() {

            const tools =
                document.querySelectorAll(
                    HomeConfig.selectors.quickTools
                );

            tools.forEach((tool) => {

                tool.addEventListener(
                    "click",
                    () => {

                        const page =
                            tool.dataset.quickTool;

                        if (!page) {
                            return;
                        }

                        const destination =
                            HomeConfig.pages[page];

                        if (!destination) {

                            console.warn(
                                "Unknown tool:",
                                page
                            );

                            return;

                        }

                        window.location.href =
                            destination;

                    }
                );

            });

        }


        /* ====================================================
           12. USER GREETING
        ==================================================== */

        setupGreeting() {

            const greeting =
                document.querySelector(
                    HomeConfig.selectors.greeting
                );

            if (!greeting) {
                return;
            }

            const hour =
                new Date().getHours();

            let message =
                "Welcome to Insta Crown";

            if (hour >= 5 && hour < 12) {

                message = "Good Morning";

            } else if (
                hour >= 12 &&
                hour < 17
            ) {

                message = "Good Afternoon";

            } else if (
                hour >= 17 &&
                hour < 21
            ) {

                message = "Good Evening";

            } else {

                message = "Good Night";

            }

            const user =
                window.InstaCrownAuth
                    ? window.InstaCrownAuth.getCurrentUser()
                    : null;

            if (
                user &&
                user.displayName
            ) {

                message +=
                    ", " +
                    user.displayName.split(" ")[0];

            }

            greeting.textContent =
                message;

        }


        /* ====================================================
           13. SAVE RECENT LINK
        ==================================================== */

        saveRecentLink(url) {

            const storageKey =
                "instaCrownRecentLinks";

            try {

                const existing =
                    JSON.parse(
                        localStorage.getItem(storageKey) ||
                        "[]"
                    );

                const filtered =
                    existing.filter(
                        (item) => item.url !== url
                    );

                filtered.unshift({

                    url: url,

                    date: new Date().toISOString()

                });

                const limited =
                    filtered.slice(0, 10);

                localStorage.setItem(
                    storageKey,
                    JSON.stringify(limited)
                );

                this.recentLinks =
                    limited;

            } catch (error) {

                console.error(
                    "Recent links storage error:",
                    error
                );

            }

        }


        /* ====================================================
           14. LOAD RECENT ACTIVITY
        ==================================================== */

        loadRecentActivity() {

            const container =
                document.querySelector(
                    HomeConfig.selectors.recentActivity
                );

            if (!container) {
                return;
            }

            try {

                                const savedRecent =
                    JSON.parse(
                        localStorage.getItem(
                            "instaCrownRecentLinks"
                        ) || "[]"
                    );

                const recent = Array.isArray(savedRecent)
                    ? savedRecent.filter((item) => {

                        if (
                            !item ||
                            typeof item !== "object" ||
                            typeof item.url !== "string" ||
                            typeof item.date !== "string"
                        ) {
                            return false;
                        }

                        if (!this.validateURL(item.url)) {
                            return false;
                        }

                        return !Number.isNaN(
                            new Date(item.date).getTime()
                        );

                    }).slice(0, 10)
                    : [];

                this.recentLinks = recent;

                if (!recent.length) {

                    const emptyMessage =
                        document.createElement("p");

                    emptyMessage.className =
                        "empty-activity";

                    emptyMessage.textContent =
                        "No recent activity yet.";

                    container.replaceChildren(
                        emptyMessage
                    );

                    return;

                }

                container.replaceChildren();

                recent.forEach((item) => {

                    const row =
                        document.createElement("div");

                    row.className =
                        "recent-activity-item";

                    const link =
                        document.createElement("span");

                    link.className =
                        "recent-activity-url";

                    link.textContent =
                        item.url;

                    const date =
                        document.createElement("small");

                    date.className =
                        "recent-activity-date";

                    date.textContent =
                        this.formatDate(item.date);

                    const copyButton =
                        document.createElement("button");

                    copyButton.type =
                        "button";

                    copyButton.textContent =
                        "Copy";

                    copyButton.addEventListener(
                        "click",
                        () => {

                            this.copyText(item.url);

                        }
                    );

                    row.append(
                        link,
                        date,
                        copyButton
                    );

                    container.appendChild(row);

                });

            } catch (error) {

                console.error(
                    "Activity loading error:",
                    error
                );

            }

        }


        /* ====================================================
           15. FORMAT DATE
        ==================================================== */

        formatDate(dateString) {

            const date =
                new Date(dateString);

            if (Number.isNaN(date.getTime())) {
                return "";
            }

            return date.toLocaleString(
                undefined,
                {

                    day: "numeric",

                    month: "short",

                    hour: "2-digit",

                    minute: "2-digit"

                }
            );

        }


        /* ====================================================
           16. COPY TEXT
        ==================================================== */

        async copyText(text) {

            try {

                if (
                    window.ClipboardManager &&
                    typeof window.ClipboardManager.copy === "function"
                ) {

                    await window.ClipboardManager.copy(text);

                } else {

                    await navigator.clipboard.writeText(text);

                }

                this.showMessage(
                    HomeConfig.messages.copied,
                    "success"
                );

                return true;

            } catch (error) {

                this.showMessage(
                    "Unable to copy text.",
                    "error"
                );

                return false;

            }

        }


        /* ====================================================
           17. HOME PAGE ANIMATIONS
        ==================================================== */

        setupHomeAnimations() {

            const animatedElements =
                document.querySelectorAll(
                    ".home-hero, .tool-card, .benefit-card, .step-card"
                );

            animatedElements.forEach(
                (element, index) => {

                    element.style.setProperty(
                        "--home-animation-delay",
                        `${index * 70}ms`
                    );

                }
            );

            if (
                window.AnimationManager &&
                typeof window.AnimationManager.refresh === "function"
            ) {

                window.AnimationManager.refresh();

            }

        }


        /* ====================================================
           18. MESSAGE SYSTEM
        ==================================================== */

        showMessage(message, type = "info") {

            if (
                window.Toast &&
                typeof window.Toast.show === "function"
            ) {

                window.Toast.show(
                    message,
                    type
                );

            } else {

                console.log(
                    "[Home]",
                    message
                );

            }

        }


        /* ====================================================
           19. GET HOME PAGE DATA
        ==================================================== */

        getHomeData() {

            return {

                initialized:
                    this.isInitialized,

                recentLinks:
                    this.recentLinks,

                inputValue:
                    this.urlInput
                        ? this.urlInput.value
                        : ""

            };

        }


        /* ====================================================
           20. RESET HOME PAGE
        ==================================================== */

        reset() {

            if (this.urlInput) {

                this.urlInput.value = "";

                this.updateInputState();

            }

            this.recentLinks = [];

        }

    }


    /* ========================================================
       21. CREATE HOME PAGE INSTANCE
    ======================================================== */

    const HomePage =
        new HomePageManager();


    /* ========================================================
       22. EXPORT HOME PAGE API
    ======================================================== */

    window.InstaCrownHome =
        HomePage;

    window.HomePageManager =
        HomePage;


    /* ========================================================
       23. HOME PAGE READY EVENT
    ======================================================== */

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            function () {

                HomePage.init();

            },
            { once: true }
        );

    } else {

        HomePage.init();

    }


})();


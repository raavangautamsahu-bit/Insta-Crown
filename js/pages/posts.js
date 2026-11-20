
/* ============================================================
   INSTA CROWN 👑
   POSTS PAGE CONTROLLER
   File: js/pages/posts.js

   FEATURES:
   1. Posts Page Initialization
   2. Instagram Post URL Validation
   3. Paste URL From Clipboard
   4. Clear URL Input
   5. Post Download Request
   6. Loading Animation
   7. Result Display
   8. Copy Post URL
   9. Recent Post History
   10. Error Handling
   11. Multiple Post Media Support
   12. Page Reset
   13. Download Button State
   14. Clipboard Integration
   15. Page Status
============================================================ */

(function () {

    "use strict";


    /* ========================================================
       1. POSTS PAGE CONFIGURATION
    ======================================================== */

    const PostsConfig = {

        selectors: {

            form: "#postsDownloaderForm",

            input: "#postsInstagramUrl",

            downloadButton: "#postsDownloadButton",

            pasteButton: "[data-posts-paste]",

            clearButton: "[data-posts-clear]",

            result: "#postsDownloadResult",

            loading: "#postsDownloadLoading",

            error: "#postsDownloadError",

            history: "#postsRecentHistory",

            resultGallery: "#postsResultGallery",

            resultLink: "#postsResultLink"

        },

        storageKey:
            "instaCrownPostsHistory",

        maximumHistory: 10,

        allowedHosts: [

            "instagram.com",

            "www.instagram.com",

            "m.instagram.com",

            "instagr.am",

            "www.instagr.am"

        ]

    };


    /* ========================================================
       2. POSTS PAGE MANAGER
    ======================================================== */

    class PostsPageManager {

        constructor() {

            this.form = null;

            this.input = null;

            this.downloadButton = null;

            this.resultContainer = null;

            this.loadingContainer = null;

            this.errorContainer = null;

            this.isInitialized = false;

            this.isDownloading = false;

            this.history = [];

            this.currentResult = null;

            this.init();

        }


        /* ====================================================
           3. INITIALIZE PAGE
        ==================================================== */

        init() {

            if (this.isInitialized) {
                return;
            }

            this.form = document.querySelector(
                PostsConfig.selectors.form
            );

            if (!this.form) {
                return;
            }

            this.input = document.querySelector(
                PostsConfig.selectors.input
            );

            this.downloadButton = document.querySelector(
                PostsConfig.selectors.downloadButton
            );

            this.resultContainer = document.querySelector(
                PostsConfig.selectors.result
            );

            this.loadingContainer = document.querySelector(
                PostsConfig.selectors.loading
            );

            this.errorContainer = document.querySelector(
                PostsConfig.selectors.error
            );

            this.attachEvents();

            this.loadHistory();

            this.hideLoading();

            this.hideResult();

            this.hideError();

            this.isInitialized = true;

            console.log(
                "Insta Crown Posts Page Ready 👑"
            );

            window.dispatchEvent(
                new CustomEvent(
                    "instaCrownPostsReady"
                )
            );

        }


        /* ====================================================
           4. ATTACH EVENTS
        ==================================================== */

        attachEvents() {

            this.form.addEventListener(
                "submit",
                (event) => {

                    event.preventDefault();

                    this.startDownload();

                }
            );

            if (this.input) {

                this.input.addEventListener(
                    "input",
                    () => {

                        this.validateLive();

                    }
                );

                this.input.addEventListener(
                    "keydown",
                    (event) => {

                        if (
                            event.key === "Escape"
                        ) {

                            this.clearInput();

                        }

                    }
                );

            }

            document.addEventListener(
                "click",
                (event) => {

                    const paste =
                        event.target.closest(
                            PostsConfig.selectors.pasteButton
                        );

                    if (paste) {

                        this.pasteURL();

                    }

                    const clear =
                        event.target.closest(
                            PostsConfig.selectors.clearButton
                        );

                    if (clear) {

                        this.clearInput();

                    }

                }
            );

        }


        /* ====================================================
           5. VALIDATE INSTAGRAM POST URL
        ==================================================== */

        validatePostURL(value) {

            if (!value || typeof value !== "string") {

                return {

                    valid: false,

                    message: "Please enter an Instagram post URL."

                };

            }

            try {

                const parsed =
                    new URL(value.trim());

                const hostname =
                    parsed.hostname.toLowerCase();

                if (
                    !PostsConfig.allowedHosts.includes(
                        hostname
                    )
                ) {

                    return {

                        valid: false,

                        message: "Please enter a valid Instagram URL."

                    };

                }

                const segments =
                    parsed.pathname
                        .split("/")
                        .filter(Boolean);

                if (
                    segments.length < 2 ||
                    !["p", "tv"].includes(
                        segments[0].toLowerCase()
                    )
                ) {

                    return {

                        valid: false,

                        message: "This link is not an Instagram post URL."

                    };

                }

                return {

                    valid: true,

                    message: "Valid Instagram post URL."

                };

            } catch (error) {

                return {

                    valid: false,

                    message: "Invalid URL format."

                };

            }

        }


        /* ====================================================
           6. LIVE VALIDATION
        ==================================================== */

        validateLive() {

            if (!this.input) {
                return false;
            }

            const value =
                this.input.value.trim();

            const wrapper =
                this.input.closest(
                    ".posts-input-wrapper"
                );

            if (!value) {

                this.input.removeAttribute(
                    "aria-invalid"
                );

                if (wrapper) {

                    wrapper.classList.remove(
                        "is-valid",
                        "is-invalid"
                    );

                }

                return false;

            }

            const result =
                this.validatePostURL(value);

            this.input.setAttribute(
                "aria-invalid",
                String(!result.valid)
            );

            if (wrapper) {

                wrapper.classList.toggle(
                    "is-valid",
                    result.valid
                );

                wrapper.classList.toggle(
                    "is-invalid",
                    !result.valid
                );

            }

            return result.valid;

        }


        /* ====================================================
           7. PASTE URL
        ==================================================== */

        async pasteURL() {

            try {

                if (!this.input) {
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

                this.input.value =
                    clipboardText.trim();

                this.validateLive();

                this.input.focus();

                this.showMessage(
                    "Post link pasted successfully!",
                    "success"
                );

            } catch (error) {

                this.showMessage(
                    "Unable to access clipboard.",
                    "error"
                );

            }

        }


        /* ====================================================
           8. CLEAR INPUT
        ==================================================== */

        clearInput() {

            if (!this.input) {
                return;
            }

            this.input.value = "";

            this.input.removeAttribute(
                "aria-invalid"
            );

            const wrapper =
                this.input.closest(
                    ".posts-input-wrapper"
                );

            if (wrapper) {

                wrapper.classList.remove(
                    "is-valid",
                    "is-invalid"
                );

            }

            this.hideError();

            this.hideResult();

            this.input.focus();

        }


        /* ====================================================
           9. START DOWNLOAD
        ==================================================== */

        async startDownload() {

            if (this.isDownloading) {
                return;
            }

            if (!this.input) {
                return;
            }

            const url =
                this.input.value.trim();

            const validation =
                this.validatePostURL(url);

            if (!validation.valid) {

                this.showError(
                    validation.message
                );

                this.input.focus();

                return;

            }

            this.hideError();

            this.hideResult();

            this.saveHistory(url);

            if (
                !window.InstaCrownDownloader ||
                typeof window.startDownload !== "function"
            ) {

                this.showError(
                    "Post download service is not connected yet."
                );

                return;

            }

            this.isDownloading = true;

            this.showLoading();

            this.setButtonLoading(true);

            try {

                const result =
                    await window.startDownload(url);

                if (
                    result &&
                    result.success === false
                ) {

                    throw new Error(
                        result.error ||
                        "Unable to process this post."
                    );

                }

                if (result && result.success) {

                    this.currentResult = result;

                    this.displayResult(result);

                }

            } catch (error) {

                this.showError(
                    error.message ||
                    "Something went wrong."
                );

            } finally {

                this.isDownloading = false;

                this.hideLoading();

                this.setButtonLoading(false);

            }

        }


        /* ====================================================
           10. SHOW LOADING
        ==================================================== */

        showLoading() {

            if (this.loadingContainer) {

                this.loadingContainer.hidden = false;

                this.loadingContainer.setAttribute(
                    "aria-live",
                    "polite"
                );

            }

            this.form.classList.add(
                "is-processing"
            );

        }


        /* ====================================================
           11. HIDE LOADING
        ==================================================== */

        hideLoading() {

            if (this.loadingContainer) {

                this.loadingContainer.hidden = true;

            }

            if (this.form) {

                this.form.classList.remove(
                    "is-processing"
                );

            }

        }


        /* ====================================================
           12. BUTTON LOADING
        ==================================================== */

        setButtonLoading(loading) {

            if (!this.downloadButton) {
                return;
            }

            if (loading) {

                this.downloadButton.dataset.originalText =
                    this.downloadButton.textContent;

                this.downloadButton.textContent =
                    "Processing Post...";

            } else {

                this.downloadButton.textContent =
                    this.downloadButton.dataset.originalText ||
                    "Download Post";

            }

            this.downloadButton.disabled =
                loading;

            this.downloadButton.classList.toggle(
                "is-loading",
                loading
            );

            this.downloadButton.setAttribute(
                "aria-busy",
                String(loading)
            );

        }


        /* ====================================================
           13. DISPLAY POST RESULT
        ==================================================== */

        displayResult(result) {

            if (!this.resultContainer) {
                return;
            }

            this.resultContainer.hidden = false;

            this.resultContainer.classList.add(
                "result-visible"
            );

            const resultLink =
                this.resultContainer.querySelector(
                    PostsConfig.selectors.resultLink
                );

            if (
                resultLink &&
                result.downloadUrl
            ) {

                resultLink.href =
                    result.downloadUrl;

                resultLink.hidden = false;

            }

            this.renderMediaGallery(
                result.media || []
            );

            this.resultContainer.scrollIntoView({

                behavior: "smooth",

                block: "nearest"

            });

        }


        /* ====================================================
           14. RENDER MEDIA GALLERY
        ==================================================== */

        renderMediaGallery(mediaItems) {

            const gallery =
                document.querySelector(
                    PostsConfig.selectors.resultGallery
                );

            if (!gallery) {
                return;
            }

            gallery.replaceChildren();

            if (!Array.isArray(mediaItems)) {
                return;
            }

            mediaItems.forEach((media) => {

                if (!media || !media.url) {
                    return;
                }

                const item =
                    document.createElement("div");

                item.className =
                    "posts-result-item";

                if (media.type === "video") {

                    const video =
                        document.createElement("video");

                    video.src = media.url;

                    video.controls = true;

                    video.playsInline = true;

                    video.preload = "metadata";

                    item.appendChild(video);

                } else {

                    const image =
                        document.createElement("img");

                    image.src = media.url;

                    image.alt =
                        "Instagram post media";

                    image.loading = "lazy";

                    item.appendChild(image);

                }

                gallery.appendChild(item);

            });

        }


        /* ====================================================
           15. HIDE RESULT
        ==================================================== */

        hideResult() {

            if (!this.resultContainer) {
                return;
            }

            this.resultContainer.hidden = true;

            this.resultContainer.classList.remove(
                "result-visible"
            );

            const gallery =
                document.querySelector(
                    PostsConfig.selectors.resultGallery
                );

            if (gallery) {

                gallery.replaceChildren();

            }

            this.currentResult = null;

        }


        /* ====================================================
           16. SHOW ERROR
        ==================================================== */

        showError(message) {

            if (this.errorContainer) {

                this.errorContainer.textContent =
                    message;

                this.errorContainer.hidden = false;

                this.errorContainer.setAttribute(
                    "role",
                    "alert"
                );

            } else {

                this.showMessage(
                    message,
                    "error"
                );

            }

        }


        /* ====================================================
           17. HIDE ERROR
        ==================================================== */

        hideError() {

            if (!this.errorContainer) {
                return;
            }

            this.errorContainer.textContent = "";

            this.errorContainer.hidden = true;

        }


        /* ====================================================
           18. SAVE HISTORY
        ==================================================== */

        saveHistory(url) {

            try {

                const existing =
                    JSON.parse(
                        localStorage.getItem(
                            PostsConfig.storageKey
                        ) || "[]"
                    );

                const filtered =
                    existing.filter(
                        (item) => item.url !== url
                    );

                filtered.unshift({

                    url: url,

                    date: new Date().toISOString()

                });

                this.history =
                    filtered.slice(
                        0,
                        PostsConfig.maximumHistory
                    );

                localStorage.setItem(
                    PostsConfig.storageKey,
                    JSON.stringify(this.history)
                );

                this.renderHistory();

            } catch (error) {

                console.error(
                    "Post history storage error:",
                    error
                );

            }

        }


        /* ====================================================
           19. LOAD HISTORY
        ==================================================== */

        loadHistory() {

            try {

                const data =
                    JSON.parse(
                        localStorage.getItem(
                            PostsConfig.storageKey
                        ) || "[]"
                    );

                this.history =
                    Array.isArray(data)
                        ? data
                        : [];

                this.renderHistory();

            } catch (error) {

                this.history = [];

            }

        }


        /* ====================================================
           20. RENDER HISTORY
        ==================================================== */

        renderHistory() {

            const container =
                document.querySelector(
                    PostsConfig.selectors.history
                );

            if (!container) {
                return;
            }

            container.replaceChildren();

            if (!this.history.length) {

                const empty =
                    document.createElement("p");

                empty.className =
                    "empty-history";

                empty.textContent =
                    "No recent posts yet.";

                container.appendChild(empty);

                return;

            }

            this.history.forEach((item) => {

                const row =
                    document.createElement("div");

                row.className =
                    "post-history-item";

                const url =
                    document.createElement("span");

                url.className =
                    "post-history-url";

                url.textContent =
                    item.url;

                const copy =
                    document.createElement("button");

                copy.type = "button";

                copy.textContent = "Copy";

                copy.addEventListener(
                    "click",
                    () => this.copyURL(item.url)
                );

                const use =
                    document.createElement("button");

                use.type = "button";

                use.textContent = "Use";

                use.addEventListener(
                    "click",
                    () => {

                        if (this.input) {

                            this.input.value =
                                item.url;

                            this.validateLive();

                            this.input.focus();

                        }

                    }
                );

                row.append(
                    url,
                    copy,
                    use
                );

                container.appendChild(row);

            });

        }


        /* ====================================================
           21. COPY URL
        ==================================================== */

        async copyURL(url) {

            try {

                if (
                    window.ClipboardManager &&
                    typeof window.ClipboardManager.copy === "function"
                ) {

                    await window.ClipboardManager.copy(url);

                } else {

                    await navigator.clipboard.writeText(url);

                }

                this.showMessage(
                    "Post link copied!",
                    "success"
                );

            } catch (error) {

                this.showMessage(
                    "Unable to copy link.",
                    "error"
                );

            }

        }


        /* ====================================================
           22. CLEAR HISTORY
        ==================================================== */

        clearHistory() {

            this.history = [];

            localStorage.removeItem(
                PostsConfig.storageKey
            );

            this.renderHistory();

            this.showMessage(
                "Post history cleared.",
                "success"
            );

        }


        /* ====================================================
           23. MESSAGE SYSTEM
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
                    "[Posts Page]",
                    message
                );

            }

        }


        /* ====================================================
           24. GET PAGE STATUS
        ==================================================== */

        getStatus() {

            return {

                initialized:
                    this.isInitialized,

                downloading:
                    this.isDownloading,

                historyCount:
                    this.history.length,

                hasResult:
                    Boolean(this.currentResult)

            };

        }


        /* ====================================================
           25. RESET PAGE
        ==================================================== */

        reset() {

            if (this.input) {

                this.input.value = "";

                this.input.removeAttribute(
                    "aria-invalid"
                );

            }

            this.isDownloading = false;

            this.hideLoading();

            this.hideError();

            this.hideResult();

            this.setButtonLoading(false);

        }

    }


    /* ========================================================
       26. CREATE POSTS PAGE INSTANCE
    ======================================================== */

    const PostsPage =
        new PostsPageManager();


    /* ========================================================
       27. EXPORT GLOBAL API
    ======================================================== */

    window.InstaCrownPosts =
        PostsPage;

    window.PostsPageManager =
        PostsPage;


    /* ========================================================
       28. DOM READY
    ======================================================== */

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            function () {

                PostsPage.init();

            },
            { once: true }
        );

    } else {

        PostsPage.init();

    }


})();


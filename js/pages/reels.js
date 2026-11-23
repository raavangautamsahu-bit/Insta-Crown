
/* ============================================================
   INSTA CROWN 👑
   REELS PAGE CONTROLLER
   File: js/pages/reels.js

   FEATURES:
   1. Reels Page Initialization
   2. Instagram Reel URL Validation
   3. Paste URL From Clipboard
   4. Clear URL Input
   5. Reel Download Request
   6. Loading State
   7. Result Display
   8. Copy Reel URL
   9. Recent Reel History
   10. Download Error Handling
   11. Input Keyboard Controls
   12. Reel Page Animations
============================================================ */

(function () {

    "use strict";


    /* ========================================================
       1. REELS PAGE CONFIGURATION
    ======================================================== */

    const ReelsConfig = {

        selectors: {

            form: "#reelsDownloaderForm",

            input: "#reelsInstagramUrl",

            downloadButton: "#reelsDownloadButton",

            pasteButton: "[data-reels-paste]",

            clearButton: "[data-reels-clear]",

            result: "#reelsDownloadResult",

            loading: "#reelsDownloadLoading",

            error: "#reelsDownloadError",

            history: "#reelsRecentHistory",

            resultVideo: "#reelsResultVideo",

            resultLink: "#reelsResultLink"

        },

        storageKey: "instaCrownReelsHistory",

        maximumHistory: 10,

        allowedHosts: [

            "instagram.com",

            "www.instagram.com",

            "m.instagram.com"

        ]

    };


    /* ========================================================
       2. REELS PAGE MANAGER
    ======================================================== */

    class ReelsPageManager {

        constructor() {

            this.form = null;

            this.input = null;

            this.downloadButton = null;

            this.resultContainer = null;

            this.loadingContainer = null;

            this.errorContainer = null;

            this.isInitialized = false;

            this.isDownloading = false;

            this.currentRequest = null;

            this.history = [];

            this.init();

        }


        /* ====================================================
           3. INITIALIZE REELS PAGE
        ==================================================== */

        init() {

            if (this.isInitialized) {
                return;
            }

            this.form = document.querySelector(
                ReelsConfig.selectors.form
            );

            if (!this.form) {
                return;
            }

            this.input = document.querySelector(
                ReelsConfig.selectors.input
            );

            this.downloadButton = document.querySelector(
                ReelsConfig.selectors.downloadButton
            );

            this.resultContainer = document.querySelector(
                ReelsConfig.selectors.result
            );

            this.loadingContainer = document.querySelector(
                ReelsConfig.selectors.loading
            );

            this.errorContainer = document.querySelector(
                ReelsConfig.selectors.error
            );

            this.attachEvents();

            this.loadHistory();

            this.hideResult();

            this.hideLoading();

            this.hideError();

            this.isInitialized = true;

            console.log(
                "Insta Crown Reels Page Ready 👑"
            );

            window.dispatchEvent(
                new CustomEvent(
                    "instaCrownReelsReady"
                )
            );

        }


        /* ====================================================
           4. ATTACH EVENT LISTENERS
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

                        this.validateInputLive();

                    }
                );

                this.input.addEventListener(
                    "keydown",
                    (event) => {

                        if (event.key === "Escape") {

                            this.clearInput();

                        }

                    }
                );

            }

            document.addEventListener(
                "click",
                (event) => {

                    const pasteButton =
                        event.target.closest(
                            ReelsConfig.selectors.pasteButton
                        );

                    if (pasteButton) {

                        this.pasteURL();

                    }

                    const clearButton =
                        event.target.closest(
                            ReelsConfig.selectors.clearButton
                        );

                    if (clearButton) {

                        this.clearInput();

                    }

                }
            );

        }


        /* ====================================================
           5. VALIDATE REEL URL
        ==================================================== */

        validateReelURL(value) {

            if (!value || typeof value !== "string") {

                return {

                    valid: false,

                    message: "Please enter a Reel URL."

                };

            }

                        try {

                const parsed = new URL(value.trim());

                if (
                    parsed.protocol !== "https:" ||
                    !parsed.hostname ||
                    parsed.username ||
                    parsed.password
                ) {

                    return {
                        valid: false,
                        message: "Please use a secure HTTPS Instagram URL."
                    };

                }

                const hostname =
                    parsed.hostname.toLowerCase();

                if (
                    !ReelsConfig.allowedHosts.includes(
                        hostname
                    )
                ) {

                    return {

                        valid: false,

                        message: "Please use a valid Instagram URL."

                    };

                }

                const path =
                    parsed.pathname.split("/").filter(Boolean);

                if (
                    path.length < 2 ||
                    !["reel", "reels"].includes(
                        path[0].toLowerCase()
                    )
                ) {

                    return {

                        valid: false,

                        message: "This link does not look like an Instagram Reel."

                    };

                }

                return {

                    valid: true,

                    message: "Valid Instagram Reel URL."

                };

            } catch (error) {

                return {

                    valid: false,

                    message: "Please enter a valid URL."

                };

            }

        }


        /* ====================================================
           6. LIVE INPUT VALIDATION
        ==================================================== */

        validateInputLive() {

            if (!this.input) {
                return false;
            }

            const value = this.input.value.trim();

            const wrapper =
                this.input.closest(
                    ".reels-input-wrapper"
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
                this.validateReelURL(value);

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

                let text = "";

                if (
                    window.ClipboardManager &&
                    typeof window.ClipboardManager.read === "function"
                ) {

                    text =
                        await window.ClipboardManager.read();

                } else {

                    text =
                        await navigator.clipboard.readText();

                }

                if (!text) {

                    this.showMessage(
                        "Your clipboard is empty.",
                        "warning"
                    );

                    return;

                }

                this.input.value = text.trim();

                this.validateInputLive();

                this.input.focus();

                this.showMessage(
                    "Reel link pasted successfully!",
                    "success"
                );

            } catch (error) {

                this.showMessage(
                    "Clipboard access failed. Paste your link manually.",
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

            this.currentRequest = null;

            this.input.removeAttribute(
                "aria-invalid"
            );

            const wrapper =
                this.input.closest(
                    ".reels-input-wrapper"
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
           9. START REEL DOWNLOAD
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
                this.validateReelURL(url);

            if (!validation.valid) {

                this.showError(
                    validation.message
                );

                this.input.focus();

                return;

            }

            this.hideError();

            this.hideResult();

            if (
                !window.InstaCrownDownloader ||
                typeof window.startDownload !== "function"
            ) {

                this.showError(
                    "The download service is not connected yet."
                );

                return;

            }

            this.saveHistory(url);

           const requestToken = {};

this.currentRequest = requestToken;

this.isDownloading = true;

            this.showLoading();

            this.setButtonLoading(true);

            try {

                const result =
    await window.startDownload(url);

if (this.currentRequest !== requestToken) {
    return;
}

                if (
                    result &&
                    result.success === false
                ) {

                    throw new Error(
                        result.error ||
                        "Unable to process this Reel."
                    );

                }

                if (
    !result ||
    typeof result !== "object" ||
    result.success !== true
) {

    throw new Error(
        result?.error ||
        "The server returned an invalid response. Please try again."
    );

}

this.displayResult(result);

            } catch (error) {

                if (this.currentRequest === requestToken) {

    this.showError(
        error.message ||
        "Something went wrong while processing the Reel."
    );

                }

            } finally {

    if (this.currentRequest === requestToken) {

        this.isDownloading = false;

        this.hideLoading();

        this.setButtonLoading(false);

        this.currentRequest = null;

    }

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

            if (this.form) {

                this.form.classList.add(
                    "is-processing"
                );

            }

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
           12. BUTTON LOADING STATE
        ==================================================== */

        setButtonLoading(isLoading) {

            if (!this.downloadButton) {
                return;
            }

            this.downloadButton.disabled =
                isLoading;

            this.downloadButton.classList.toggle(
                "is-loading",
                isLoading
            );

            this.downloadButton.setAttribute(
                "aria-busy",
                String(isLoading)
            );

            if (isLoading) {

                this.downloadButton.dataset.originalText =
                    this.downloadButton.textContent;

                this.downloadButton.textContent =
                    "Processing Reel...";

            } else {

                this.downloadButton.textContent =
                    this.downloadButton.dataset.originalText ||
                    "Download Reel";

                this.downloadButton.removeAttribute(
                    "aria-busy"
                );

            }

        }


        /* ====================================================
           13. DISPLAY RESULT
        ==================================================== */

        displayResult(result) {

            if (!this.resultContainer) {
                return;
            }

            const isSafeMediaURL = (value) => {

    if (
        typeof value !== "string" ||
        !value.trim()
    ) {
        return false;
    }

    try {

        const parsed = new URL(value.trim());

        return (
            parsed.protocol === "https:" &&
            Boolean(parsed.hostname) &&
            !parsed.username &&
            !parsed.password
        );

    } catch (error) {

        return false;

    }

};

const safeDownloadURL =
    isSafeMediaURL(result.downloadUrl)
        ? result.downloadUrl
        : "";

const safePreviewURL =
    isSafeMediaURL(result.previewUrl)
        ? result.previewUrl
        : "";

const resultLink =
    this.resultContainer.querySelector(
        ReelsConfig.selectors.resultLink
    );

const resultVideo =
    this.resultContainer.querySelector(
        ReelsConfig.selectors.resultVideo
    );

if (resultLink) {

    resultLink.removeAttribute("href");

    resultLink.hidden = true;

    if (safeDownloadURL) {

        resultLink.href = safeDownloadURL;

        resultLink.target = "_blank";

        resultLink.rel = "noopener noreferrer";

        resultLink.hidden = false;

    }

}

if (resultVideo) {

    resultVideo.pause();

    resultVideo.removeAttribute("src");

    resultVideo.hidden = true;

    if (safePreviewURL) {

        resultVideo.src = safePreviewURL;

        resultVideo.hidden = false;

    }

}

if (!safeDownloadURL && !safePreviewURL) {

    this.showError(
        "The server returned an invalid media link. Please try again."
    );

    this.hideResult();

    return;

}

this.resultContainer.hidden = false;

this.resultContainer.classList.add(
    "result-visible"
);

            this.resultContainer.scrollIntoView({

                behavior: "smooth",

                block: "nearest"

            });

        }


        /* ====================================================
           14. HIDE RESULT
        ==================================================== */

        hideResult() {

            if (!this.resultContainer) {
                return;
            }

            this.resultContainer.hidden = true;

            this.resultContainer.classList.remove(
                "result-visible"
            );

            const video =
                this.resultContainer.querySelector(
                    "video"
                );

            if (video) {

                video.pause();

                video.removeAttribute("src");

                video.load();

            }

        }


        /* ====================================================
           15. SHOW ERROR
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
           16. HIDE ERROR
        ==================================================== */

        hideError() {

            if (!this.errorContainer) {
                return;
            }

            this.errorContainer.textContent = "";

            this.errorContainer.hidden = true;

        }


        /* ====================================================
           17. SAVE RECENT HISTORY
        ==================================================== */

        saveHistory(url) {

            try {

                const storedHistory =
    JSON.parse(
        localStorage.getItem(
            ReelsConfig.storageKey
        ) || "[]"
    );

const existing =
    Array.isArray(storedHistory)
        ? storedHistory
        : [];

const filtered =
    existing.filter((item) => {

        if (
            !item ||
            typeof item !== "object" ||
            typeof item.url !== "string" ||
            typeof item.date !== "string"
        ) {
            return false;
        }

        const validation =
            this.validateReelURL(item.url);

        if (!validation.valid) {
            return false;
        }

        if (
            Number.isNaN(
                new Date(item.date).getTime()
            )
        ) {
            return false;
        }

        return item.url !== url;

    });

                filtered.unshift({

                    url: url,

                    date: new Date().toISOString()

                });

                this.history =
                    filtered.slice(
                        0,
                        ReelsConfig.maximumHistory
                    );

                localStorage.setItem(
                    ReelsConfig.storageKey,
                    JSON.stringify(this.history)
                );

                this.renderHistory();

            } catch (error) {

                console.error(
                    "Reel history error:",
                    error
                );

            }

        }


        /* ====================================================
           18. LOAD HISTORY
        ==================================================== */

        loadHistory() {

            try {

                                const storedHistory =
                    JSON.parse(
                        localStorage.getItem(
                            ReelsConfig.storageKey
                        ) || "[]"
                    );

                this.history = Array.isArray(storedHistory)
                    ? storedHistory.filter((item) => {

                        if (
                            !item ||
                            typeof item !== "object" ||
                            typeof item.url !== "string" ||
                            typeof item.date !== "string"
                        ) {
                            return false;
                        }

                        const validation =
                            this.validateReelURL(item.url);

                        if (!validation.valid) {
                            return false;
                        }

                        if (
                            Number.isNaN(
                                new Date(item.date).getTime()
                            )
                        ) {
                            return false;
                        }

                        return true;

                    }).slice(0, ReelsConfig.maximumHistory)
                    : [];

                this.renderHistory();

            } catch (error) {

                this.history = [];

            }

        }


        /* ====================================================
           19. RENDER HISTORY
        ==================================================== */

        renderHistory() {

            const container =
                document.querySelector(
                    ReelsConfig.selectors.history
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
                    "No recent Reels yet.";

                container.appendChild(empty);

                return;

            }

            this.history.forEach((item) => {

                const row =
                    document.createElement("div");

                row.className =
                    "reel-history-item";

                const link =
                    document.createElement("span");

                link.className =
                    "reel-history-url";

                link.textContent =
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

                            this.validateInputLive();

                            this.input.focus();

                        }

                    }
                );

                row.append(
                    link,
                    copy,
                    use
                );

                container.appendChild(row);

            });

        }


        /* ====================================================
           20. COPY URL
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
                    "Reel URL copied!",
                    "success"
                );

            } catch (error) {

                this.showMessage(
                    "Unable to copy Reel URL.",
                    "error"
                );

            }

        }


        /* ====================================================
           21. CLEAR HISTORY
        ==================================================== */

        clearHistory() {

            this.history = [];

            localStorage.removeItem(
                ReelsConfig.storageKey
            );

            this.renderHistory();

            this.showMessage(
                "Reel history cleared.",
                "success"
            );

        }


        /* ====================================================
           22. REEL PAGE MESSAGE
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
                    "[Reels Page]",
                    message
                );

            }

        }


        /* ====================================================
           23. PAGE STATUS
        ==================================================== */

        getStatus() {

            return {

                initialized:
                    this.isInitialized,

                downloading:
                    this.isDownloading,

                historyCount:
                    this.history.length

            };

        }


        /* ====================================================
           24. RESET PAGE
        ==================================================== */

        reset() {

            if (this.input) {

                this.input.value = "";

            }

            this.hideLoading();

            this.hideError();

            this.hideResult();

            this.isDownloading = false;

this.currentRequest = null;

this.setButtonLoading(false);

        }

    }


    /* ========================================================
       25. CREATE REELS PAGE INSTANCE
    ======================================================== */

    const ReelsPage =
        new ReelsPageManager();


    /* ========================================================
       26. EXPORT GLOBAL API
    ======================================================== */

    window.InstaCrownReels =
        ReelsPage;

    window.ReelsPageManager =
        ReelsPage;


    /* ========================================================
       27. INITIALIZE AFTER DOM READY
    ======================================================== */

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            function () {

                ReelsPage.init();

            },
            { once: true }
        );

    } else {

        ReelsPage.init();

    }


})();



/* ============================================================
   INSTA CROWN 👑
   FILE: js/pages/stories.js

   Instagram Stories Downloader Page Controller
   Features:
   1. Instagram Story URL Validation
   2. Paste and Clear URL
   3. Download API Integration
   4. Loading and Error Management
   5. Result Rendering
   6. Recent Download History
   7. Copy URL and Open Result
   8. Mobile Friendly Controls

   NOTE:
   Actual downloading requires an authorized backend/API.
   Private-account restrictions are never bypassed.
============================================================ */

(function () {
    "use strict";

    /* --------------------------------------------------------
       1. STORIES CONFIGURATION
    -------------------------------------------------------- */

    const StoriesConfig = {
        selectors: {
            form: "#storiesDownloaderForm",
            input: "#storiesInstagramUrl",
            button: "#storiesDownloadButton",
            paste: "[data-stories-paste]",
            clear: "[data-stories-clear]",
            result: "#storiesDownloadResult",
            loading: "#storiesDownloadLoading",
            error: "#storiesDownloadError",
            history: "#storiesRecentHistory",
            gallery: "#storiesResultGallery"
        },

        storageKey: "instaCrownStoriesHistory",

        maxHistory: 15,

        allowedHosts: [
            "instagram.com",
            "www.instagram.com",
            "m.instagram.com"
        ],

        apiTimeout: 45000
    };


    /* --------------------------------------------------------
       2. STORIES PAGE MANAGER
    -------------------------------------------------------- */

    class StoriesPageManager {

        constructor() {
            this.form = document.querySelector(
                StoriesConfig.selectors.form
            );

            this.input = document.querySelector(
                StoriesConfig.selectors.input
            );

            this.button = document.querySelector(
                StoriesConfig.selectors.button
            );

            this.pasteButton = document.querySelector(
                StoriesConfig.selectors.paste
            );

            this.clearButton = document.querySelector(
                StoriesConfig.selectors.clear
            );

            this.resultBox = document.querySelector(
                StoriesConfig.selectors.result
            );

            this.loadingBox = document.querySelector(
                StoriesConfig.selectors.loading
            );

            this.errorBox = document.querySelector(
                StoriesConfig.selectors.error
            );

            this.historyBox = document.querySelector(
                StoriesConfig.selectors.history
            );

            this.galleryBox = document.querySelector(
                StoriesConfig.selectors.gallery
            );

            this.isDownloading = false;
            this.history = [];

            this.init();
        }


        /* ----------------------------------------------------
           3. INITIALIZATION
        ---------------------------------------------------- */

        init() {

            if (!this.form || !this.input) {
                return;
            }

            this.loadHistory();

            this.bindEvents();

            this.renderHistory();

            this.hideLoading();

            this.hideError();

            console.log(
                "Insta Crown Stories Page Initialized 👑"
            );
        }


        /* ----------------------------------------------------
           4. EVENT LISTENERS
        ---------------------------------------------------- */

        bindEvents() {

            this.form.addEventListener(
                "submit",
                (event) => {
                    event.preventDefault();
                    this.handleDownload();
                }
            );


            if (this.pasteButton) {
                this.pasteButton.addEventListener(
                    "click",
                    () => this.pasteURL()
                );
            }


            if (this.clearButton) {
                this.clearButton.addEventListener(
                    "click",
                    () => this.clearInput()
                );
            }


            this.input.addEventListener(
                "input",
                () => {
                    this.hideError();
                    this.hideResult();
                    this.validateInputLive();
                }
            );


            this.input.addEventListener(
                "paste",
                () => {
                    setTimeout(() => {
                        this.validateInputLive();
                    }, 100);
                }
            );


            if (this.historyBox) {
                this.historyBox.addEventListener(
                    "click",
                    (event) => {
                        const target = event.target.closest(
                            "[data-story-action]"
                        );

                        if (!target) return;

                        const action = target.dataset.storyAction;
                        const url = target.dataset.url;

                        this.handleHistoryAction(action, url);
                    }
                );
            }
        }


        /* ----------------------------------------------------
           5. INSTAGRAM URL VALIDATION
        ---------------------------------------------------- */

        validateURL(value) {

            if (!value || typeof value !== "string") {
                return {
                    valid: false,
                    message: "Please Instagram Story URL enter karein."
                };
            }

            let parsedURL;

            try {
                parsedURL = new URL(value.trim());
            } catch (error) {
                return {
                    valid: false,
                    message: "Please ek valid Instagram URL enter karein."
                };
            }


            if (
                !["https:", "http:"].includes(parsedURL.protocol)
            ) {
                return {
                    valid: false,
                    message: "Invalid URL protocol."
                };
            }


            const hostname = parsedURL.hostname.toLowerCase();

            if (!StoriesConfig.allowedHosts.includes(hostname)) {
                return {
                    valid: false,
                    message: "Sirf Instagram URLs allowed hain."
                };
            }


            const path = parsedURL.pathname
                .replace(/\/+/g, "/")
                .replace(/\/$/, "");


            const storyPattern = /^\/stories\/([a-zA-Z0-9._]+)(?:\/([0-9]+))?$/;

            if (!storyPattern.test(path)) {
                return {
                    valid: false,
                    message:
                        "Ye valid Instagram Stories URL nahi lag raha. Story URL paste karein."
                };
            }


            return {
                valid: true,
                message: "Valid Instagram Story URL.",
                url: parsedURL.href,
                username: path.split("/")[2]
            };
        }


        /* ----------------------------------------------------
           6. LIVE INPUT VALIDATION
        ---------------------------------------------------- */

        validateInputLive() {

            const value = this.input.value.trim();

            if (!value) {
                this.input.classList.remove(
                    "input-valid",
                    "input-invalid"
                );

                return;
            }


            const result = this.validateURL(value);

            this.input.classList.toggle(
                "input-valid",
                result.valid
            );

            this.input.classList.toggle(
                "input-invalid",
                !result.valid
            );
        }


        /* ----------------------------------------------------
           7. PASTE URL
        ---------------------------------------------------- */

        async pasteURL() {

            try {

                let clipboardText = "";

                if (
                    window.ClipboardManager &&
                    typeof window.ClipboardManager.read === "function"
                ) {
                    clipboardText =
                        await window.ClipboardManager.read();
                } else if (
                    navigator.clipboard &&
                    navigator.clipboard.readText
                ) {
                    clipboardText =
                        await navigator.clipboard.readText();
                } else {
                    throw new Error(
                        "Clipboard access available nahi hai."
                    );
                }


                if (!clipboardText) {
                    throw new Error(
                        "Clipboard empty hai."
                    );
                }


                this.input.value = clipboardText.trim();

                this.validateInputLive();

                this.hideError();

                this.showToast(
                    "Story URL pasted successfully!",
                    "success"
                );

            } catch (error) {

                this.showError(
                    error.message ||
                    "Clipboard se URL paste nahi ho paya."
                );
            }
        }


        /* ----------------------------------------------------
           8. CLEAR INPUT
        ---------------------------------------------------- */

        clearInput() {

            this.input.value = "";

            this.input.classList.remove(
                "input-valid",
                "input-invalid"
            );

            this.hideError();

            this.hideResult();

            this.hideLoading();

            this.input.focus();
        }


        /* ----------------------------------------------------
           9. DOWNLOAD BUTTON HANDLER
        ---------------------------------------------------- */

        async handleDownload() {

            if (this.isDownloading) {
                return;
            }


            const url = this.input.value.trim();

            const validation = this.validateURL(url);


            if (!validation.valid) {

                this.showError(validation.message);

                this.input.focus();

                return;
            }


            this.hideError();

            this.hideResult();

            this.showLoading();

            this.setButtonLoading(true);


            this.isDownloading = true;


            try {

                const response = await this.requestDownload(
                    validation.url
                );


                if (
                    !response ||
                    response.success !== true
                ) {
                    throw new Error(
                        response?.message ||
                        "Story download result nahi mila."
                    );
                }


                this.renderResult(response);


                this.addToHistory({
                    url: validation.url,
                    username: validation.username,
                    date: new Date().toISOString(),
                    status: "success"
                });


                this.showToast(
                    "Story information successfully received!",
                    "success"
                );


            } catch (error) {

                this.showError(
                    error.message ||
                    "Something went wrong. Please try again."
                );

                this.addToHistory({
                    url: validation.url,
                    username: validation.username,
                    date: new Date().toISOString(),
                    status: "failed"
                });

            } finally {

                this.hideLoading();

                this.setButtonLoading(false);

                this.isDownloading = false;
            }
        }


        /* ----------------------------------------------------
           10. BACKEND REQUEST
        ---------------------------------------------------- */

        async requestDownload(url) {

            /*
              IMPORTANT:

              Backend API endpoint ko downloader.js ke saath
              integration review ke waqt configure karenge.

              Frontend alone Instagram media download nahi kar sakta.
            */


            if (
                typeof window.startDownload === "function"
            ) {

                const result = await window.startDownload(url);

                if (result && typeof result === "object") {
                    return result;
                }
            }


            throw new Error(
                "Stories download service abhi configure nahi hui hai. Backend API connect hone ke baad download available hoga."
            );
        }


        /* ----------------------------------------------------
           11. RENDER DOWNLOAD RESULT
        ---------------------------------------------------- */

        renderResult(data) {

            if (!this.resultBox) {
                return;
            }


            this.resultBox.replaceChildren();


            const wrapper = document.createElement("div");

            wrapper.className = "stories-result-card";


            const heading = document.createElement("h3");

            heading.textContent = "Story Result";


            const description = document.createElement("p");

            description.textContent =
                "Your authorized story media is ready.";


            wrapper.appendChild(heading);

            wrapper.appendChild(description);


            if (this.galleryBox) {

                this.galleryBox.innerHTML = "";

                const mediaItems = Array.isArray(data.media)
                    ? data.media
                    : data.downloadUrl
                        ? [{ url: data.downloadUrl, type: "video" }]
                        : [];


                mediaItems.forEach((item) => {

                    if (!item || !item.url) return;

                    const mediaURL = this.safeMediaURL(item.url);

                    if (!mediaURL) return;


                    const mediaElement = document.createElement(
                        item.type === "image" ? "img" : "video"
                    );

                    mediaElement.className =
                        "stories-result-media";


                    if (item.type === "image") {

                        mediaElement.src = mediaURL;

                        mediaElement.alt = "Instagram Story";

                        mediaElement.loading = "lazy";

                    } else {

                        mediaElement.src = mediaURL;

                        mediaElement.controls = true;

                        mediaElement.playsInline = true;
                    }


                    this.galleryBox.appendChild(mediaElement);


                    const downloadLink =
                        document.createElement("a");

                    downloadLink.href = mediaURL;

                    downloadLink.target = "_blank";

                    downloadLink.rel = "noopener noreferrer";

                    downloadLink.textContent = "Open Media";


                    this.galleryBox.appendChild(downloadLink);
                });
            }


            wrapper.appendChild(
                this.galleryBox || document.createElement("div")
            );


            this.resultBox.appendChild(wrapper);

            this.resultBox.hidden = false;
        }


        /* ----------------------------------------------------
           12. SAFE MEDIA URL
        ---------------------------------------------------- */

        safeMediaURL(value) {

            try {

                const url = new URL(value);

                if (
                    !["https:", "http:"].includes(url.protocol)
                ) {
                    return null;
                }

                return url.href;

            } catch (error) {

                return null;
            }
        }


        /* ----------------------------------------------------
           13. LOADING STATE
        ---------------------------------------------------- */

        showLoading() {

            if (this.loadingBox) {
                this.loadingBox.hidden = false;

                this.loadingBox.setAttribute(
                    "aria-live",
                    "polite"
                );
            }
        }


        hideLoading() {

            if (this.loadingBox) {
                this.loadingBox.hidden = true;
            }
        }


        setButtonLoading(loading) {

            if (!this.button) return;

            this.button.disabled = loading;

            this.button.classList.toggle(
                "is-loading",
                loading
            );


            if (!this.button.dataset.originalText) {

                this.button.dataset.originalText =
                    this.button.textContent.trim();
            }


            this.button.textContent = loading
                ? "Processing Story..."
                : this.button.dataset.originalText;
        }


        /* ----------------------------------------------------
           14. ERROR HANDLING
        ---------------------------------------------------- */

        showError(message) {

            if (this.errorBox) {

                this.errorBox.textContent = message;

                this.errorBox.hidden = false;

                this.errorBox.setAttribute(
                    "role",
                    "alert"
                );

            } else {

                this.showToast(message, "error");
            }
        }


        hideError() {

            if (this.errorBox) {

                this.errorBox.textContent = "";

                this.errorBox.hidden = true;
            }
        }


        /* ----------------------------------------------------
           15. HIDE RESULT
        ---------------------------------------------------- */

        hideResult() {

            if (this.resultBox) {

                this.resultBox.hidden = true;

                this.resultBox.replaceChildren();
            }

            if (this.galleryBox) {
                this.galleryBox.replaceChildren();
            }
        }


        /* ----------------------------------------------------
           16. LOCAL HISTORY
        ---------------------------------------------------- */

        loadHistory() {

            try {

                const stored = localStorage.getItem(
                    StoriesConfig.storageKey
                );

                this.history = stored
                    ? JSON.parse(stored)
                    : [];


                if (!Array.isArray(this.history)) {
                    this.history = [];
                }

            } catch (error) {

                this.history = [];
            }
        }


        saveHistory() {

            try {

                localStorage.setItem(
                    StoriesConfig.storageKey,
                    JSON.stringify(this.history)
                );

            } catch (error) {

                console.warn(
                    "Stories history could not be saved.",
                    error
                );
            }
        }


        addToHistory(item) {

            this.history = this.history.filter(
                (entry) => entry.url !== item.url
            );


            this.history.unshift(item);


            this.history = this.history.slice(
                0,
                StoriesConfig.maxHistory
            );


            this.saveHistory();

            this.renderHistory();
        }


        /* ----------------------------------------------------
           17. RENDER HISTORY
        ---------------------------------------------------- */

        renderHistory() {

            if (!this.historyBox) {
                return;
            }


            this.historyBox.replaceChildren();


            if (this.history.length === 0) {

                const empty = document.createElement("p");

                empty.className = "stories-history-empty";

                empty.textContent =
                    "Abhi koi recent Story URL nahi hai.";


                this.historyBox.appendChild(empty);

                return;
            }


            this.history.forEach((item) => {

                const card = document.createElement("div");

                card.className = "stories-history-item";


                const username = document.createElement("strong");

                username.textContent =
                    "@" + (item.username || "instagram-user");


                const date = document.createElement("small");

                date.textContent = this.formatDate(item.date);


                const status = document.createElement("span");

                status.className =
                    "history-status " + item.status;

                status.textContent =
                    item.status === "success"
                        ? "Completed"
                        : "Not completed";


                const actions = document.createElement("div");

                actions.className = "stories-history-actions";


                const useButton =
                    document.createElement("button");

                useButton.type = "button";

                useButton.textContent = "Use URL";

                useButton.dataset.storyAction = "use";

                useButton.dataset.url = item.url;


                const copyButton =
                    document.createElement("button");

                copyButton.type = "button";

                copyButton.textContent = "Copy";

                copyButton.dataset.storyAction = "copy";

                copyButton.dataset.url = item.url;


                actions.appendChild(useButton);

                actions.appendChild(copyButton);


                card.appendChild(username);

                card.appendChild(date);

                card.appendChild(status);

                card.appendChild(actions);


                this.historyBox.appendChild(card);
            });
        }


        /* ----------------------------------------------------
           18. HISTORY ACTIONS
        ---------------------------------------------------- */

        async handleHistoryAction(action, url) {

            if (!url) return;


            if (action === "use") {

                this.input.value = url;

                this.validateInputLive();

                this.input.focus();

                this.hideError();

                this.hideResult();

                return;
            }


            if (action === "copy") {

                try {

                    if (
                        window.ClipboardManager &&
                        typeof window.ClipboardManager.copy === "function"
                    ) {

                        await window.ClipboardManager.copy(url);

                    } else if (
                        navigator.clipboard &&
                        navigator.clipboard.writeText
                    ) {

                        await navigator.clipboard.writeText(url);

                    } else {

                        throw new Error(
                            "Clipboard unavailable."
                        );
                    }


                    this.showToast(
                        "Story URL copied!",
                        "success"
                    );

                } catch (error) {

                    this.showToast(
                        "URL copy nahi ho paya.",
                        "error"
                    );
                }
            }
        }


        /* ----------------------------------------------------
           19. FORMAT DATE
        ---------------------------------------------------- */

        formatDate(value) {

            const date = new Date(value);

            if (Number.isNaN(date.getTime())) {
                return "Unknown date";
            }


            return date.toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });
        }


        /* ----------------------------------------------------
           20. TOAST NOTIFICATION
        ---------------------------------------------------- */

        showToast(message, type = "info") {

            if (
                window.Toast &&
                typeof window.Toast.show === "function"
            ) {

                window.Toast.show(message, type);

                return;
            }


            console.log(
                "[Insta Crown]",
                type,
                message
            );
        }


        /* ----------------------------------------------------
           21. CLEAR HISTORY
        ---------------------------------------------------- */

        clearHistory() {

            this.history = [];

            this.saveHistory();

            this.renderHistory();

            this.showToast(
                "Stories history cleared.",
                "success"
            );
        }


        /* ----------------------------------------------------
           22. DESTROY PAGE
        ---------------------------------------------------- */

        destroy() {

            this.hideLoading();

            this.isDownloading = false;

            console.log(
                "Stories Page Manager Destroyed."
            );
        }
    }


    /* --------------------------------------------------------
       23. INITIALIZE STORIES PAGE
    -------------------------------------------------------- */

    function initializeStoriesPage() {

        if (
            !document.querySelector(
                StoriesConfig.selectors.form
            )
        ) {
            return;
        }


        if (window.StoriesPageManager) {
            return;
        }


        const manager = new StoriesPageManager();


        window.StoriesPageManager = manager;

        window.InstaCrownStories = manager;


        console.log(
            "Insta Crown Stories System Ready 👑"
        );
    }


    /* --------------------------------------------------------
       24. DOCUMENT READY
    -------------------------------------------------------- */

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            initializeStoriesPage,
            { once: true }
        );

    } else {

        initializeStoriesPage();
    }


})();


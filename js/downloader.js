
/* =========================================================
   INSTA CROWN 👑
   FILE: js/downloader.js
   PURPOSE: Main Instagram Downloader Controller
   ========================================================= */

(function () {
    "use strict";


    /* -----------------------------------------------------
       1. DOWNLOADER CONFIGURATION
    ----------------------------------------------------- */

    const DownloaderConfig = {

        inputSelector: "#instagramUrl",

        formSelector: "#downloaderForm",

        submitSelector: "#downloadButton",

        resultSelector: "#downloadResult",

        loadingSelector: "#downloadLoading",

        errorSelector: "#downloadError",

        apiEndpoint: "",

        requestTimeout: 30000,

        supportedTypes: [
            "reel",
            "p",
            "tv",
            "stories"
        ],

        autoClearInput: false,

        showResult: true

    };


    /* -----------------------------------------------------
       2. DOWNLOADER MANAGER
    ----------------------------------------------------- */

    const Downloader = {

        isProcessing: false,

        currentRequest: null,

        lastValidatedURL: null,

        lastResult: null,


        /* -------------------------------------------------
           3. GET DOM ELEMENTS
        ------------------------------------------------- */

        getElement: function (selector) {

            return document.querySelector(selector);

        },


        /* -------------------------------------------------
           4. GET INPUT URL
        ------------------------------------------------- */

        getInputValue: function () {

            const input = this.getElement(
                DownloaderConfig.inputSelector
            );

            return input ? input.value.trim() : "";

        },


        /* -------------------------------------------------
           5. SHOW MESSAGE
        ------------------------------------------------- */

        showMessage: function (message, type = "info") {

            if (
                window.Toast &&
                typeof window.Toast.show === "function"
            ) {

                window.Toast.show(message, type);

                return;

            }

            console.log(
                "[Insta Crown]",
                type.toUpperCase(),
                message
            );

        },


        /* -------------------------------------------------
           6. SHOW LOADING
        ------------------------------------------------- */

        showLoading: function (show = true) {

            const loading = this.getElement(
                DownloaderConfig.loadingSelector
            );

            const button = this.getElement(
                DownloaderConfig.submitSelector
            );

            if (loading) {

                loading.classList.toggle(
                    "hidden",
                    !show
                );

                loading.setAttribute(
                    "aria-hidden",
                    String(!show)
                );

            }

            if (button) {

                button.disabled = show;

                button.classList.toggle(
                    "is-loading",
                    show
                );

                if (!button.dataset.originalText) {

                    button.dataset.originalText =
                        button.textContent.trim();

                }

                button.textContent = show
                    ? "Processing..."
                    : button.dataset.originalText;

            }

            this.isProcessing = show;

        },


        /* -------------------------------------------------
           7. SHOW ERROR
        ------------------------------------------------- */

        showError: function (message) {

            const errorElement = this.getElement(
                DownloaderConfig.errorSelector
            );

            const resultElement = this.getElement(
                DownloaderConfig.resultSelector
            );

            if (resultElement) {

                resultElement.classList.add("hidden");

            }

            if (errorElement) {

                errorElement.textContent = message;

                errorElement.classList.remove("hidden");

                errorElement.setAttribute(
                    "role",
                    "alert"
                );

            }

            this.showMessage(message, "error");

        },


        /* -------------------------------------------------
           8. CLEAR ERROR
        ------------------------------------------------- */

        clearError: function () {

            const errorElement = this.getElement(
                DownloaderConfig.errorSelector
            );

            if (errorElement) {

                errorElement.textContent = "";

                errorElement.classList.add("hidden");

            }

        },


        /* -------------------------------------------------
           9. CLEAR PREVIOUS RESULTS
        ------------------------------------------------- */

                clearResults: function () {

            const resultElement = this.getElement(
                DownloaderConfig.resultSelector
            );

            if (resultElement) {

                resultElement.replaceChildren();

                resultElement.classList.add("hidden");

                resultElement.setAttribute(
                    "aria-hidden",
                    "true"
                );

            }

            this.lastResult = null;

        },

        /* -------------------------------------------------
           10. VALIDATE SUBMITTED URL
        ------------------------------------------------- */

        validateURL: function (value) {

            if (
                !window.ValidationManager ||
                typeof window.ValidationManager.validateInstagramURL !==
                    "function"
            ) {

                return {

                    valid: false,

                    message: "Validation system is not ready."

                };

            }

            return window.ValidationManager.validateInstagramURL(
                value
            );

        },


        /* -------------------------------------------------
           11. DETECT CONTENT TYPE
        ------------------------------------------------- */

        detectType: function (url) {

            const result = this.validateURL(url);

            return result.valid
                ? result.type
                : null;

        },


        /* -------------------------------------------------
           12. CREATE API REQUEST
        ------------------------------------------------- */

        createRequest: async function (url, type, signal) {

            if (!DownloaderConfig.apiEndpoint) {

                throw new Error(
                    "Downloader service is not connected yet. Please connect a supported media API."
                );

            }

            const response = await fetch(
                DownloaderConfig.apiEndpoint,
                {

                    method: "POST",

                    headers: {

                        "Content-Type": "application/json",

                        "Accept": "application/json"

                    },

                    body: JSON.stringify({

                        url: url,

                        type: type

                    }),

                    signal: signal

                }
            );

            if (!response.ok) {

                throw new Error(
                    "Downloader service returned an error. Please try again later."
                );

            }

            const data = await response.json();

            if (
                !data ||
                typeof data !== "object"
            ) {

                throw new Error(
                    "Invalid response from downloader service."
                );

            }

            return data;

        },


        /* -------------------------------------------------
           13. CHECK API RESPONSE
        ------------------------------------------------- */

                validateAPIResponse: function (data) {

            if (
                !data ||
                typeof data !== "object" ||
                Array.isArray(data)
            ) {
                return false;
            }

            if (data.success !== true) {
                return false;
            }

            if (
                !Array.isArray(data.media) ||
                data.media.length === 0
            ) {
                return false;
            }

            const isSafeHTTPSUrl = (value) => {

                if (
                    typeof value !== "string" ||
                    value.trim() === ""
                ) {
                    return false;
                }

                try {

                    const parsedURL = new URL(value);

                    return (
                        parsedURL.protocol === "https:" &&
                        parsedURL.hostname !== "" &&
                        !parsedURL.username &&
                        !parsedURL.password
                    );

                } catch (error) {

                    return false;

                }

            };

            return data.media.every((item) => {

                if (
                    !item ||
                    typeof item !== "object" ||
                    !isSafeHTTPSUrl(item.url)
                ) {
                    return false;
                }

                if (
                    item.thumbnail &&
                    !isSafeHTTPSUrl(item.thumbnail)
                ) {
                    return false;
                }

                return true;

            });

        },


        /* -------------------------------------------------
           14. CREATE SAFE RESULT ELEMENT
        ------------------------------------------------- */

        createResultElement: function (data) {

            const wrapper = document.createElement("div");

            wrapper.className = "download-result-card";

            const heading = document.createElement("h3");

            heading.className = "result-heading";

            heading.textContent = "Your content is ready! 👑";

            wrapper.appendChild(heading);

            const mediaContainer = document.createElement("div");

            mediaContainer.className = "result-media-list";

            data.media.forEach((item, index) => {

                const mediaCard = document.createElement("div");

                mediaCard.className = "result-media-item";

                const title = document.createElement("p");

                title.textContent =
                    item.title || "Instagram Media " + (index + 1);

                mediaCard.appendChild(title);

                if (item.thumbnail) {

                    const thumbnail = document.createElement("img");

                    thumbnail.src = item.thumbnail;

                    thumbnail.alt = "Media preview";

                    thumbnail.loading = "lazy";

                    thumbnail.referrerPolicy = "no-referrer";

                    thumbnail.className = "result-thumbnail";

                    mediaCard.appendChild(thumbnail);

                }

                const downloadLink = document.createElement("a");

                downloadLink.href = item.url;

                downloadLink.target = "_blank";

                downloadLink.rel = "noopener noreferrer";

                downloadLink.className = "btn primary-button";

                downloadLink.textContent =
                    item.label || "Open Media";

                mediaCard.appendChild(downloadLink);

                mediaContainer.appendChild(mediaCard);

            });

            wrapper.appendChild(mediaContainer);

            return wrapper;

        },


        /* -------------------------------------------------
           15. DISPLAY RESULTS
        ------------------------------------------------- */

        displayResults: function (data) {

            const resultElement = this.getElement(
                DownloaderConfig.resultSelector
            );

            if (!resultElement) {

                this.showMessage(
                    "Result container not found.",
                    "error"
                );

                return false;

            }

            resultElement.replaceChildren(
                this.createResultElement(data)
            );

            resultElement.classList.remove("hidden");
                       resultElement.setAttribute(
                "aria-hidden",
                "false"
            );

            resultElement.scrollIntoView({

                behavior: "smooth",

                block: "nearest"

            });

            this.lastResult = data;

            return true;

        },


        /* -------------------------------------------------
           16. CANCEL CURRENT REQUEST
        ------------------------------------------------- */

                cancelRequest: function () {

            const controller = this.currentRequest;

            if (controller) {

                this.currentRequest = null;

                controller.abort();

            }

            this.showLoading(false);

        },

        /* -------------------------------------------------
           17. PROCESS DOWNLOAD
        ------------------------------------------------- */

                processDownload: async function (value) {

            if (this.isProcessing) {
                return false;
            }

            this.clearError();

            this.clearResults();

            const validation = this.validateURL(value);

            if (!validation.valid) {

                this.showError(validation.message);

                return false;

            }

            this.lastValidatedURL = validation.url;

            this.showLoading(true);

            const controller = new AbortController();

            this.currentRequest = controller;

            const timeout = window.setTimeout(() => {

                controller.abort();

            }, DownloaderConfig.requestTimeout);

            try {

                const response = await this.createRequest(

                    validation.url,

                    validation.type,

                    controller.signal

                );

                if (this.currentRequest !== controller) {
                    return false;
                }

                if (!this.validateAPIResponse(response)) {

                    throw new Error(
                        response.message ||
                        "No downloadable media was returned by the service."
                    );

                }

                if (DownloaderConfig.showResult) {

                    this.displayResults(response);

                }

                this.showMessage(
                    "Media information received successfully! 👑",
                    "success"
                );

                if (DownloaderConfig.autoClearInput) {

                    const input = this.getElement(
                        DownloaderConfig.inputSelector
                    );

                    if (input) {
                        input.value = "";
                    }

                }

                return true;

            } catch (error) {

                if (this.currentRequest !== controller) {
                    return false;
                }

                if (error.name === "AbortError") {

                    this.showError(
                        "Request timed out or was cancelled. Please try again."
                    );

                } else {

                    this.showError(
                        error.message ||
                        "Something went wrong. Please try again."
                    );

                }

                console.error(
                    "Insta Crown Downloader Error:",
                    error
                );

                return false;

            } finally {

                window.clearTimeout(timeout);

                if (this.currentRequest === controller) {

                    this.currentRequest = null;

                    this.showLoading(false);

                }

            }

        },

        /* -------------------------------------------------
           18. HANDLE FORM SUBMISSION
        ------------------------------------------------- */

        handleSubmit: function (event) {

            if (event) {
                event.preventDefault();
            }

            const value = this.getInputValue();

            return this.processDownload(value);

        },


        /* -------------------------------------------------
           19. INITIALIZE FORM
        ------------------------------------------------- */

        initForm: function () {

            const form = this.getElement(
                DownloaderConfig.formSelector
            );

            if (!form) {
                return;
            }

            if (
                form.dataset.downloaderInitialized === "true"
            ) {
                return;
            }

            form.dataset.downloaderInitialized = "true";

            form.addEventListener("submit", (event) => {

                this.handleSubmit(event);

            });

        },


        /* -------------------------------------------------
           20. INITIALIZE CLEAR BUTTON
        ------------------------------------------------- */

        initClearButton: function () {

            const clearButtons = document.querySelectorAll(
                "[data-clear-downloader]"
            );

            clearButtons.forEach((button) => {

                if (
                    button.dataset.clearInitialized === "true"
                ) {
                    return;
                }

                button.dataset.clearInitialized = "true";

                button.addEventListener("click", () => {

                    const input = this.getElement(
                        DownloaderConfig.inputSelector
                    );

                    if (input) {

                        input.value = "";

                        input.focus();

                    }

                    this.clearError();

                    this.clearResults();

                });

            });

        },


        /* -------------------------------------------------
           21. INITIALIZE SAMPLE LINK BUTTONS
        ------------------------------------------------- */

        initSampleButtons: function () {

            const buttons = document.querySelectorAll(
                "[data-sample-link]"
            );

            buttons.forEach((button) => {

                if (
                    button.dataset.sampleInitialized === "true"
                ) {
                    return;
                }

                button.dataset.sampleInitialized = "true";

                button.addEventListener("click", () => {

                    const input = this.getElement(
                        DownloaderConfig.inputSelector
                    );

                    if (!input) {
                        return;
                    }

                    input.value = button.dataset.sampleLink;

                    input.dispatchEvent(
                        new Event("input", {
                            bubbles: true
                        })
                    );

                    input.focus();

                });

            });

        },


        /* -------------------------------------------------
           22. REFRESH DYNAMIC ELEMENTS
        ------------------------------------------------- */

        refresh: function () {

            this.initForm();

            this.initClearButton();

            this.initSampleButtons();

        },


        /* -------------------------------------------------
           23. INITIALIZE DOWNLOADER
        ------------------------------------------------- */

        init: function () {

            this.initForm();

            this.initClearButton();

            this.initSampleButtons();

            console.log(
                "Insta Crown: Downloader initialized."
            );

        }

    };


    /* -----------------------------------------------------
       24. GLOBAL DOWNLOADER FUNCTIONS
    ----------------------------------------------------- */

    window.InstaCrownDownloader = Downloader;

    window.startDownload = function (url) {

        return Downloader.processDownload(
            url || Downloader.getInputValue()
        );

    };

    window.cancelDownload = function () {

        Downloader.cancelRequest();

    };


    /* -----------------------------------------------------
       25. INITIALIZE WHEN DOCUMENT IS READY
    ----------------------------------------------------- */

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            function () {

                Downloader.init();

            },
            { once: true }
        );

    } else {

        Downloader.init();

    }


})();


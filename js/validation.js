
/* =========================================================
   INSTA CROWN 👑
   FILE: js/validation.js
   PURPOSE: Instagram URL Validation & Input Checking
   ========================================================= */

(function () {
    "use strict";


    /* -----------------------------------------------------
       1. VALIDATION CONFIGURATION
    ----------------------------------------------------- */

    const ValidationConfig = {

        inputSelector: "#instagramUrl",

        supportedHosts: [
            "instagram.com",
            "www.instagram.com",
            "m.instagram.com",
            "instagr.am",
            "www.instagr.am"
        ],

        supportedTypes: [
            "reel",
            "reels",
            "p",
            "tv",
            "stories"
        ],

        maximumLength: 2048,

        minimumLength: 10

    };


    /* -----------------------------------------------------
       2. VALIDATION MANAGER
    ----------------------------------------------------- */

    const ValidationManager = {


        /* -------------------------------------------------
           3. CLEAN INPUT
        ------------------------------------------------- */

        cleanInput: function (value) {

            if (typeof value !== "string") {
                return "";
            }

            return value
                .trim()
                .replace(/[\u200B-\u200D\uFEFF]/g, "");

        },


        /* -------------------------------------------------
           4. CHECK EMPTY INPUT
        ------------------------------------------------- */

        isEmpty: function (value) {

            return this.cleanInput(value).length === 0;

        },


        /* -------------------------------------------------
           5. CHECK INPUT LENGTH
        ------------------------------------------------- */

        checkLength: function (value) {

            const text = this.cleanInput(value);

            if (text.length < ValidationConfig.minimumLength) {

                return {
                    valid: false,
                    message: "Please enter a valid Instagram link."
                };

            }

            if (text.length > ValidationConfig.maximumLength) {

                return {
                    valid: false,
                    message: "The entered link is too long."
                };

            }

            return {
                valid: true,
                message: ""
            };

        },


        /* -------------------------------------------------
           6. CHECK URL FORMAT
        ------------------------------------------------- */

        parseURL: function (value) {

            const text = this.cleanInput(value);

            if (!text) {
                return null;
            }

            let normalized = text;

            // Allow links entered without https://
            if (!/^https?:\/\//i.test(normalized)) {

                normalized = "https://" + normalized;

            }

            try {

                const url = new URL(normalized);

                return url;

            } catch (error) {

                return null;

            }

        },


        /* -------------------------------------------------
           7. CHECK INSTAGRAM DOMAIN
        ------------------------------------------------- */

        isInstagramDomain: function (url) {

            if (!(url instanceof URL)) {
                return false;
            }

            const hostname = url.hostname
                .toLowerCase()
                .replace(/\.$/, "");

            return ValidationConfig.supportedHosts.includes(
                hostname
            );

        },


        /* -------------------------------------------------
           8. CHECK UNSAFE URL FORMAT
        ------------------------------------------------- */

        hasUnsafeFormat: function (url) {

            if (!(url instanceof URL)) {
                return true;
            }

            if (
                url.protocol !== "https:" &&
                url.protocol !== "http:"
            ) {
                return true;
            }

            if (url.username || url.password) {
                return true;
            }

            return false;

        },


        /* -------------------------------------------------
           9. DETECT INSTAGRAM CONTENT TYPE
        ------------------------------------------------- */

        detectContentType: function (url) {

            if (!(url instanceof URL)) {
                return null;
            }

            const parts = url.pathname
                .split("/")
                .filter(Boolean);

            if (!parts.length) {
                return null;
            }

            const firstPart = parts[0].toLowerCase();

            if (
                !ValidationConfig.supportedTypes.includes(firstPart)
            ) {
                return null;
            }

            if (firstPart === "reels") {
                return "reel";
            }

            return firstPart;

        },


        /* -------------------------------------------------
           10. CHECK CONTENT IDENTIFIER
        ------------------------------------------------- */

        hasContentIdentifier: function (url) {

            if (!(url instanceof URL)) {
                return false;
            }

            const parts = url.pathname
                .split("/")
                .filter(Boolean);

            if (!parts.length) {
                return false;
            }

            const type = parts[0].toLowerCase();

            // Stories commonly use /stories/username/id
            if (type === "stories") {

                return (
                    parts.length >= 3 &&
                    /^\d+$/.test(parts[2])
                );

            }

            // Reels, posts and IGTV need a shortcode.
            return (
                parts.length >= 2 &&
                /^[a-zA-Z0-9_-]+$/.test(parts[1])
            );

        },


        /* -------------------------------------------------
           11. VALIDATE INSTAGRAM URL
        ------------------------------------------------- */

        validateInstagramURL: function (value) {

            const text = this.cleanInput(value);

            if (!text) {

                return {
                    valid: false,
                    type: null,
                    url: null,
                    message: "Please paste an Instagram link."
                };

            }

            const lengthResult = this.checkLength(text);

            if (!lengthResult.valid) {

                return {
                    valid: false,
                    type: null,
                    url: null,
                    message: lengthResult.message
                };

            }

            const url = this.parseURL(text);

            if (!url) {

                return {
                    valid: false,
                    type: null,
                    url: null,
                    message: "This link format is not valid."
                };

            }

            if (this.hasUnsafeFormat(url)) {

                return {
                    valid: false,
                    type: null,
                    url: null,
                    message: "This link format is not supported."
                };

            }

            if (!this.isInstagramDomain(url)) {

                return {
                    valid: false,
                    type: null,
                    url: null,
                    message: "Please enter an Instagram link only."
                };

            }

            const contentType = this.detectContentType(url);

            if (!contentType) {

                return {
                    valid: false,
                    type: null,
                    url: null,
                    message: "Please enter a supported Instagram post, reel or story link."
                };

            }

            if (!this.hasContentIdentifier(url)) {

                return {
                    valid: false,
                    type: contentType,
                    url: null,
                    message: "The Instagram content link appears incomplete."
                };

            }

            // Remove tracking parameters and fragments.
            const cleanURL = new URL(url.href);

            cleanURL.search = "";

            cleanURL.hash = "";

            cleanURL.pathname =
                cleanURL.pathname.replace(/\/+$/, "") + "/";

            return {

                valid: true,

                type: contentType,

                url: cleanURL.href,

                message: "Instagram link looks valid!"

            };

        },


        /* -------------------------------------------------
           12. VALIDATE PROFILE URL
        ------------------------------------------------- */

        validateProfileURL: function (value) {

            const text = this.cleanInput(value);

            const url = this.parseURL(text);

            if (!url) {

                return {
                    valid: false,
                    message: "Please enter a valid profile link."
                };

            }

            if (
                this.hasUnsafeFormat(url) ||
                !this.isInstagramDomain(url)
            ) {

                return {
                    valid: false,
                    message: "Please enter an Instagram profile link."
                };

            }

            const parts = url.pathname
                .split("/")
                .filter(Boolean);

            if (
                parts.length !== 1 ||
                ValidationConfig.supportedTypes.includes(
                    parts[0].toLowerCase()
                )
            ) {

                return {
                    valid: false,
                    message: "This does not look like a profile link."
                };

            }

            return {

                valid: true,

                username: parts[0],

                url: "https://www.instagram.com/" +
                    encodeURIComponent(parts[0]) + "/",

                message: "Profile link looks valid!"

            };

        },


        /* -------------------------------------------------
           13. SHOW INPUT ERROR
        ------------------------------------------------- */

        showError: function (input, message) {

            if (!input) {
                return;
            }

            input.classList.add("input-error");

            input.setAttribute(
                "aria-invalid",
                "true"
            );

            let errorElement = input.parentElement.querySelector(
                ".input-error-message"
            );

            if (!errorElement) {

                errorElement = document.createElement("p");

                errorElement.className =
                    "input-error-message";

                errorElement.setAttribute(
                    "role",
                    "alert"
                );

                input.insertAdjacentElement(
                    "afterend",
                    errorElement
                );

            }

            errorElement.textContent = message;

        },


        /* -------------------------------------------------
           14. CLEAR INPUT ERROR
        ------------------------------------------------- */

        clearError: function (input) {

            if (!input) {
                return;
            }

            input.classList.remove("input-error");

            input.removeAttribute("aria-invalid");

            const errorElement =
                input.parentElement.querySelector(
                    ".input-error-message"
                );

            if (errorElement) {
                errorElement.remove();
            }

        },


        /* -------------------------------------------------
           15. VALIDATE INPUT ELEMENT
        ------------------------------------------------- */

        validateInput: function (input) {

            if (!input) {

                return {
                    valid: false,
                    message: "Input field not found."
                };

            }

            const result = this.validateInstagramURL(
                input.value
            );

            if (!result.valid) {

                this.showError(
                    input,
                    result.message
                );

                return result;

            }

            this.clearError(input);

            return result;

        },


        /* -------------------------------------------------
           16. LIVE INPUT VALIDATION
        ------------------------------------------------- */

        initLiveValidation: function () {

            const input = document.querySelector(
                ValidationConfig.inputSelector
            );

            if (!input) {
                return;
            }

            if (
                input.dataset.validationInitialized === "true"
            ) {
                return;
            }

            input.dataset.validationInitialized = "true";

            input.addEventListener("input", () => {

                this.clearError(input);

            });

            input.addEventListener("blur", () => {

                if (input.value.trim()) {

                    this.validateInput(input);

                }

            });

        },


        /* -------------------------------------------------
           17. INITIALIZE FORM VALIDATION
        ------------------------------------------------- */

        init: function () {

            this.initLiveValidation();

            console.log(
                "Insta Crown: Validation Manager initialized."
            );

        },


        /* -------------------------------------------------
           18. GET VALIDATED URL
        ------------------------------------------------- */

        getValidatedURL: function (selector) {

            const input = document.querySelector(
                selector || ValidationConfig.inputSelector
            );

            if (!input) {
                return null;
            }

            const result = this.validateInput(input);

            return result.valid ? result : null;

        }

    };


    /* -----------------------------------------------------
       19. GLOBAL VALIDATION FUNCTIONS
    ----------------------------------------------------- */

    window.ValidationManager = ValidationManager;

    window.validateInstagramURL = function (value) {

        return ValidationManager.validateInstagramURL(value);

    };

    window.validateProfileURL = function (value) {

        return ValidationManager.validateProfileURL(value);

    };

    window.isValidInstagramURL = function (value) {

        return ValidationManager.validateInstagramURL(value).valid;

    };


    /* -----------------------------------------------------
       20. INITIALIZE WHEN DOCUMENT IS READY
    ----------------------------------------------------- */

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            function () {

                ValidationManager.init();

            },
            { once: true }
        );

    } else {

        ValidationManager.init();

    }


})();


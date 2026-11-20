
/* =========================================================
   INSTA CROWN 👑
   FILE: js/clipboard.js
   PURPOSE: Clipboard, Copy, Paste & Text Utilities
   ========================================================= */

(function () {
    "use strict";


    /* -----------------------------------------------------
       1. CLIPBOARD CONFIGURATION
    ----------------------------------------------------- */

    const ClipboardConfig = {

        selectors: {
            copy: "[data-copy]",
            paste: "[data-paste]",
            pasteTarget: "[data-paste-target]"
        },

        successMessage: "Copied successfully! 👑",

        pasteMessage: "Link pasted successfully!",

        errorMessage: "Clipboard access unavailable.",

        fallbackMessage: "Please copy the text manually."

    };


    /* -----------------------------------------------------
       2. CLIPBOARD MANAGER
    ----------------------------------------------------- */

    const ClipboardManager = {


        /* -------------------------------------------------
           3. CHECK CLIPBOARD SUPPORT
        ------------------------------------------------- */

        isSupported: function () {

            return !!(
                navigator.clipboard &&
                navigator.clipboard.writeText
            );

        },


        /* -------------------------------------------------
           4. COPY TEXT USING FALLBACK
        ------------------------------------------------- */

        fallbackCopy: function (text) {

            const textarea = document.createElement("textarea");

            textarea.value = text;

            textarea.setAttribute("readonly", "");

            textarea.style.position = "fixed";

            textarea.style.left = "-9999px";

            textarea.style.top = "0";

            textarea.style.opacity = "0";

            document.body.appendChild(textarea);

            textarea.select();

            textarea.setSelectionRange(
                0,
                textarea.value.length
            );

            let successful = false;

            try {

                successful = document.execCommand("copy");

            } catch (error) {

                console.error(
                    "Insta Crown: Fallback copy failed.",
                    error
                );

            }

            textarea.remove();

            return successful;

        },


        /* -------------------------------------------------
           5. COPY TEXT
        ------------------------------------------------- */

        copy: async function (text, options = {}) {

            if (
                text === undefined ||
                text === null ||
                String(text).length === 0
            ) {

                this.showMessage(
                    "Nothing to copy!",
                    "warning"
                );

                return false;

            }

            const value = String(text);

            try {

                if (this.isSupported()) {

                    await navigator.clipboard.writeText(value);

                    this.showMessage(
                        options.message ||
                        ClipboardConfig.successMessage,
                        "success"
                    );

                    return true;

                }

                const copied = this.fallbackCopy(value);

                if (copied) {

                    this.showMessage(
                        options.message ||
                        ClipboardConfig.successMessage,
                        "success"
                    );

                    return true;

                }

                this.showMessage(
                    ClipboardConfig.fallbackMessage,
                    "error"
                );

                return false;

            } catch (error) {

                const copied = this.fallbackCopy(value);

                if (copied) {

                    this.showMessage(
                        options.message ||
                        ClipboardConfig.successMessage,
                        "success"
                    );

                    return true;

                }

                console.error(
                    "Insta Crown: Copy operation failed.",
                    error
                );

                this.showMessage(
                    ClipboardConfig.errorMessage,
                    "error"
                );

                return false;

            }

        },


        /* -------------------------------------------------
           6. READ CLIPBOARD
        ------------------------------------------------- */

        read: async function () {

            if (
                !navigator.clipboard ||
                !navigator.clipboard.readText
            ) {

                this.showMessage(
                    "Please paste manually.",
                    "warning"
                );

                return null;

            }

            try {

                const text = await navigator.clipboard.readText();

                return text;

            } catch (error) {

                console.warn(
                    "Insta Crown: Clipboard read permission denied.",
                    error
                );

                this.showMessage(
                    "Please allow clipboard permission.",
                    "warning"
                );

                return null;

            }

        },


        /* -------------------------------------------------
           7. PASTE INTO INPUT
        ------------------------------------------------- */

        pasteInto: async function (target) {

            let input = target;

            if (typeof target === "string") {

                input = document.querySelector(target);

            }

            if (!input) {

                this.showMessage(
                    "Input field not found!",
                    "error"
                );

                return false;

            }

            const text = await this.read();

            if (text === null || text === undefined) {
                return false;
            }

            if (!text.trim()) {

                this.showMessage(
                    "Clipboard is empty!",
                    "warning"
                );

                return false;

            }

            input.value = text.trim();

            input.dispatchEvent(
                new Event("input", {
                    bubbles: true
                })
            );

            input.dispatchEvent(
                new Event("change", {
                    bubbles: true
                })
            );

            input.focus();

            this.showMessage(
                ClipboardConfig.pasteMessage,
                "success"
            );

            return true;

        },


        /* -------------------------------------------------
           8. GET COPY TEXT FROM ELEMENT
        ------------------------------------------------- */

        getElementText: function (element) {

            if (!element) {
                return "";
            }

            if (element.dataset.copy) {

                return element.dataset.copy;

            }

            return element.textContent.trim();

        },


        /* -------------------------------------------------
           9. COPY ELEMENT CONTENT
        ------------------------------------------------- */

        copyElement: async function (element) {

            const text = this.getElementText(element);

            return this.copy(text);

        },


        /* -------------------------------------------------
           10. COPY INPUT VALUE
        ------------------------------------------------- */

        copyInput: async function (selector) {

            const input = document.querySelector(selector);

            if (!input) {
                return false;
            }

            return this.copy(input.value);

        },


        /* -------------------------------------------------
           11. SHOW USER MESSAGE
        ------------------------------------------------- */

        showMessage: function (message, type = "success") {

            if (window.Toast && typeof window.Toast.show === "function") {

                window.Toast.show(message, type);

                return;

            }

            if (typeof window.showToast === "function") {

                window.showToast(message, type);

                return;

            }

            console.log(
                "[Insta Crown]",
                message
            );

        },


        /* -------------------------------------------------
           12. INITIALIZE COPY BUTTONS
        ------------------------------------------------- */

        initCopyButtons: function () {

            const buttons = document.querySelectorAll(
                ClipboardConfig.selectors.copy
            );

            buttons.forEach((button) => {

                if (
                    button.dataset.clipboardInitialized === "true"
                ) {
                    return;
                }

                button.dataset.clipboardInitialized = "true";

                button.addEventListener("click", async () => {

                    const text = this.getElementText(button);

                    await this.copy(text);

                });

            });

        },


        /* -------------------------------------------------
           13. INITIALIZE PASTE BUTTONS
        ------------------------------------------------- */

        initPasteButtons: function () {

            const buttons = document.querySelectorAll(
                ClipboardConfig.selectors.paste
            );

            buttons.forEach((button) => {

                if (
                    button.dataset.clipboardInitialized === "true"
                ) {
                    return;
                }

                button.dataset.clipboardInitialized = "true";

                button.addEventListener("click", async () => {

                    const targetSelector =
                        button.dataset.pasteTarget ||
                        "#instagramUrl";

                    await this.pasteInto(targetSelector);

                });

            });

        },


        /* -------------------------------------------------
           14. SELECT INPUT TEXT
        ------------------------------------------------- */

        selectText: function (selector) {

            const element = document.querySelector(selector);

            if (!element) {
                return false;
            }

            element.focus();

            if (typeof element.select === "function") {

                element.select();

                return true;

            }

            return false;

        },


        /* -------------------------------------------------
           15. CLEAR INPUT
        ------------------------------------------------- */

        clearInput: function (selector) {

            const input = document.querySelector(selector);

            if (!input) {
                return false;
            }

            input.value = "";

            input.dispatchEvent(
                new Event("input", {
                    bubbles: true
                })
            );

            input.focus();

            return true;

        },


        /* -------------------------------------------------
           16. INITIALIZE CLIPBOARD SYSTEM
        ------------------------------------------------- */

        init: function () {

            this.initCopyButtons();

            this.initPasteButtons();

            console.log(
                "Insta Crown: Clipboard Manager initialized."
            );

        },


        /* -------------------------------------------------
           17. REFRESH DYNAMIC BUTTONS
        ------------------------------------------------- */

        refresh: function () {

            this.initCopyButtons();

            this.initPasteButtons();

        }

    };


    /* -----------------------------------------------------
       18. GLOBAL CLIPBOARD FUNCTIONS
    ----------------------------------------------------- */

    window.ClipboardManager = ClipboardManager;

    window.copyText = function (text) {

        return ClipboardManager.copy(text);

    };

    window.pasteText = function (selector) {

        return ClipboardManager.pasteInto(selector);

    };

    window.copyInputValue = function (selector) {

        return ClipboardManager.copyInput(selector);

    };


    /* -----------------------------------------------------
       19. INITIALIZE WHEN DOCUMENT IS READY
    ----------------------------------------------------- */

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            function () {

                ClipboardManager.init();

            },
            { once: true }
        );

    } else {

        ClipboardManager.init();

    }


})();


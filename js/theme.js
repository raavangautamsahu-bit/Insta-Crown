
/* =========================================================
   INSTA CROWN 👑
   FILE: js/theme.js
   PURPOSE: Light Mode, Dark Mode & Theme Preferences
   ========================================================= */

(function () {
    "use strict";

    /* -----------------------------------------------------
       1. THEME CONFIGURATION
    ----------------------------------------------------- */

    const THEME_CONFIG = {
        storageKey: "instaCrownTheme",

        defaultTheme: "light",

        themes: {
            light: "light",
            dark: "dark"
        },

        bodyClass: "dark-mode",

        selectors: [
            "#themeToggle",
            "#themeToggleButton",
            "[data-theme-toggle]",
            ".theme-toggle",
            ".theme-toggle-button"
        ]
    };


    /* -----------------------------------------------------
       2. THEME MANAGER
    ----------------------------------------------------- */

    const ThemeManager = {

        currentTheme: THEME_CONFIG.defaultTheme,

        initialized: false,

        systemPreference: null,


        /* -------------------------------------------------
           3. GET THEME BUTTONS
        ------------------------------------------------- */

        getThemeButtons: function () {

            const selector = THEME_CONFIG.selectors.join(",");

            return Array.from(
                document.querySelectorAll(selector)
            );

        },


        /* -------------------------------------------------
           4. CHECK VALID THEME
        ------------------------------------------------- */

        isValidTheme: function (theme) {

            return (
                theme === THEME_CONFIG.themes.light ||
                theme === THEME_CONFIG.themes.dark
            );

        },


        /* -------------------------------------------------
           5. GET SAVED THEME
        ------------------------------------------------- */

        getSavedTheme: function () {

            try {

                const savedTheme = localStorage.getItem(
                    THEME_CONFIG.storageKey
                );

                if (this.isValidTheme(savedTheme)) {
                    return savedTheme;
                }

            } catch (error) {

                console.warn(
                    "Insta Crown: Theme storage unavailable.",
                    error
                );

            }

            return null;

        },


        /* -------------------------------------------------
           6. SAVE THEME
        ------------------------------------------------- */

        saveTheme: function (theme) {

            if (!this.isValidTheme(theme)) {
                return false;
            }

            try {

                localStorage.setItem(
                    THEME_CONFIG.storageKey,
                    theme
                );

                return true;

            } catch (error) {

                console.warn(
                    "Insta Crown: Unable to save theme.",
                    error
                );

                return false;

            }

        },


        /* -------------------------------------------------
           7. GET SYSTEM THEME
        ------------------------------------------------- */

        getSystemTheme: function () {

            if (
                window.matchMedia &&
                window.matchMedia(
                    "(prefers-color-scheme: dark)"
                ).matches
            ) {

                return THEME_CONFIG.themes.dark;

            }

            return THEME_CONFIG.themes.light;

        },


        /* -------------------------------------------------
           8. DETECT INITIAL THEME
        ------------------------------------------------- */

        detectTheme: function () {

            const savedTheme = this.getSavedTheme();

            if (savedTheme) {
                return savedTheme;
            }

            return this.getSystemTheme();

        },


        /* -------------------------------------------------
           9. APPLY THEME
        ------------------------------------------------- */

        applyTheme: function (theme, options = {}) {

            if (!this.isValidTheme(theme)) {

                console.warn(
                    "Insta Crown: Invalid theme selected."
                );

                return false;

            }

            const body = document.body;

            if (!body) {
                return false;
            }

            const isDark = (
                theme === THEME_CONFIG.themes.dark
            );

            this.currentTheme = theme;

            body.classList.toggle(
                THEME_CONFIG.bodyClass,
                isDark
            );

            body.setAttribute(
                "data-theme",
                theme
            );

            document.documentElement.setAttribute(
                "data-theme",
                theme
            );

            document.documentElement.style.colorScheme = theme;

            this.updateThemeButtons();

            if (options.save !== false) {
                this.saveTheme(theme);
            }

            if (options.dispatchEvent !== false) {

                window.dispatchEvent(
                    new CustomEvent("instaCrownThemeChanged", {
                        detail: {
                            theme: theme,
                            isDark: isDark
                        }
                    })
                );

            }

            return true;

        },


        /* -------------------------------------------------
           10. UPDATE THEME BUTTONS
        ------------------------------------------------- */

        updateThemeButtons: function () {

            const buttons = this.getThemeButtons();

            const isDark = (
                this.currentTheme === THEME_CONFIG.themes.dark
            );

            buttons.forEach((button) => {

                button.setAttribute(
                    "aria-label",
                    isDark
                        ? "Switch to light mode"
                        : "Switch to dark mode"
                );

                button.setAttribute(
                    "aria-pressed",
                    String(isDark)
                );

                button.setAttribute(
                    "title",
                    isDark
                        ? "Switch to Light Mode"
                        : "Switch to Dark Mode"
                );

                button.setAttribute(
                    "data-current-theme",
                    this.currentTheme
                );

                const icon = button.querySelector(
                    "[data-theme-icon]"
                );

                if (icon) {

                    icon.textContent = isDark
                        ? "☀️"
                        : "🌙";

                }

                const label = button.querySelector(
                    "[data-theme-label]"
                );

                if (label) {

                    label.textContent = isDark
                        ? "Light Mode"
                        : "Dark Mode";

                }

            });

        },


        /* -------------------------------------------------
           11. TOGGLE THEME
        ------------------------------------------------- */

        toggleTheme: function () {

            const nextTheme = (
                this.currentTheme === THEME_CONFIG.themes.dark
                    ? THEME_CONFIG.themes.light
                    : THEME_CONFIG.themes.dark
            );

            this.applyTheme(nextTheme);

            return nextTheme;

        },


        /* -------------------------------------------------
           12. SET LIGHT MODE
        ------------------------------------------------- */

        setLightMode: function () {

            return this.applyTheme(
                THEME_CONFIG.themes.light
            );

        },


        /* -------------------------------------------------
           13. SET DARK MODE
        ------------------------------------------------- */

        setDarkMode: function () {

            return this.applyTheme(
                THEME_CONFIG.themes.dark
            );

        },


        /* -------------------------------------------------
           14. THEME BUTTON EVENTS
        ------------------------------------------------- */

        bindThemeButtons: function () {

            const buttons = this.getThemeButtons();

            buttons.forEach((button) => {

                if (
                    button.dataset.themeListenerAttached === "true"
                ) {
                    return;
                }

                button.dataset.themeListenerAttached = "true";

                button.addEventListener("click", (event) => {

                    event.preventDefault();

                    this.toggleTheme();

                });

            });

        },


        /* -------------------------------------------------
           15. SYSTEM THEME CHANGE
        ------------------------------------------------- */

        watchSystemTheme: function () {

            if (!window.matchMedia) {
                return;
            }

            this.systemPreference = window.matchMedia(
                "(prefers-color-scheme: dark)"
            );

            this.systemPreference.addEventListener(
                "change",
                (event) => {

                    const savedTheme = this.getSavedTheme();

                    // Manual selection always takes priority.
                    if (savedTheme) {
                        return;
                    }

                    const newTheme = event.matches
                        ? THEME_CONFIG.themes.dark
                        : THEME_CONFIG.themes.light;

                    this.applyTheme(newTheme, {
                        save: false
                    });

                }
            );

        },


        /* -------------------------------------------------
           16. SYNC THEME BETWEEN TABS
        ------------------------------------------------- */

        watchStorageChanges: function () {

            window.addEventListener("storage", (event) => {

                if (
                    event.key !== THEME_CONFIG.storageKey
                ) {
                    return;
                }

                if (!this.isValidTheme(event.newValue)) {
                    return;
                }

                this.applyTheme(event.newValue, {
                    save: false
                });

            });

        },


        /* -------------------------------------------------
           17. INITIALIZE THEME
        ------------------------------------------------- */

        init: function () {

            if (this.initialized) {
                return;
            }

            const initialTheme = this.detectTheme();

            this.applyTheme(initialTheme, {
                save: false,
                dispatchEvent: false
            });

            this.bindThemeButtons();

            this.watchSystemTheme();

            this.watchStorageChanges();

            this.initialized = true;

            console.log(
                "Insta Crown: Theme Manager initialized.",
                this.currentTheme
            );

        },


        /* -------------------------------------------------
           18. REFRESH THEME BUTTONS
        ------------------------------------------------- */

        refresh: function () {

            this.bindThemeButtons();

            this.updateThemeButtons();

        },


        /* -------------------------------------------------
           19. GET CURRENT THEME
        ------------------------------------------------- */

        getCurrentTheme: function () {

            return this.currentTheme;

        },


        /* -------------------------------------------------
           20. CHECK DARK MODE
        ------------------------------------------------- */

        isDarkMode: function () {

            return (
                this.currentTheme === THEME_CONFIG.themes.dark
            );

        }

    };


    /* -----------------------------------------------------
       21. GLOBAL THEME FUNCTIONS
    ----------------------------------------------------- */

    window.ThemeManager = ThemeManager;

    window.toggleTheme = function () {

        return ThemeManager.toggleTheme();

    };

    window.setTheme = function (theme) {

        return ThemeManager.applyTheme(theme);

    };

    window.setLightMode = function () {

        return ThemeManager.setLightMode();

    };

    window.setDarkMode = function () {

        return ThemeManager.setDarkMode();

    };


    /* -----------------------------------------------------
       22. INITIALIZE WHEN DOCUMENT IS READY
    ----------------------------------------------------- */

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            function () {
                ThemeManager.init();
            },
            { once: true }
        );

    } else {

        ThemeManager.init();

    }


})();



/* ============================================================
   INSTA CROWN 👑
   FILE: js/pages/profile.js

   Instagram Profile Picture Page Controller

   FEATURES:
   1. Instagram Profile URL Validation
   2. Username Extraction
   3. Paste and Clear URL
   4. Profile Picture Preview
   5. Download API Integration
   6. Loading and Error Management
   7. Recent Search History
   8. Copy Profile URL
   9. Open Instagram Profile
  10. Responsive UI Support

   NOTE:
   Actual profile picture retrieval requires an authorized
   backend/API. This page does not bypass private-account
   restrictions or Instagram access controls.
============================================================ */

(function () {
    "use strict";


    /* --------------------------------------------------------
       1. PROFILE CONFIGURATION
    -------------------------------------------------------- */

    const ProfileConfig = {

        selectors: {
            form: "#profileDownloaderForm",
            input: "#profileInstagramUrl",
            button: "#profileDownloadButton",
            paste: "[data-profile-paste]",
            clear: "[data-profile-clear]",
            result: "#profileDownloadResult",
            loading: "#profileDownloadLoading",
            error: "#profileDownloadError",
            preview: "#profilePicturePreview",
            history: "#profileRecentHistory"
        },

        storageKey: "instaCrownProfileHistory",

        maxHistory: 15,

        allowedHosts: [
            "instagram.com",
            "www.instagram.com",
            "m.instagram.com"
        ],

        usernamePattern: /^[a-zA-Z0-9._]{1,30}$/
    };


    /* --------------------------------------------------------
       2. PROFILE PAGE MANAGER
    -------------------------------------------------------- */

    class ProfilePageManager {

        constructor() {

            this.form = document.querySelector(
                ProfileConfig.selectors.form
            );

            this.input = document.querySelector(
                ProfileConfig.selectors.input
            );

            this.button = document.querySelector(
                ProfileConfig.selectors.button
            );

            this.pasteButton = document.querySelector(
                ProfileConfig.selectors.paste
            );

            this.clearButton = document.querySelector(
                ProfileConfig.selectors.clear
            );

            this.resultBox = document.querySelector(
                ProfileConfig.selectors.result
            );

            this.loadingBox = document.querySelector(
                ProfileConfig.selectors.loading
            );

            this.errorBox = document.querySelector(
                ProfileConfig.selectors.error
            );

            this.previewBox = document.querySelector(
                ProfileConfig.selectors.preview
            );

            this.historyBox = document.querySelector(
                ProfileConfig.selectors.history
            );

            this.isLoading = false;

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
                "Insta Crown Profile Page Initialized 👑"
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
                    this.handleSubmit();
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

                    this.validateLive();
                }
            );


            if (this.historyBox) {

                this.historyBox.addEventListener(
                    "click",
                    (event) => {

                        const target = event.target.closest(
                            "[data-profile-action]"
                        );

                        if (!target) return;

                        const action =
                            target.dataset.profileAction;

                        const url = target.dataset.url;

                        this.handleHistoryAction(action, url);
                    }
                );
            }


            if (this.previewBox) {

                this.previewBox.addEventListener(
                    "error",
                    () => {

                        this.previewBox.classList.add(
                            "preview-error"
                        );
                    },

                    true
                );
            }
        }


        /* ----------------------------------------------------
           5. EXTRACT INSTAGRAM USERNAME
        ---------------------------------------------------- */

        extractUsername(value) {

            if (!value || typeof value !== "string") {
                return null;
            }


            let parsedURL;

            try {

                parsedURL = new URL(value.trim());

            } catch (error) {

                return null;
            }


            if (
                !["http:", "https:"].includes(
                    parsedURL.protocol
                )
            ) {
                return null;
            }


            const hostname =
                parsedURL.hostname.toLowerCase();


            if (
                !ProfileConfig.allowedHosts.includes(hostname)
            ) {
                return null;
            }


            const parts = parsedURL.pathname
                .split("/")
                .filter(Boolean);


            if (parts.length !== 1) {
                return null;
            }


            const username = parts[0];


            const reservedPaths = [
                "accounts",
                "about",
                "api",
                "developer",
                "direct",
                "explore",
                "legal",
                "p",
                "privacy",
                "reel",
                "reels",
                "stories",
                "terms",
                "tv"
            ];


            if (
                reservedPaths.includes(
                    username.toLowerCase()
                )
            ) {
                return null;
            }


            if (
                !ProfileConfig.usernamePattern.test(username)
            ) {
                return null;
            }


            return username;
        }


        /* ----------------------------------------------------
           6. PROFILE URL VALIDATION
        ---------------------------------------------------- */

        validateURL(value) {

            if (!value) {

                return {
                    valid: false,
                    message:
                        "Please Instagram profile URL enter karein."
                };
            }


            const username = this.extractUsername(value);


            if (!username) {

                return {
                    valid: false,
                    message:
                        "Valid Instagram profile URL enter karein."
                };
            }


            return {
                valid: true,
                username: username,
                url:
                    "https://www.instagram.com/" +
                    encodeURIComponent(username) +
                    "/"
            };
        }


        /* ----------------------------------------------------
           7. LIVE VALIDATION
        ---------------------------------------------------- */

        validateLive() {

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
           8. PASTE PROFILE URL
        ---------------------------------------------------- */

        async pasteURL() {

            try {

                let text = "";


                if (
                    window.ClipboardManager &&
                    typeof window.ClipboardManager.read === "function"
                ) {

                    text = await window.ClipboardManager.read();

                } else if (
                    navigator.clipboard &&
                    navigator.clipboard.readText
                ) {

                    text = await navigator.clipboard.readText();

                } else {

                    throw new Error(
                        "Clipboard access available nahi hai."
                    );
                }


                if (!text) {

                    throw new Error(
                        "Clipboard empty hai."
                    );
                }


                this.input.value = text.trim();

                this.validateLive();

                this.hideError();


                this.showToast(
                    "Profile URL pasted successfully!",
                    "success"
                );


            } catch (error) {

                this.showError(
                    error.message ||
                    "Profile URL paste nahi ho paya."
                );
            }
        }


        /* ----------------------------------------------------
           9. CLEAR INPUT
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
           10. MAIN SUBMIT HANDLER
        ---------------------------------------------------- */

        async handleSubmit() {

            if (this.isLoading) {
                return;
            }


            const value = this.input.value.trim();

            const validation = this.validateURL(value);


            if (!validation.valid) {

                this.showError(validation.message);

                this.input.focus();

                return;
            }


            this.hideError();

            this.hideResult();

            this.showLoading();

            this.setButtonLoading(true);


            this.isLoading = true;


            try {

                const response = await this.fetchProfilePicture(
                    validation.username
                );


                if (
                    !response ||
                    response.success !== true
                ) {

                    throw new Error(
                        response?.message ||
                        "Profile picture result nahi mila."
                    );
                }


                this.renderProfileResult(
                    response,
                    validation
                );


                this.addToHistory({
                    username: validation.username,
                    url: validation.url,
                    date: new Date().toISOString(),
                    status: "success"
                });


                this.showToast(
                    "Profile information received!",
                    "success"
                );


            } catch (error) {

                this.showError(
                    error.message ||
                    "Profile picture load nahi ho payi."
                );


                this.addToHistory({
                    username: validation.username,
                    url: validation.url,
                    date: new Date().toISOString(),
                    status: "failed"
                });

            } finally {

                this.hideLoading();

                this.setButtonLoading(false);

                this.isLoading = false;
            }
        }


        /* ----------------------------------------------------
           11. PROFILE PICTURE API REQUEST
        ---------------------------------------------------- */

        async fetchProfilePicture(username) {

            /*
              API INTEGRATION:

              Authorized backend/API yahan connect hoga.

              Frontend se directly Instagram private data
              access karne ki koshish nahi ki jayegi.

              Current shared downloader integration ko
              final integration stage par align karenge.
            */


            if (
                typeof window.getInstagramProfilePicture ===
                "function"
            ) {

                return await window.getInstagramProfilePicture(
                    username
                );
            }


            if (
                typeof window.InstaCrownProfileAPI === "object" &&
                typeof window.InstaCrownProfileAPI.fetch ===
                "function"
            ) {

                return await window.InstaCrownProfileAPI.fetch(
                    username
                );
            }


            throw new Error(
                "Profile Picture API abhi connect nahi hui hai. Backend setup ke baad ye feature work karega."
            );
        }


        /* ----------------------------------------------------
           12. RENDER PROFILE RESULT
        ---------------------------------------------------- */

        renderProfileResult(data, validation) {

            if (!this.resultBox) {
                return;
            }


            this.resultBox.innerHTML = "";


            const imageURL = this.safeImageURL(
                data.profilePictureUrl ||
                data.imageUrl ||
                data.downloadUrl
            );


            if (!imageURL) {

                throw new Error(
                    "Valid profile picture URL response mein nahi mila."
                );
            }


            const card = document.createElement("div");

            card.className = "profile-result-card";


            const heading = document.createElement("h3");

            heading.textContent = "Profile Picture";


            const username = document.createElement("p");

            username.className = "profile-result-username";

            username.textContent =
                "@" + validation.username;


            const image = document.createElement("img");

            image.className = "profile-result-image";

            image.alt =
                "Profile picture of " + validation.username;

            image.src = imageURL;


            image.loading = "lazy";

            image.referrerPolicy = "no-referrer";


            const actions = document.createElement("div");

            actions.className = "profile-result-actions";


            const openButton = document.createElement("a");

            openButton.href = imageURL;

            openButton.target = "_blank";

            openButton.rel = "noopener noreferrer";

            openButton.textContent = "Open Full Image";


            const downloadButton =
                document.createElement("a");

            downloadButton.href = imageURL;

            downloadButton.target = "_blank";

            downloadButton.rel = "noopener noreferrer";

            downloadButton.textContent = "Download Image";

            downloadButton.download =
                validation.username + "-profile.jpg";


            const profileButton =
                document.createElement("a");

            profileButton.href = validation.url;

            profileButton.target = "_blank";

            profileButton.rel = "noopener noreferrer";

            profileButton.textContent = "View Instagram Profile";


            actions.appendChild(openButton);

            actions.appendChild(downloadButton);

            actions.appendChild(profileButton);


            card.appendChild(heading);

            card.appendChild(username);

            card.appendChild(image);

            card.appendChild(actions);


            this.resultBox.appendChild(card);

            this.resultBox.hidden = false;


            if (this.previewBox) {

                this.previewBox.src = imageURL;

                this.previewBox.alt =
                    validation.username + " profile picture";

                this.previewBox.hidden = false;
            }
        }


        /* ----------------------------------------------------
           13. SAFE IMAGE URL
        ---------------------------------------------------- */

        safeImageURL(value) {

            if (!value || typeof value !== "string") {
                return null;
            }


            try {

                const parsed = new URL(value);


                if (
                    !["https:", "http:"].includes(
                        parsed.protocol
                    )
                ) {
                    return null;
                }


                return parsed.href;

            } catch (error) {

                return null;
            }
        }


        /* ----------------------------------------------------
           14. LOADING STATE
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

            if (!this.button) {
                return;
            }


            if (!this.button.dataset.originalText) {

                this.button.dataset.originalText =
                    this.button.textContent.trim();
            }


            this.button.disabled = loading;

            this.button.classList.toggle(
                "is-loading",
                loading
            );


            this.button.textContent = loading
                ? "Loading Profile..."
                : this.button.dataset.originalText;
        }


        /* ----------------------------------------------------
           15. ERROR MANAGEMENT
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
           16. HIDE RESULT
        ---------------------------------------------------- */

        hideResult() {

            if (this.resultBox) {

                this.resultBox.innerHTML = "";

                this.resultBox.hidden = true;
            }


            if (this.previewBox) {

                this.previewBox.removeAttribute("src");

                this.previewBox.hidden = true;
            }
        }


        /* ----------------------------------------------------
           17. LOAD HISTORY
        ---------------------------------------------------- */

        loadHistory() {

            try {

                const saved = localStorage.getItem(
                    ProfileConfig.storageKey
                );


                this.history = saved
                    ? JSON.parse(saved)
                    : [];


                if (!Array.isArray(this.history)) {

                    this.history = [];
                }

            } catch (error) {

                this.history = [];
            }
        }


        /* ----------------------------------------------------
           18. SAVE HISTORY
        ---------------------------------------------------- */

        saveHistory() {

            try {

                localStorage.setItem(
                    ProfileConfig.storageKey,
                    JSON.stringify(this.history)
                );

            } catch (error) {

                console.warn(
                    "Profile history save failed.",
                    error
                );
            }
        }


        /* ----------------------------------------------------
           19. ADD HISTORY
        ---------------------------------------------------- */

        addToHistory(item) {

            this.history = this.history.filter(
                (entry) =>
                    entry.username !== item.username
            );


            this.history.unshift(item);


            this.history = this.history.slice(
                0,
                ProfileConfig.maxHistory
            );


            this.saveHistory();

            this.renderHistory();
        }


        /* ----------------------------------------------------
           20. RENDER HISTORY
        ---------------------------------------------------- */

        renderHistory() {

            if (!this.historyBox) {
                return;
            }


            this.historyBox.innerHTML = "";


            if (this.history.length === 0) {

                const empty = document.createElement("p");

                empty.className = "profile-history-empty";

                empty.textContent =
                    "Abhi koi recent profile search nahi hai.";


                this.historyBox.appendChild(empty);

                return;
            }


            this.history.forEach((item) => {

                const card = document.createElement("div");

                card.className = "profile-history-item";


                const name = document.createElement("strong");

                name.textContent = "@" + item.username;


                const date = document.createElement("small");

                date.textContent = this.formatDate(item.date);


                const status = document.createElement("span");

                status.className =
                    "profile-history-status " + item.status;

                status.textContent =
                    item.status === "success"
                        ? "Completed"
                        : "Not completed";


                const actions = document.createElement("div");

                actions.className = "profile-history-actions";


                const useButton =
                    document.createElement("button");

                useButton.type = "button";

                useButton.textContent = "Use";

                useButton.dataset.profileAction = "use";

                useButton.dataset.url = item.url;


                const copyButton =
                    document.createElement("button");

                copyButton.type = "button";

                copyButton.textContent = "Copy";

                copyButton.dataset.profileAction = "copy";

                copyButton.dataset.url = item.url;


                actions.appendChild(useButton);

                actions.appendChild(copyButton);


                card.appendChild(name);

                card.appendChild(date);

                card.appendChild(status);

                card.appendChild(actions);


                this.historyBox.appendChild(card);
            });
        }


        /* ----------------------------------------------------
           21. HISTORY ACTIONS
        ---------------------------------------------------- */

        async handleHistoryAction(action, url) {

            if (!url) {
                return;
            }


            if (action === "use") {

                this.input.value = url;

                this.validateLive();

                this.hideError();

                this.hideResult();

                this.input.focus();

                return;
            }


            if (action === "copy") {

                try {

                    if (
                        window.ClipboardManager &&
                        typeof window.ClipboardManager.copy ===
                        "function"
                    ) {

                        await window.ClipboardManager.copy(url);

                    } else {

                        await navigator.clipboard.writeText(url);
                    }


                    this.showToast(
                        "Profile URL copied!",
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
           22. FORMAT DATE
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
           23. TOAST NOTIFICATION
        ---------------------------------------------------- */

        showToast(message, type = "info") {

            if (
                window.Toast &&
                typeof window.Toast.show === "function"
            ) {

                window.Toast.show(message, type);

            } else {

                console.log(
                    "[Insta Crown]",
                    type,
                    message
                );
            }
        }


        /* ----------------------------------------------------
           24. CLEAR SEARCH HISTORY
        ---------------------------------------------------- */

        clearHistory() {

            this.history = [];

            this.saveHistory();

            this.renderHistory();

            this.showToast(
                "Profile history cleared.",
                "success"
            );
        }


        /* ----------------------------------------------------
           25. OPEN INSTAGRAM PROFILE
        ---------------------------------------------------- */

        openProfile(username) {

            if (
                !username ||
                !ProfileConfig.usernamePattern.test(username)
            ) {
                return;
            }


            const url =
                "https://www.instagram.com/" +
                encodeURIComponent(username) +
                "/";


            window.open(
                url,
                "_blank",
                "noopener,noreferrer"
            );
        }


        /* ----------------------------------------------------
           26. DESTROY MANAGER
        ---------------------------------------------------- */

        destroy() {

            this.hideLoading();

            this.isLoading = false;

            console.log(
                "Profile Page Manager Destroyed."
            );
        }
    }


    /* --------------------------------------------------------
       27. INITIALIZE PROFILE PAGE
    -------------------------------------------------------- */

    function initializeProfilePage() {

        if (
            !document.querySelector(
                ProfileConfig.selectors.form
            )
        ) {
            return;
        }


        if (window.ProfilePageManager) {
            return;
        }


        const manager = new ProfilePageManager();


        window.ProfilePageManager = manager;

        window.InstaCrownProfile = manager;


        console.log(
            "Insta Crown Profile System Ready 👑"
        );
    }


    /* --------------------------------------------------------
       28. DOCUMENT READY
    -------------------------------------------------------- */

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            initializeProfilePage,
            { once: true }
        );

    } else {

        initializeProfilePage();
    }


})();


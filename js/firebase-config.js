
/* =========================================================
   INSTA CROWN 👑
   FILE: js/firebase-config.js
   PURPOSE: Firebase Initialization & Configuration
   ========================================================= */

(function () {
    "use strict";


    /* -----------------------------------------------------
       1. FIREBASE CONFIGURATION
    ----------------------------------------------------- */

    const FirebaseConfig = {

        apiKey: "YOUR_FIREBASE_API_KEY",

        authDomain: "YOUR_PROJECT_ID.firebaseapp.com",

        projectId: "YOUR_PROJECT_ID",

        storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",

        messagingSenderId: "YOUR_MESSAGING_SENDER_ID",

        appId: "YOUR_FIREBASE_APP_ID",

        measurementId: "YOUR_MEASUREMENT_ID"

    };


    /* -----------------------------------------------------
       2. FIREBASE SETTINGS
    ----------------------------------------------------- */

    const FirebaseSettings = {

        enabled: true,

        useAuthentication: true,

        useFirestore: true,

        useAnalytics: false,

        debugMode: false,

        appName: "Insta Crown"

    };


    /* -----------------------------------------------------
       3. FIREBASE MANAGER
    ----------------------------------------------------- */

    const FirebaseManager = {

        app: null,

        auth: null,

        db: null,

        analytics: null,

        initialized: false,

        loading: false,

        error: null,


        /* -------------------------------------------------
           4. CHECK FIREBASE CONFIGURATION
        ------------------------------------------------- */

        isConfigured: function () {

            const requiredFields = [
                "apiKey",
                "authDomain",
                "projectId",
                "messagingSenderId",
                "appId"
            ];

            return requiredFields.every((field) => {

                const value = FirebaseConfig[field];

                return (
                    typeof value === "string" &&
                    value.trim() !== "" &&
                    !value.startsWith("YOUR_")
                );

            });

        },


        /* -------------------------------------------------
           5. LOAD FIREBASE SDK
        ------------------------------------------------- */

        loadSDK: async function () {

            if (
                window.firebase &&
                window.firebase.initializeApp
            ) {
                return true;
            }

            if (this.loading) {

                return new Promise((resolve) => {

                    const checkSDK = () => {

                        if (
                            window.firebase &&
                            window.firebase.initializeApp
                        ) {

                            resolve(true);

                        } else {

                            window.setTimeout(checkSDK, 100);

                        }

                    };

                    checkSDK();

                });

            }

            this.loading = true;

            try {

                await new Promise((resolve, reject) => {

                    const script = document.createElement("script");

                    script.src =
                        "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js";

                    script.async = true;

                    script.onload = resolve;

                    script.onerror = reject;

                    document.head.appendChild(script);

                });

                await Promise.all([

                    this.loadService(
                        "firebase-auth-compat.js"
                    ),

                    this.loadService(
                        "firebase-firestore-compat.js"
                    )

                ]);

                return true;

            } catch (error) {

                this.error = error;

                console.error(
                    "Insta Crown: Firebase SDK loading failed.",
                    error
                );

                return false;

            } finally {

                this.loading = false;

            }

        },


        /* -------------------------------------------------
           6. LOAD FIREBASE SERVICE
        ------------------------------------------------- */

        loadService: function (filename) {

            return new Promise((resolve, reject) => {

                const script = document.createElement("script");

                script.src =
                    "https://www.gstatic.com/firebasejs/10.14.1/" +
                    filename;

                script.async = true;

                script.onload = resolve;

                script.onerror = () => {

                    reject(
                        new Error(
                            "Failed to load " + filename
                        )
                    );

                };

                document.head.appendChild(script);

            });

        },


        /* -------------------------------------------------
           7. INITIALIZE FIREBASE APP
        ------------------------------------------------- */

        initializeApp: function () {

            if (!window.firebase) {

                throw new Error(
                    "Firebase SDK is not available."
                );

            }

            const existingApps = window.firebase.apps;

            if (existingApps && existingApps.length > 0) {

                this.app = window.firebase.app();

            } else {

                this.app = window.firebase.initializeApp(
                    FirebaseConfig
                );

            }

            return this.app;

        },


        /* -------------------------------------------------
           8. INITIALIZE AUTHENTICATION
        ------------------------------------------------- */

        initializeAuth: function () {

            if (!FirebaseSettings.useAuthentication) {
                return null;
            }

            this.auth = window.firebase.auth();

            return this.auth;

        },


        /* -------------------------------------------------
           9. INITIALIZE FIRESTORE
        ------------------------------------------------- */

        initializeFirestore: function () {

            if (!FirebaseSettings.useFirestore) {
                return null;
            }

            this.db = window.firebase.firestore();

            return this.db;

        },


        /* -------------------------------------------------
           10. INITIALIZE ANALYTICS
        ------------------------------------------------- */

        initializeAnalytics: async function () {

            if (!FirebaseSettings.useAnalytics) {
                return null;
            }

            try {

                await this.loadService(
                    "firebase-analytics-compat.js"
                );

                if (
                    !window.firebase.analytics ||
                    !window.firebase.analytics.isSupported
                ) {
                    return null;
                }

                const supported =
                    await window.firebase.analytics.isSupported();

                if (!supported) {
                    return null;
                }

                this.analytics = window.firebase.analytics();

                return this.analytics;

            } catch (error) {

                console.warn(
                    "Insta Crown: Analytics unavailable.",
                    error
                );

                return null;

            }

        },


        /* -------------------------------------------------
           11. INITIALIZE FIREBASE
        ------------------------------------------------- */

        init: async function () {

            if (this.initialized) {
                return true;
            }

            if (!FirebaseSettings.enabled) {

                console.warn(
                    "Insta Crown: Firebase is disabled."
                );

                return false;

            }

            if (!this.isConfigured()) {

                console.warn(
                    "Insta Crown: Add your Firebase project configuration first."
                );

                this.error = new Error(
                    "Firebase configuration is incomplete."
                );

                return false;

            }

            try {

                const sdkLoaded = await this.loadSDK();

                if (!sdkLoaded) {
                    throw this.error || new Error(
                        "Firebase SDK could not be loaded."
                    );
                }

                this.initializeApp();

                this.initializeAuth();

                this.initializeFirestore();

                await this.initializeAnalytics();

                this.initialized = true;

                console.log(
                    "Insta Crown: Firebase connected successfully."
                );

                window.dispatchEvent(
                    new CustomEvent("instaCrownFirebaseReady", {
                        detail: {
                            app: this.app,
                            auth: this.auth,
                            db: this.db
                        }
                    })
                );

                return true;

            } catch (error) {

                this.error = error;

                console.error(
                    "Insta Crown: Firebase initialization error.",
                    error
                );

                window.dispatchEvent(
                    new CustomEvent("instaCrownFirebaseError", {
                        detail: {
                            message: error.message
                        }
                    })
                );

                return false;

            }

        },


        /* -------------------------------------------------
           12. GET FIREBASE APP
        ------------------------------------------------- */

        getApp: function () {

            return this.app;

        },


        /* -------------------------------------------------
           13. GET AUTHENTICATION
        ------------------------------------------------- */

        getAuth: function () {

            return this.auth;

        },


        /* -------------------------------------------------
           14. GET DATABASE
        ------------------------------------------------- */

        getDatabase: function () {

            return this.db;

        },


        /* -------------------------------------------------
           15. GET CURRENT USER
        ------------------------------------------------- */

        getCurrentUser: function () {

            if (!this.auth) {
                return null;
            }

            return this.auth.currentUser;

        },


        /* -------------------------------------------------
           16. CHECK CONNECTION
        ------------------------------------------------- */

        isReady: function () {

            return (
                this.initialized &&
                this.app !== null
            );

        },


        /* -------------------------------------------------
           17. GET CONNECTION STATUS
        ------------------------------------------------- */

        getStatus: function () {

            return {

                initialized: this.initialized,

                authentication: this.auth !== null,

                firestore: this.db !== null,

                analytics: this.analytics !== null,

                configured: this.isConfigured(),

                error: this.error
                    ? this.error.message
                    : null

            };

        }

    };


    /* -----------------------------------------------------
       18. EXPORT FIREBASE CONFIGURATION
    ----------------------------------------------------- */

    window.InstaCrownFirebaseConfig = FirebaseConfig;

    window.FirebaseSettings = FirebaseSettings;

    window.FirebaseManager = FirebaseManager;


    /* -----------------------------------------------------
       19. FIREBASE READY HELPER
    ----------------------------------------------------- */

    window.waitForFirebase = function () {

        if (FirebaseManager.isReady()) {

            return Promise.resolve(FirebaseManager);

        }

        return new Promise((resolve, reject) => {

            window.addEventListener(
                "instaCrownFirebaseReady",
                () => resolve(FirebaseManager),
                { once: true }
            );

            window.addEventListener(
                "instaCrownFirebaseError",
                (event) => {

                    reject(
                        new Error(event.detail.message)
                    );

                },
                { once: true }
            );

        });

    };


    /* -----------------------------------------------------
       20. START FIREBASE
    ----------------------------------------------------- */

    FirebaseManager.init();


})();


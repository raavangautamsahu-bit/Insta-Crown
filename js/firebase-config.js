
/* =========================================================
   INSTA CROWN 👑
   FILE: js/firebase-config.js
   FIREBASE PROJECT: insta-crown
   ========================================================= */

(function () {
    "use strict";

    /* -----------------------------------------------------
       1. FIREBASE CONFIGURATION
    ----------------------------------------------------- */

    const firebaseConfig = {

        apiKey: "AIzaSyDHNwXw-TbcCeZmWpt4NAXdSpv_WsQadoo",

        authDomain: "insta-crown.firebaseapp.com",

        projectId: "insta-crown",

        storageBucket: "insta-crown.firebasestorage.app",

        messagingSenderId: "984558664582",

        appId: "1:984558664582:web:52351cc1628e24bf264a07"

    };


    /* -----------------------------------------------------
       2. FIREBASE SETTINGS
    ----------------------------------------------------- */

    const FirebaseSettings = {

        enabled: true,

        authentication: true,

        firestore: true,

        analytics: false,

        sdkVersion: "10.14.1"

    };


    /* -----------------------------------------------------
       3. FIREBASE MANAGER
    ----------------------------------------------------- */

    const FirebaseManager = {

        app: null,

        auth: null,

        db: null,

        initialized: false,

        loading: false,

        error: null,


        /* -------------------------------------------------
           4. LOAD FIREBASE SDK
        ------------------------------------------------- */

        loadScript: function (filename) {

            const existingScript = document.querySelector(
                'script[data-firebase-sdk="' + filename + '"]'
            );

            if (existingScript) {

                if (existingScript.dataset.loaded === "true") {
                    return Promise.resolve();
                }

                return new Promise((resolve, reject) => {

                    existingScript.addEventListener(
                        "load",
                        resolve,
                        { once: true }
                    );

                    existingScript.addEventListener(
                        "error",
                        reject,
                        { once: true }
                    );

                });

            }

            return new Promise((resolve, reject) => {

                const script = document.createElement("script");

                script.src =
                    "https://www.gstatic.com/firebasejs/" +
                    FirebaseSettings.sdkVersion + "/" +
                    filename;

                script.async = true;

                script.dataset.firebaseSdk = filename;

                script.onload = function () {

                    script.dataset.loaded = "true";

                    resolve();

                };

                script.onerror = function () {

                    reject(
                        new Error(
                            "Firebase SDK failed: " + filename
                        )
                    );

                };

                document.head.appendChild(script);

            });

        },


        /* -------------------------------------------------
           5. LOAD REQUIRED SDKs
        ------------------------------------------------- */

        loadSDK: async function () {

            await this.loadScript(
                "firebase-app-compat.js"
            );

            await Promise.all([

                this.loadScript(
                    "firebase-auth-compat.js"
                ),

                this.loadScript(
                    "firebase-firestore-compat.js"
                )

            ]);

            return true;

        },


        /* -------------------------------------------------
           6. INITIALIZE FIREBASE APP
        ------------------------------------------------- */

        initializeApp: function () {

            if (!window.firebase) {

                throw new Error(
                    "Firebase SDK not available."
                );

            }

            if (
                window.firebase.apps &&
                window.firebase.apps.length > 0
            ) {

                this.app = window.firebase.app();

            } else {

                this.app = window.firebase.initializeApp(
                    firebaseConfig
                );

            }

            return this.app;

        },


        /* -------------------------------------------------
           7. INITIALIZE AUTHENTICATION
        ------------------------------------------------- */

        initializeAuth: function () {

            if (!FirebaseSettings.authentication) {
                return null;
            }

            this.auth = this.app.auth();

            return this.auth;

        },


        /* -------------------------------------------------
           8. INITIALIZE FIRESTORE
        ------------------------------------------------- */

        initializeFirestore: function () {

            if (!FirebaseSettings.firestore) {
                return null;
            }

            this.db = this.app.firestore();

            return this.db;

        },


        /* -------------------------------------------------
           9. INITIALIZE FIREBASE
        ------------------------------------------------- */

        init: async function () {

            if (this.initialized) {
                return true;
            }

            if (this.loading) {
                return false;
            }

            if (!FirebaseSettings.enabled) {
                return false;
            }

            this.loading = true;

            try {

                await this.loadSDK();

                this.initializeApp();

                this.initializeAuth();

                this.initializeFirestore();

                this.initialized = true;

                console.log(
                    "👑 Insta Crown Firebase Connected!"
                );

                window.dispatchEvent(
                    new CustomEvent(
                        "instaCrownFirebaseReady",
                        {
                            detail: {
                                app: this.app,
                                auth: this.auth,
                                db: this.db
                            }
                        }
                    )
                );

                return true;

            } catch (error) {

                this.error = error;

                console.error(
                    "Firebase Connection Error:",
                    error
                );

                window.dispatchEvent(
                    new CustomEvent(
                        "instaCrownFirebaseError",
                        {
                            detail: {
                                message: error.message
                            }
                        }
                    )
                );

                return false;

            } finally {

                this.loading = false;

            }

        },


        /* -------------------------------------------------
           10. GET FIREBASE APP
        ------------------------------------------------- */

        getApp: function () {

            return this.app;

        },


        /* -------------------------------------------------
           11. GET AUTH
        ------------------------------------------------- */

        getAuth: function () {

            return this.auth;

        },


        /* -------------------------------------------------
           12. GET DATABASE
        ------------------------------------------------- */

        getDatabase: function () {

            return this.db;

        },


        /* -------------------------------------------------
           13. GET CURRENT USER
        ------------------------------------------------- */

        getCurrentUser: function () {

            return this.auth
                ? this.auth.currentUser
                : null;

        },


        /* -------------------------------------------------
           14. CHECK FIREBASE STATUS
        ------------------------------------------------- */

        isReady: function () {

            return (
                this.initialized &&
                this.app !== null
            );

        },


        /* -------------------------------------------------
           15. CONNECTION STATUS
        ------------------------------------------------- */

        getStatus: function () {

            return {

                projectId: firebaseConfig.projectId,

                initialized: this.initialized,

                authentication: this.auth !== null,

                firestore: this.db !== null,

                error: this.error
                    ? this.error.message
                    : null

            };

        }

    };


    /* -----------------------------------------------------
       16. EXPORT FIREBASE MANAGER
    ----------------------------------------------------- */

    window.InstaCrownFirebaseConfig = firebaseConfig;

    window.FirebaseSettings = FirebaseSettings;

    window.FirebaseManager = FirebaseManager;


    /* -----------------------------------------------------
       17. WAIT FOR FIREBASE
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
       18. START FIREBASE
    ----------------------------------------------------- */

    FirebaseManager.init();

})();

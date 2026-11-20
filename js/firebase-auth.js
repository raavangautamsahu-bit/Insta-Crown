
/* ============================================================
   INSTA CROWN 👑
   FIREBASE AUTHENTICATION SYSTEM
   File: js/firebase-auth.js

   Features:
   1. Email & Password Signup
   2. Email & Password Login
   3. Google Login
   4. Logout
   5. Password Reset
   6. Update User Profile
   7. Authentication State Listener
   8. Current User Information
   9. Form Validation
   10. Authentication Events
============================================================ */

(function () {
    "use strict";

    /* --------------------------------------------------------
       1. AUTHENTICATION CONFIGURATION
    -------------------------------------------------------- */

    const AuthConfig = {
        minimumPasswordLength: 6,

        selectors: {
            signupForm: '[data-auth-form="signup"]',
            loginForm: '[data-auth-form="login"]',
            googleButton: '[data-auth-action="google"]',
            logoutButton: '[data-auth-action="logout"]',
            resetButton: '[data-auth-action="reset-password"]'
        },

        messages: {
            signupSuccess: "Account successfully created!",
            loginSuccess: "Welcome back to Insta Crown!",
            logoutSuccess: "You have been logged out.",
            resetSuccess: "Password reset email sent.",
            googleSuccess: "Google login successful!",
            invalidEmail: "Please enter a valid email address.",
            invalidPassword: "Password must contain at least 6 characters.",
            passwordMismatch: "Passwords do not match.",
            somethingWrong: "Something went wrong. Please try again."
        }
    };


    /* --------------------------------------------------------
       2. AUTHENTICATION MANAGER
    -------------------------------------------------------- */

    class FirebaseAuthManager {

        constructor() {
            this.auth = null;
            this.initialized = false;
            this.currentUser = null;
            this.listeners = [];

            this.initialize();
        }


        /* ----------------------------------------------------
           INITIALIZE FIREBASE AUTH
        ---------------------------------------------------- */

        async initialize() {

            try {

                if (typeof window.waitForFirebase === "function") {

                    await window.waitForFirebase();

                }

                if (!window.FirebaseManager) {

                    throw new Error(
                        "FirebaseManager is not available."
                    );

                }

                this.auth =
                    window.FirebaseManager.getAuth();

                if (!this.auth) {

                    throw new Error(
                        "Firebase Authentication is unavailable."
                    );

                }

                this.initialized = true;

                this.startAuthListener();

                this.attachFormEvents();

                console.log(
                    "Insta Crown Authentication Initialized 👑"
                );

                window.dispatchEvent(
                    new CustomEvent(
                        "instaCrownAuthReady"
                    )
                );

            } catch (error) {

                console.error(
                    "Authentication initialization failed:",
                    error
                );

                this.showMessage(
                    "Firebase Authentication is not ready."
                );

            }

        }


        /* ----------------------------------------------------
           CHECK AUTHENTICATION READY
        ---------------------------------------------------- */

        async ensureReady() {

            if (this.initialized && this.auth) {
                return this.auth;
            }

            if (typeof window.waitForFirebase === "function") {

                await window.waitForFirebase();

            }

            if (!this.auth && window.FirebaseManager) {

                this.auth =
                    window.FirebaseManager.getAuth();

                this.initialized = Boolean(this.auth);

            }

            if (!this.auth) {

                throw new Error(
                    "Authentication service is unavailable."
                );

            }

            return this.auth;

        }


        /* ----------------------------------------------------
           VALIDATE EMAIL
        ---------------------------------------------------- */

        validateEmail(email) {

            if (!email || typeof email !== "string") {
                return false;
            }

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            return emailPattern.test(
                email.trim()
            );

        }


        /* ----------------------------------------------------
           VALIDATE PASSWORD
        ---------------------------------------------------- */

        validatePassword(password) {

            return (
                typeof password === "string" &&
                password.length >=
                AuthConfig.minimumPasswordLength
            );

        }


        /* ----------------------------------------------------
           DISPLAY MESSAGE
        ---------------------------------------------------- */

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
                    "[Insta Crown]",
                    message
                );

            }

        }


        /* ----------------------------------------------------
           HANDLE FIREBASE ERRORS
        ---------------------------------------------------- */

        getErrorMessage(error) {

            const errorCode =
                error && error.code
                    ? error.code
                    : "";

            const errors = {

                "auth/email-already-in-use":
                    "This email is already registered.",

                "auth/invalid-email":
                    "Please enter a valid email address.",

                "auth/weak-password":
                    "Your password is too weak.",

                "auth/user-not-found":
                    "No account found with this email.",

                "auth/wrong-password":
                    "Incorrect email or password.",

                "auth/invalid-credential":
                    "Incorrect email or password.",

                "auth/user-disabled":
                    "This account has been disabled.",

                "auth/too-many-requests":
                    "Too many attempts. Please try again later.",

                "auth/network-request-failed":
                    "Network error. Check your internet connection.",

                "auth/popup-closed-by-user":
                    "Google login was cancelled.",

                "auth/popup-blocked":
                    "Popup blocked. Please allow popups and try again.",

                "auth/unauthorized-domain":
                    "This domain is not authorized for Firebase login.",

                "auth/operation-not-allowed":
                    "This login method is not enabled in Firebase.",

                "auth/requires-recent-login":
                    "Please login again before performing this action."

            };

            return errors[errorCode] ||
                (error && error.message) ||
                AuthConfig.messages.somethingWrong;

        }


        /* ----------------------------------------------------
           3. SIGN UP WITH EMAIL
        ---------------------------------------------------- */

        async signUp(email, password, displayName = "") {

            try {

                await this.ensureReady();

                email = email.trim();

                if (!this.validateEmail(email)) {

                    throw new Error(
                        AuthConfig.messages.invalidEmail
                    );

                }

                if (!this.validatePassword(password)) {

                    throw new Error(
                        AuthConfig.messages.invalidPassword
                    );

                }

                const result =
                    await this.auth.createUserWithEmailAndPassword(
                        email,
                        password
                    );

                if (displayName.trim()) {

                    await result.user.updateProfile({

                        displayName:
                            displayName.trim()

                    });

                }

                this.showMessage(
                    AuthConfig.messages.signupSuccess,
                    "success"
                );

                return {

                    success: true,
                    user: result.user

                };

            } catch (error) {

                const message =
                    this.getErrorMessage(error);

                this.showMessage(
                    message,
                    "error"
                );

                return {

                    success: false,
                    error: message

                };

            }

        }


        /* ----------------------------------------------------
           4. LOGIN WITH EMAIL
        ---------------------------------------------------- */

        async login(email, password) {

            try {

                await this.ensureReady();

                email = email.trim();

                if (!this.validateEmail(email)) {

                    throw new Error(
                        AuthConfig.messages.invalidEmail
                    );

                }

                if (!password) {

                    throw new Error(
                        "Please enter your password."
                    );

                }

                const result =
                    await this.auth.signInWithEmailAndPassword(
                        email,
                        password
                    );

                this.showMessage(
                    AuthConfig.messages.loginSuccess,
                    "success"
                );

                return {

                    success: true,
                    user: result.user

                };

            } catch (error) {

                const message =
                    this.getErrorMessage(error);

                this.showMessage(
                    message,
                    "error"
                );

                return {

                    success: false,
                    error: message

                };

            }

        }


        /* ----------------------------------------------------
           5. GOOGLE LOGIN
        ---------------------------------------------------- */

        async signInWithGoogle() {

            try {

                await this.ensureReady();

                const provider =
                    new firebase.auth.GoogleAuthProvider();

                provider.setCustomParameters({

                    prompt: "select_account"

                });

                const result =
                    await this.auth.signInWithPopup(
                        provider
                    );

                this.showMessage(
                    AuthConfig.messages.googleSuccess,
                    "success"
                );

                return {

                    success: true,
                    user: result.user

                };

            } catch (error) {

                const message =
                    this.getErrorMessage(error);

                this.showMessage(
                    message,
                    "error"
                );

                return {

                    success: false,
                    error: message

                };

            }

        }


        /* ----------------------------------------------------
           6. GOOGLE LOGIN WITH REDIRECT
           Useful when popup login is unavailable on mobile.
        ---------------------------------------------------- */

        async signInWithGoogleRedirect() {

            try {

                await this.ensureReady();

                const provider =
                    new firebase.auth.GoogleAuthProvider();

                await this.auth.signInWithRedirect(
                    provider
                );

                return {

                    success: true

                };

            } catch (error) {

                const message =
                    this.getErrorMessage(error);

                this.showMessage(
                    message,
                    "error"
                );

                return {

                    success: false,
                    error: message

                };

            }

        }


        /* ----------------------------------------------------
           7. CHECK GOOGLE REDIRECT RESULT
        ---------------------------------------------------- */

        async checkRedirectResult() {

            try {

                await this.ensureReady();

                const result =
                    await this.auth.getRedirectResult();

                if (result && result.user) {

                    this.showMessage(
                        AuthConfig.messages.googleSuccess,
                        "success"
                    );

                }

                return result;

            } catch (error) {

                const message =
                    this.getErrorMessage(error);

                this.showMessage(
                    message,
                    "error"
                );

                return null;

            }

        }


        /* ----------------------------------------------------
           8. LOGOUT
        ---------------------------------------------------- */

        async logout() {

            try {

                await this.ensureReady();

                await this.auth.signOut();

                this.showMessage(
                    AuthConfig.messages.logoutSuccess,
                    "success"
                );

                return {

                    success: true

                };

            } catch (error) {

                const message =
                    this.getErrorMessage(error);

                this.showMessage(
                    message,
                    "error"
                );

                return {

                    success: false,
                    error: message

                };

            }

        }


        /* ----------------------------------------------------
           9. PASSWORD RESET
        ---------------------------------------------------- */

        async sendPasswordReset(email) {

            try {

                await this.ensureReady();

                email = email.trim();

                if (!this.validateEmail(email)) {

                    throw new Error(
                        AuthConfig.messages.invalidEmail
                    );

                }

                await this.auth.sendPasswordResetEmail(
                    email
                );

                this.showMessage(
                    AuthConfig.messages.resetSuccess,
                    "success"
                );

                return {

                    success: true

                };

            } catch (error) {

                const message =
                    this.getErrorMessage(error);

                this.showMessage(
                    message,
                    "error"
                );

                return {

                    success: false,
                    error: message

                };

            }

        }


        /* ----------------------------------------------------
           10. UPDATE USER PROFILE
        ---------------------------------------------------- */

        async updateProfile(
            displayName,
            photoURL = null
        ) {

            try {

                await this.ensureReady();

                const user =
                    this.auth.currentUser;

                if (!user) {

                    throw new Error(
                        "Please login first."
                    );

                }

                const profileData = {

                    displayName:
                        displayName
                            ? displayName.trim()
                            : user.displayName

                };

                if (photoURL) {

                    profileData.photoURL =
                        photoURL;

                }

                await user.updateProfile(
                    profileData
                );

                this.showMessage(
                    "Profile updated successfully!",
                    "success"
                );

                return {

                    success: true,
                    user: user

                };

            } catch (error) {

                const message =
                    this.getErrorMessage(error);

                this.showMessage(
                    message,
                    "error"
                );

                return {

                    success: false,
                    error: message

                };

            }

        }


        /* ----------------------------------------------------
           11. SEND EMAIL VERIFICATION
        ---------------------------------------------------- */

        async sendEmailVerification() {

            try {

                await this.ensureReady();

                const user =
                    this.auth.currentUser;

                if (!user) {

                    throw new Error(
                        "Please login first."
                    );

                }

                await user.sendEmailVerification();

                this.showMessage(
                    "Verification email sent!",
                    "success"
                );

                return {

                    success: true

                };

            } catch (error) {

                const message =
                    this.getErrorMessage(error);

                this.showMessage(
                    message,
                    "error"
                );

                return {

                    success: false,
                    error: message

                };

            }

        }


        /* ----------------------------------------------------
           12. GET CURRENT USER
        ---------------------------------------------------- */

        getCurrentUser() {

            if (!this.auth) {
                return null;
            }

            return this.auth.currentUser;

        }


        /* ----------------------------------------------------
           13. CHECK LOGIN STATUS
        ---------------------------------------------------- */

        isLoggedIn() {

            return Boolean(
                this.getCurrentUser()
            );

        }


        /* ----------------------------------------------------
           14. AUTHENTICATION STATE LISTENER
        ---------------------------------------------------- */

        startAuthListener() {

            if (!this.auth) {
                return;
            }

            this.auth.onAuthStateChanged(
                (user) => {

                    this.currentUser = user;

                    this.listeners.forEach(
                        (callback) => {

                            try {

                                callback(user);

                            } catch (error) {

                                console.error(
                                    "Auth listener error:",
                                    error
                                );

                            }

                        }
                    );

                    window.dispatchEvent(

                        new CustomEvent(
                            "instaCrownAuthStateChanged",
                            {

                                detail: {

                                    user: user,

                                    isLoggedIn:
                                        Boolean(user)

                                }

                            }
                        )

                    );

                }
            );

        }


        /* ----------------------------------------------------
           15. REGISTER CUSTOM AUTH LISTENER
        ---------------------------------------------------- */

        onAuthStateChanged(callback) {

            if (typeof callback !== "function") {
                return;
            }

            this.listeners.push(callback);

            if (this.currentUser !== undefined) {

                callback(this.currentUser);

            }

            return () => {

                this.listeners =
                    this.listeners.filter(
                        (item) => item !== callback
                    );

            };

        }


        /* ----------------------------------------------------
           16. GET USER INFORMATION
        ---------------------------------------------------- */

        getUserInfo() {

            const user =
                this.getCurrentUser();

            if (!user) {
                return null;
            }

            return {

                uid: user.uid,

                email: user.email,

                displayName:
                    user.displayName,

                photoURL:
                    user.photoURL,

                emailVerified:
                    user.emailVerified,

                phoneNumber:
                    user.phoneNumber,

                providerData:
                    user.providerData

            };

        }


        /* ----------------------------------------------------
           17. ATTACH FORM EVENTS
        ---------------------------------------------------- */

        attachFormEvents() {

            document.addEventListener(
                "submit",
                async (event) => {

                    const form =
                        event.target;

                    if (
                        form.matches(
                            AuthConfig.selectors.signupForm
                        )
                    ) {

                        event.preventDefault();

                        await this.handleSignupForm(form);

                    }

                    if (
                        form.matches(
                            AuthConfig.selectors.loginForm
                        )
                    ) {

                        event.preventDefault();

                        await this.handleLoginForm(form);

                    }

                }
            );


            /* GOOGLE LOGIN BUTTON */

            document.addEventListener(
                "click",
                async (event) => {

                    const googleButton =
                        event.target.closest(
                            AuthConfig.selectors.googleButton
                        );

                    if (googleButton) {

                        event.preventDefault();

                        await this.withButtonLoading(
                            googleButton,
                            () => this.signInWithGoogle()
                        );

                    }


                    /* LOGOUT BUTTON */

                    const logoutButton =
                        event.target.closest(
                            AuthConfig.selectors.logoutButton
                        );

                    if (logoutButton) {

                        event.preventDefault();

                        await this.withButtonLoading(
                            logoutButton,
                            () => this.logout()
                        );

                    }


                    /* PASSWORD RESET BUTTON */

                    const resetButton =
                        event.target.closest(
                            AuthConfig.selectors.resetButton
                        );

                    if (resetButton) {

                        event.preventDefault();

                        const emailInput =
                            document.querySelector(
                                '[name="email"]'
                            );

                        const email =
                            emailInput
                                ? emailInput.value
                                : "";

                        await this.withButtonLoading(
                            resetButton,
                            () => this.sendPasswordReset(email)
                        );

                    }

                }
            );

        }


        /* ----------------------------------------------------
           18. HANDLE SIGNUP FORM
        ---------------------------------------------------- */

        async handleSignupForm(form) {

            const email =
                form.querySelector(
                    '[name="email"]'
                )?.value || "";

            const password =
                form.querySelector(
                    '[name="password"]'
                )?.value || "";

            const confirmPassword =
                form.querySelector(
                    '[name="confirmPassword"]'
                )?.value || "";

            const displayName =
                form.querySelector(
                    '[name="displayName"]'
                )?.value || "";

            if (
                confirmPassword &&
                password !== confirmPassword
            ) {

                this.showMessage(
                    AuthConfig.messages.passwordMismatch,
                    "error"
                );

                return;

            }

            await this.withButtonLoading(
                form.querySelector(
                    '[type="submit"]'
                ),
                () => this.signUp(
                    email,
                    password,
                    displayName
                )
            );

        }


        /* ----------------------------------------------------
           19. HANDLE LOGIN FORM
        ---------------------------------------------------- */

        async handleLoginForm(form) {

            const email =
                form.querySelector(
                    '[name="email"]'
                )?.value || "";

            const password =
                form.querySelector(
                    '[name="password"]'
                )?.value || "";

            await this.withButtonLoading(
                form.querySelector(
                    '[type="submit"]'
                ),
                () => this.login(
                    email,
                    password
                )
            );

        }


        /* ----------------------------------------------------
           20. BUTTON LOADING SYSTEM
        ---------------------------------------------------- */

        async withButtonLoading(button, callback) {

            if (!button || typeof callback !== "function") {

                return callback
                    ? await callback()
                    : null;

            }

            const originalText =
                button.innerHTML;

            const wasDisabled =
                button.disabled;

            button.disabled = true;

            button.setAttribute(
                "aria-busy",
                "true"
            );

            button.classList.add(
                "is-loading"
            );

            button.innerHTML =
                '<span class="button-spinner"></span> Please wait...';

            try {

                return await callback();

            } finally {

                button.disabled = wasDisabled;

                button.removeAttribute(
                    "aria-busy"
                );

                button.classList.remove(
                    "is-loading"
                );

                button.innerHTML =
                    originalText;

            }

        }

    }


    /* --------------------------------------------------------
       21. CREATE GLOBAL AUTH INSTANCE
    -------------------------------------------------------- */

    const AuthManager =
        new FirebaseAuthManager();


    /* --------------------------------------------------------
       22. PUBLIC GLOBAL API
    -------------------------------------------------------- */

    window.FirebaseAuthManager =
        AuthManager;

    window.InstaCrownAuth =
        AuthManager;


    /* --------------------------------------------------------
       23. EASY AUTHENTICATION FUNCTIONS
    -------------------------------------------------------- */

    window.instaCrownSignup = function (
        email,
        password,
        displayName
    ) {

        return AuthManager.signUp(
            email,
            password,
            displayName
        );

    };


    window.instaCrownLogin = function (
        email,
        password
    ) {

        return AuthManager.login(
            email,
            password
        );

    };


    window.instaCrownGoogleLogin = function () {

        return AuthManager.signInWithGoogle();

    };


    window.instaCrownLogout = function () {

        return AuthManager.logout();

    };


    window.instaCrownPasswordReset = function (
        email
    ) {

        return AuthManager.sendPasswordReset(email);

    };


    window.getInstaCrownUser = function () {

        return AuthManager.getUserInfo();

    };


    /* --------------------------------------------------------
       24. AUTOMATIC REDIRECT RESULT CHECK
    -------------------------------------------------------- */

    window.addEventListener(
        "instaCrownFirebaseReady",
        function () {

            AuthManager.checkRedirectResult();

        }
    );


    /* --------------------------------------------------------
       25. AUTHENTICATION DEBUG INFORMATION
    -------------------------------------------------------- */

    window.InstaCrownAuthConfig =
        Object.freeze(AuthConfig);


})();


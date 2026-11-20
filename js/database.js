
/* ============================================================
   INSTA CROWN 👑
   FIREBASE FIRESTORE DATABASE SYSTEM
   File: js/database.js

   FEATURES:
   1. Firestore Initialization
   2. User Profile Management
   3. Create User Documents
   4. Read User Documents
   5. Update User Profiles
   6. Delete User Documents
   7. User Settings
   8. Download Activity History
   9. Saved Items
   10. Real-time Database Listeners
   11. Database Error Handling
   12. Automatic Timestamps
============================================================ */

(function () {

    "use strict";


    /* ========================================================
       1. DATABASE CONFIGURATION
    ======================================================== */

    const DatabaseConfig = {

        collections: {

            users: "users",

            settings: "settings",

            activity: "activity",

            savedItems: "savedItems",

            downloads: "downloads"

        },

        maximumActivityRecords: 50,

        maximumSavedItems: 100,

        defaultSettings: {

            theme: "light",

            notifications: true,

            language: "en",

            privacy: "public"

        }

    };


    /* ========================================================
       2. DATABASE MANAGER CLASS
    ======================================================== */

    class InstaCrownDatabase {

        constructor() {

            this.db = null;

            this.initialized = false;

            this.currentUserId = null;

            this.listeners = [];

            this.initialize();

        }


        /* ====================================================
           3. INITIALIZE FIRESTORE
        ==================================================== */

        async initialize() {

            try {

                if (
                    typeof window.waitForFirebase === "function"
                ) {

                    await window.waitForFirebase();

                }

                if (!window.FirebaseManager) {

                    throw new Error(
                        "FirebaseManager is unavailable."
                    );

                }

                this.db =
                    window.FirebaseManager.getFirestore();

                if (!this.db) {

                    throw new Error(
                        "Firestore database is unavailable."
                    );

                }

                this.initialized = true;

                console.log(
                    "Insta Crown Firestore Ready 👑"
                );

                window.dispatchEvent(

                    new CustomEvent(
                        "instaCrownDatabaseReady"
                    )

                );

                this.attachAuthListener();

            } catch (error) {

                console.error(
                    "Database initialization error:",
                    error
                );

                this.showMessage(
                    "Database initialization failed.",
                    "error"
                );

            }

        }


        /* ====================================================
           4. ENSURE DATABASE READY
        ==================================================== */

        async ensureReady() {

            if (this.initialized && this.db) {

                return this.db;

            }

            if (
                typeof window.waitForFirebase === "function"
            ) {

                await window.waitForFirebase();

            }

            if (!this.db && window.FirebaseManager) {

                this.db =
                    window.FirebaseManager.getFirestore();

                this.initialized =
                    Boolean(this.db);

            }

            if (!this.db) {

                throw new Error(
                    "Firestore is not initialized."
                );

            }

            return this.db;

        }


        /* ====================================================
           5. MESSAGE SYSTEM
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
                    "[Insta Crown Database]",
                    message
                );

            }

        }


        /* ====================================================
           6. ERROR HANDLER
        ==================================================== */

        getErrorMessage(error) {

            const code =
                error && error.code
                    ? error.code
                    : "";

            const errors = {

                "permission-denied":
                    "You do not have permission to access this data.",

                "unavailable":
                    "Database is temporarily unavailable.",

                "not-found":
                    "Requested database record was not found.",

                "already-exists":
                    "This database record already exists.",

                "resource-exhausted":
                    "Database usage limit reached.",

                "unauthenticated":
                    "Please login to continue."

            };

            return errors[code] ||
                (error && error.message) ||
                "Database operation failed.";

        }


        /* ====================================================
           7. GET CURRENT USER ID
        ==================================================== */

        getUserId() {

            const user =
                window.InstaCrownAuth
                    ? window.InstaCrownAuth.getCurrentUser()
                    : null;

            if (!user) {

                throw new Error(
                    "Please login first."
                );

            }

            return user.uid;

        }


        /* ====================================================
           8. GET COLLECTION REFERENCE
        ==================================================== */

        async getCollection(name) {

            await this.ensureReady();

            return this.db.collection(name);

        }


        /* ====================================================
           9. GET DOCUMENT REFERENCE
        ==================================================== */

        async getDocument(collection, documentId) {

            await this.ensureReady();

            if (!documentId) {

                throw new Error(
                    "Document ID is required."
                );

            }

            return this.db
                .collection(collection)
                .doc(documentId);

        }


        /* ====================================================
           10. CREATE USER PROFILE
        ==================================================== */

        async createUserProfile(userData = {}) {

            try {

                await this.ensureReady();

                const userId =
                    this.getUserId();

                const user =
                    window.InstaCrownAuth.getCurrentUser();

                const userRef =
                    this.db
                        .collection(
                            DatabaseConfig.collections.users
                        )
                        .doc(userId);

                const existing =
                    await userRef.get();

                if (existing.exists) {

                    return {

                        success: true,

                        message:
                            "User profile already exists."

                    };

                }

                const profile = {

                    uid: userId,

                    email:
                        user.email || "",

                    displayName:
                        userData.displayName ||
                        user.displayName ||
                        "",

                    photoURL:
                        userData.photoURL ||
                        user.photoURL ||
                        "",

                    bio:
                        userData.bio || "",

                    username:
                        userData.username || "",

                    createdAt:
                        firebase.firestore.FieldValue.serverTimestamp(),

                    updatedAt:
                        firebase.firestore.FieldValue.serverTimestamp()

                };

                await userRef.set(profile);

                await this.createUserSettings();

                return {

                    success: true,

                    data: profile

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


        /* ====================================================
           11. GET USER PROFILE
        ==================================================== */

        async getUserProfile(userId = null) {

            try {

                await this.ensureReady();

                const id =
                    userId || this.getUserId();

                const snapshot =
                    await this.db
                        .collection(
                            DatabaseConfig.collections.users
                        )
                        .doc(id)
                        .get();

                if (!snapshot.exists) {

                    return {

                        success: false,

                        data: null,

                        message:
                            "User profile not found."

                    };

                }

                return {

                    success: true,

                    data: {

                        id: snapshot.id,

                        ...snapshot.data()

                    }

                };

            } catch (error) {

                const message =
                    this.getErrorMessage(error);

                return {

                    success: false,

                    error: message

                };

            }

        }


        /* ====================================================
           12. UPDATE USER PROFILE
        ==================================================== */

        async updateUserProfile(updates = {}) {

            try {

                await this.ensureReady();

                const userId =
                    this.getUserId();

                const allowedFields = [

                    "displayName",

                    "username",

                    "bio",

                    "photoURL",

                    "website"

                ];

                const safeUpdates = {};

                allowedFields.forEach((field) => {

                    if (
                        Object.prototype.hasOwnProperty.call(
                            updates,
                            field
                        )
                    ) {

                        safeUpdates[field] =
                            updates[field];

                    }

                });

                if (
                    Object.keys(safeUpdates).length === 0
                ) {

                    throw new Error(
                        "No valid profile fields provided."
                    );

                }

                safeUpdates.updatedAt =
                    firebase.firestore.FieldValue.serverTimestamp();

                await this.db
                    .collection(
                        DatabaseConfig.collections.users
                    )
                    .doc(userId)
                    .update(safeUpdates);

                this.showMessage(
                    "Profile updated successfully!",
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


        /* ====================================================
           13. DELETE USER PROFILE DOCUMENT
           Does not delete Firebase Authentication account.
        ==================================================== */

        async deleteUserProfile() {

            try {

                await this.ensureReady();

                const userId =
                    this.getUserId();

                await this.db
                    .collection(
                        DatabaseConfig.collections.users
                    )
                    .doc(userId)
                    .delete();

                return {

                    success: true

                };

            } catch (error) {

                const message =
                    this.getErrorMessage(error);

                return {

                    success: false,

                    error: message

                };

            }

        }


        /* ====================================================
           14. CREATE DEFAULT USER SETTINGS
        ==================================================== */

        async createUserSettings() {

            try {

                await this.ensureReady();

                const userId =
                    this.getUserId();

                const settingsRef =
                    this.db
                        .collection(
                            DatabaseConfig.collections.users
                        )
                        .doc(userId)
                        .collection("settings")
                        .doc("preferences");

                const existing =
                    await settingsRef.get();

                if (existing.exists) {

                    return {

                        success: true

                    };

                }

                await settingsRef.set({

                    ...DatabaseConfig.defaultSettings,

                    createdAt:
                        firebase.firestore.FieldValue.serverTimestamp(),

                    updatedAt:
                        firebase.firestore.FieldValue.serverTimestamp()

                });

                return {

                    success: true

                };

            } catch (error) {

                return {

                    success: false,

                    error:
                        this.getErrorMessage(error)

                };

            }

        }


        /* ====================================================
           15. GET USER SETTINGS
        ==================================================== */

        async getUserSettings() {

            try {

                await this.ensureReady();

                const userId =
                    this.getUserId();

                const snapshot =
                    await this.db
                        .collection(
                            DatabaseConfig.collections.users
                        )
                        .doc(userId)
                        .collection("settings")
                        .doc("preferences")
                        .get();

                if (!snapshot.exists) {

                    return {

                        success: true,

                        data:
                            DatabaseConfig.defaultSettings

                    };

                }

                return {

                    success: true,

                    data: snapshot.data()

                };

            } catch (error) {

                return {

                    success: false,

                    error:
                        this.getErrorMessage(error)

                };

            }

        }


        /* ====================================================
           16. UPDATE USER SETTINGS
        ==================================================== */

        async updateUserSettings(settings = {}) {

            try {

                await this.ensureReady();

                const userId =
                    this.getUserId();

                const allowedSettings = [

                    "theme",

                    "notifications",

                    "language",

                    "privacy"

                ];

                const safeSettings = {};

                allowedSettings.forEach((key) => {

                    if (
                        Object.prototype.hasOwnProperty.call(
                            settings,
                            key
                        )
                    ) {

                        safeSettings[key] =
                            settings[key];

                    }

                });

                if (
                    Object.keys(safeSettings).length === 0
                ) {

                    throw new Error(
                        "No valid settings provided."
                    );

                }

                safeSettings.updatedAt =
                    firebase.firestore.FieldValue.serverTimestamp();

                await this.db
                    .collection(
                        DatabaseConfig.collections.users
                    )
                    .doc(userId)
                    .collection("settings")
                    .doc("preferences")
                    .set(
                        safeSettings,
                        { merge: true }
                    );

                return {

                    success: true

                };

            } catch (error) {

                return {

                    success: false,

                    error:
                        this.getErrorMessage(error)

                };

            }

        }


        /* ====================================================
           17. SAVE ACTIVITY RECORD
        ==================================================== */

        async saveActivity(activity = {}) {

            try {

                await this.ensureReady();

                const userId =
                    this.getUserId();

                const activityData = {

                    type:
                        activity.type || "general",

                    title:
                        activity.title || "Activity",

                    description:
                        activity.description || "",

                    status:
                        activity.status || "completed",

                    createdAt:
                        firebase.firestore.FieldValue.serverTimestamp()

                };

                const ref =
                    await this.db
                        .collection(
                            DatabaseConfig.collections.users
                        )
                        .doc(userId)
                        .collection("activity")
                        .add(activityData);

                return {

                    success: true,

                    id: ref.id

                };

            } catch (error) {

                return {

                    success: false,

                    error:
                        this.getErrorMessage(error)

                };

            }

        }


        /* ====================================================
           18. GET ACTIVITY HISTORY
        ==================================================== */

        async getActivityHistory(limit = 20) {

            try {

                await this.ensureReady();

                const userId =
                    this.getUserId();

                const safeLimit =
                    Math.min(
                        Math.max(
                            Number(limit) || 20,
                            1
                        ),
                        DatabaseConfig.maximumActivityRecords
                    );

                const snapshot =
                    await this.db
                        .collection(
                            DatabaseConfig.collections.users
                        )
                        .doc(userId)
                        .collection("activity")
                        .orderBy(
                            "createdAt",
                            "desc"
                        )
                        .limit(safeLimit)
                        .get();

                const records = [];

                snapshot.forEach((doc) => {

                    records.push({

                        id: doc.id,

                        ...doc.data()

                    });

                });

                return {

                    success: true,

                    data: records

                };

            } catch (error) {

                return {

                    success: false,

                    error:
                        this.getErrorMessage(error)

                };

            }

        }


        /* ====================================================
           19. SAVE ITEM
        ==================================================== */

        async saveItem(item = {}) {

            try {

                await this.ensureReady();

                const userId =
                    this.getUserId();

                if (!item.url) {

                    throw new Error(
                        "Item URL is required."
                    );

                }

                const savedRef =
                    this.db
                        .collection(
                            DatabaseConfig.collections.users
                        )
                        .doc(userId)
                        .collection("savedItems");

                const existing =
                    await savedRef
                        .where(
                            "url",
                            "==",
                            item.url
                        )
                        .limit(1)
                        .get();

                if (!existing.empty) {

                    return {

                        success: false,

                        message:
                            "This item is already saved."

                    };

                }

                const count =
                    await savedRef
                        .limit(
                            DatabaseConfig.maximumSavedItems
                        )
                        .get();

                if (
                    count.size >=
                    DatabaseConfig.maximumSavedItems
                ) {

                    throw new Error(
                        "Your saved items limit has been reached."
                    );

                }

                const ref =
                    await savedRef.add({

                        url: item.url,

                        title:
                            item.title || "Saved item",

                        type:
                            item.type || "post",

                        createdAt:
                            firebase.firestore.FieldValue.serverTimestamp()

                    });

                return {

                    success: true,

                    id: ref.id

                };

            } catch (error) {

                return {

                    success: false,

                    error:
                        this.getErrorMessage(error)

                };

            }

        }


        /* ====================================================
           20. GET SAVED ITEMS
        ==================================================== */

        async getSavedItems() {

            try {

                await this.ensureReady();

                const userId =
                    this.getUserId();

                const snapshot =
                    await this.db
                        .collection(
                            DatabaseConfig.collections.users
                        )
                        .doc(userId)
                        .collection("savedItems")
                        .orderBy(
                            "createdAt",
                            "desc"
                        )
                        .get();

                const items = [];

                snapshot.forEach((doc) => {

                    items.push({

                        id: doc.id,

                        ...doc.data()

                    });

                });

                return {

                    success: true,

                    data: items

                };

            } catch (error) {

                return {

                    success: false,

                    error:
                        this.getErrorMessage(error)

                };

            }

        }


        /* ====================================================
           21. REMOVE SAVED ITEM
        ==================================================== */

        async removeSavedItem(itemId) {

            try {

                await this.ensureReady();

                const userId =
                    this.getUserId();

                if (!itemId) {

                    throw new Error(
                        "Saved item ID is required."
                    );

                }

                await this.db
                    .collection(
                        DatabaseConfig.collections.users
                    )
                    .doc(userId)
                    .collection("savedItems")
                    .doc(itemId)
                    .delete();

                return {

                    success: true

                };

            } catch (error) {

                return {

                    success: false,

                    error:
                        this.getErrorMessage(error)

                };

            }

        }


        /* ====================================================
           22. REAL-TIME USER PROFILE LISTENER
        ==================================================== */

        async listenToUserProfile(callback) {

            try {

                await this.ensureReady();

                const userId =
                    this.getUserId();

                const unsubscribe =
                    this.db
                        .collection(
                            DatabaseConfig.collections.users
                        )
                        .doc(userId)
                        .onSnapshot(
                            (snapshot) => {

                                if (!snapshot.exists) {

                                    callback(null);

                                    return;

                                }

                                callback({

                                    id: snapshot.id,

                                    ...snapshot.data()

                                });

                            },
                            (error) => {

                                console.error(
                                    "Profile listener error:",
                                    error
                                );

                            }
                        );

                this.listeners.push(unsubscribe);

                return unsubscribe;

            } catch (error) {

                console.error(error);

                return null;

            }

        }


        /* ====================================================
           23. REAL-TIME SETTINGS LISTENER
        ==================================================== */

        async listenToSettings(callback) {

            try {

                await this.ensureReady();

                const userId =
                    this.getUserId();

                const unsubscribe =
                    this.db
                        .collection(
                            DatabaseConfig.collections.users
                        )
                        .doc(userId)
                        .collection("settings")
                        .doc("preferences")
                        .onSnapshot(
                            (snapshot) => {

                                callback(
                                    snapshot.exists
                                        ? snapshot.data()
                                        : DatabaseConfig.defaultSettings
                                );

                            },
                            (error) => {

                                console.error(
                                    "Settings listener error:",
                                    error
                                );

                            }
                        );

                this.listeners.push(unsubscribe);

                return unsubscribe;

            } catch (error) {

                console.error(error);

                return null;

            }

        }


        /* ====================================================
           24. STOP ALL REAL-TIME LISTENERS
        ==================================================== */

        stopAllListeners() {

            this.listeners.forEach(
                (unsubscribe) => {

                    if (
                        typeof unsubscribe === "function"
                    ) {

                        unsubscribe();

                    }

                }
            );

            this.listeners = [];

        }


        /* ====================================================
           25. AUTH STATE LISTENER
        ==================================================== */

        attachAuthListener() {

            window.addEventListener(

                "instaCrownAuthStateChanged",

                async (event) => {

                    const user =
                        event.detail.user;

                    this.currentUserId =
                        user ? user.uid : null;

                    if (user) {

                        await this.createUserProfile();

                    } else {

                        this.stopAllListeners();

                    }

                }

            );

        }


        /* ====================================================
           26. DATABASE STATUS
        ==================================================== */

        getStatus() {

            return {

                initialized:
                    this.initialized,

                connected:
                    Boolean(this.db),

                currentUserId:
                    this.currentUserId

            };

        }

    }


    /* ========================================================
       27. CREATE DATABASE INSTANCE
    ======================================================== */

    const Database =
        new InstaCrownDatabase();


    /* ========================================================
       28. GLOBAL DATABASE ACCESS
    ======================================================== */

    window.InstaCrownDatabase =
        Database;

    window.FirebaseDatabase =
        Database;


    /* ========================================================
       29. EASY GLOBAL DATABASE FUNCTIONS
    ======================================================== */

    window.getInstaCrownProfile = function (userId) {

        return Database.getUserProfile(userId);

    };


    window.updateInstaCrownProfile = function (data) {

        return Database.updateUserProfile(data);

    };


    window.saveInstaCrownActivity = function (data) {

        return Database.saveActivity(data);

    };


    window.getInstaCrownActivity = function (limit) {

        return Database.getActivityHistory(limit);

    };


    window.saveInstaCrownItem = function (item) {

        return Database.saveItem(item);

    };


    window.getInstaCrownSavedItems = function () {

        return Database.getSavedItems();

    };


    window.removeInstaCrownSavedItem = function (id) {

        return Database.removeSavedItem(id);

    };


    /* ========================================================
       30. EXPORT DATABASE CONFIGURATION
    ======================================================== */

    window.InstaCrownDatabaseConfig =
        Object.freeze(DatabaseConfig);


})();


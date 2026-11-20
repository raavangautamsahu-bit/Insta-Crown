
/* ============================================================
   INSTA CROWN 👑
   WALLET MANAGEMENT SYSTEM
   File: js/pages/wallet.js

   FEATURES:
   1. Firebase Wallet Initialization
   2. User Authentication Check
   3. Wallet Balance Loading
   4. Add Money Requests
   5. Withdraw Money Requests
   6. Transaction History
   7. Wallet Request History
   8. Amount Validation
   9. Loading & Error Handling
   10. Transaction Status Display
   11. Secure Client-Side Limitations
   12. Real-Time Wallet Updates
============================================================ */

(function () {
    "use strict";

    /* ========================================================
       1. WALLET CONFIGURATION
    ======================================================== */

    const WalletConfig = {
        collections: {
            users: "users",
            wallet: "wallet",
            transactions: "walletTransactions",
            requests: "walletRequests"
        },

        currency: "INR",
        currencySymbol: "₹",

        minimumAddAmount: 10,
        maximumAddAmount: 50000,

        minimumWithdrawAmount: 50,
        maximumWithdrawAmount: 25000,

        transactionLimit: 30,
        requestLimit: 20,

        refreshInterval: 60000
    };


    /* ========================================================
       2. WALLET MANAGER CLASS
    ======================================================== */

    class InstaCrownWallet {

        constructor() {
            this.db = null;
            this.auth = null;

            this.currentUser = null;
            this.balance = 0;

            this.transactions = [];
            this.requests = [];

            this.initialized = false;
            this.loading = false;

            this.unsubscribers = [];
            this.eventListenersAttached = false;

            this.elements = {};

            this.init();
        }


        /* ====================================================
           3. INITIALIZE WALLET
        ==================================================== */

        async init() {
            try {
                await this.waitForFirebase();

                this.db =
                    window.FirebaseManager.getFirestore();

                this.auth =
                    window.FirebaseManager.getAuth();

                if (!this.db || !this.auth) {
                    throw new Error(
                        "Firebase services are unavailable."
                    );
                }

                this.cacheElements();
                this.attachEventListeners();
                this.attachAuthListener();

                this.initialized = true;

                console.log(
                    "Insta Crown Wallet Initialized 👑"
                );

                window.dispatchEvent(
                    new CustomEvent(
                        "instaCrownWalletReady"
                    )
                );

                if (this.auth.currentUser) {
                    await this.setCurrentUser(
                        this.auth.currentUser
                    );
                } else {
                    this.showLoggedOutState();
                }

            } catch (error) {
                console.error(
                    "Wallet initialization failed:",
                    error
                );

                this.showError(
                    "Wallet could not be initialized. Please try again."
                );
            }
        }


        /* ====================================================
           4. WAIT FOR FIREBASE
        ==================================================== */

        async waitForFirebase() {
            if (
                typeof window.waitForFirebase === "function"
            ) {
                await window.waitForFirebase();
            }

            if (!window.FirebaseManager) {
                throw new Error(
                    "FirebaseManager not found."
                );
            }
        }


        /* ====================================================
           5. CACHE HTML ELEMENTS
        ==================================================== */

        cacheElements() {
            this.elements = {
                balance: this.findElement([
                    "#walletBalance",
                    "#wallet-balance",
                    "[data-wallet-balance]"
                ]),

                availableBalance: this.findElement([
                    "#availableBalance",
                    "[data-wallet-available]"
                ]),

                addForm: this.findElement([
                    "#addMoneyForm",
                    "#walletAddForm",
                    "[data-wallet-add-form]"
                ]),

                withdrawForm: this.findElement([
                    "#withdrawMoneyForm",
                    "#walletWithdrawForm",
                    "[data-wallet-withdraw-form]"
                ]),

                addAmount: this.findElement([
                    "#addMoneyAmount",
                    "#addAmount",
                    "[data-wallet-add-amount]"
                ]),

                withdrawAmount: this.findElement([
                    "#withdrawAmount",
                    "#withdrawMoneyAmount",
                    "[data-wallet-withdraw-amount]"
                ]),

                addButton: this.findElement([
                    "#addMoneyButton",
                    "[data-wallet-add-button]"
                ]),

                withdrawButton: this.findElement([
                    "#withdrawButton",
                    "[data-wallet-withdraw-button]"
                ]),

                transactionList: this.findElement([
                    "#transactionHistory",
                    "#walletTransactions",
                    "[data-wallet-transactions]"
                ]),

                requestList: this.findElement([
                    "#walletRequests",
                    "[data-wallet-requests]"
                ]),

                emptyTransactions: this.findElement([
                    "#emptyTransactions",
                    "[data-wallet-empty]"
                ]),

                status: this.findElement([
                    "#walletStatus",
                    "[data-wallet-status]"
                ]),

                refreshButton: this.findElement([
                    "#refreshWallet",
                    "[data-wallet-refresh]"
                ]),

                error: this.findElement([
                    "#walletError",
                    "[data-wallet-error]"
                ]),

                success: this.findElement([
                    "#walletSuccess",
                    "[data-wallet-success]"
                ])
            };
        }


        findElement(selectors) {
            for (const selector of selectors) {
                const element =
                    document.querySelector(selector);

                if (element) {
                    return element;
                }
            }

            return null;
        }


        /* ====================================================
           6. AUTHENTICATION LISTENER
        ==================================================== */

        attachAuthListener() {
            if (!this.auth) return;

            const unsubscribe =
                this.auth.onAuthStateChanged(
                    async (user) => {
                        await this.setCurrentUser(user);
                    }
                );

            this.unsubscribers.push(unsubscribe);
        }


        async setCurrentUser(user) {
            this.stopDataListeners();

            this.currentUser = user || null;

            if (!user) {
                this.balance = 0;
                this.transactions = [];
                this.requests = [];

                this.showLoggedOutState();
                return;
            }

            this.showLoading();

            await this.loadWalletData();
            this.startRealtimeListeners();

            this.hideLoading();
        }


        /* ====================================================
           7. GET USER WALLET REFERENCE
        ==================================================== */

        getWalletReference() {
            if (!this.currentUser) {
                throw new Error(
                    "Please login to access your wallet."
                );
            }

            return this.db
                .collection(
                    WalletConfig.collections.users
                )
                .doc(this.currentUser.uid)
                .collection(
                    WalletConfig.collections.wallet
                )
                .doc("summary");
        }


        getTransactionReference() {
            if (!this.currentUser) {
                throw new Error("User is not logged in.");
            }

            return this.db
                .collection(
                    WalletConfig.collections.users
                )
                .doc(this.currentUser.uid)
                .collection(
                    WalletConfig.collections.transactions
                );
        }


        getRequestReference() {
            if (!this.currentUser) {
                throw new Error("User is not logged in.");
            }

            return this.db
                .collection(
                    WalletConfig.collections.users
                )
                .doc(this.currentUser.uid)
                .collection(
                    WalletConfig.collections.requests
                );
        }


        /* ====================================================
           8. LOAD WALLET DATA
        ==================================================== */

        async loadWalletData() {
            if (!this.currentUser) return;

            try {
                const walletSnapshot =
                    await this.getWalletReference().get();

                if (walletSnapshot.exists) {
                    const walletData =
                        walletSnapshot.data();

                    this.balance =
                        this.toValidAmount(
                            walletData.balance
                        );
                } else {
                    // A missing wallet is displayed as zero.
                    // The client does not create or credit balances.
                    this.balance = 0;
                }

                await Promise.all([
                    this.loadTransactions(),
                    this.loadRequests()
                ]);

                this.renderBalance();

                return {
                    success: true,
                    balance: this.balance
                };

            } catch (error) {
                console.error(
                    "Wallet loading error:",
                    error
                );

                this.showError(
                    this.getErrorMessage(error)
                );

                return {
                    success: false,
                    error: error.message
                };
            }
        }


        /* ====================================================
           9. LOAD TRANSACTIONS
        ==================================================== */

        async loadTransactions() {
            if (!this.currentUser) return;

            try {
                const snapshot =
                    await this.getTransactionReference()
                        .orderBy("createdAt", "desc")
                        .limit(
                            WalletConfig.transactionLimit
                        )
                        .get();

                this.transactions = [];

                snapshot.forEach((document) => {
                    this.transactions.push({
                        id: document.id,
                        ...document.data()
                    });
                });

                this.renderTransactions();

            } catch (error) {
                console.error(
                    "Transaction loading error:",
                    error
                );

                this.showError(
                    "Unable to load transaction history."
                );
            }
        }


        /* ====================================================
           10. LOAD WALLET REQUESTS
        ==================================================== */

        async loadRequests() {
            if (!this.currentUser) return;

            try {
                const snapshot =
                    await this.getRequestReference()
                        .orderBy("createdAt", "desc")
                        .limit(
                            WalletConfig.requestLimit
                        )
                        .get();

                this.requests = [];

                snapshot.forEach((document) => {
                    this.requests.push({
                        id: document.id,
                        ...document.data()
                    });
                });

                this.renderRequests();

            } catch (error) {
                console.error(
                    "Wallet request loading error:",
                    error
                );
            }
        }


        /* ====================================================
           11. REAL-TIME LISTENERS
        ==================================================== */

        startRealtimeListeners() {
            if (!this.currentUser) return;

            try {
                const walletListener =
                    this.getWalletReference()
                        .onSnapshot(
                            (snapshot) => {
                                if (snapshot.exists) {
                                    const data =
                                        snapshot.data();

                                    this.balance =
                                        this.toValidAmount(
                                            data.balance
                                        );
                                } else {
                                    this.balance = 0;
                                }

                                this.renderBalance();
                            },
                            (error) => {
                                console.error(
                                    "Wallet listener error:",
                                    error
                                );
                            }
                        );

                const transactionListener =
                    this.getTransactionReference()
                        .orderBy("createdAt", "desc")
                        .limit(
                            WalletConfig.transactionLimit
                        )
                        .onSnapshot(
                            (snapshot) => {
                                this.transactions =
                                    snapshot.docs.map(
                                        (doc) => ({
                                            id: doc.id,
                                            ...doc.data()
                                        })
                                    );

                                this.renderTransactions();
                            },
                            (error) => {
                                console.error(
                                    "Transaction listener error:",
                                    error
                                );
                            }
                        );

                const requestListener =
                    this.getRequestReference()
                        .orderBy("createdAt", "desc")
                        .limit(
                            WalletConfig.requestLimit
                        )
                        .onSnapshot(
                            (snapshot) => {
                                this.requests =
                                    snapshot.docs.map(
                                        (doc) => ({
                                            id: doc.id,
                                            ...doc.data()
                                        })
                                    );

                                this.renderRequests();
                            },
                            (error) => {
                                console.error(
                                    "Request listener error:",
                                    error
                                );
                            }
                        );

                this.unsubscribers.push(
                    walletListener,
                    transactionListener,
                    requestListener
                );

            } catch (error) {
                console.error(
                    "Realtime listener error:",
                    error
                );
            }
        }


        stopDataListeners() {
            this.unsubscribers.forEach(
                (unsubscribe) => {
                    if (typeof unsubscribe === "function") {
                        unsubscribe();
                    }
                }
            );

            this.unsubscribers = [];
        }


        /* ====================================================
           12. ATTACH FORM EVENTS
        ==================================================== */

        attachEventListeners() {
            if (this.eventListenersAttached) return;

            this.eventListenersAttached = true;

            if (this.elements.addForm) {
                this.elements.addForm.addEventListener(
                    "submit",
                    (event) => {
                        event.preventDefault();
                        this.handleAddMoney();
                    }
                );
            }

            if (this.elements.withdrawForm) {
                this.elements.withdrawForm.addEventListener(
                    "submit",
                    (event) => {
                        event.preventDefault();
                        this.handleWithdraw();
                    }
                );
            }

            if (this.elements.refreshButton) {
                this.elements.refreshButton.addEventListener(
                    "click",
                    () => this.refresh()
                );
            }

            document.addEventListener(
                "click",
                (event) => {
                    const addButton =
                        event.target.closest(
                            "[data-wallet-quick-add]"
                        );

                    if (addButton) {
                        const amount =
                            Number(
                                addButton.dataset.walletQuickAdd
                            );

                        if (this.elements.addAmount) {
                            this.elements.addAmount.value =
                                amount;
                        }
                    }
                }
            );
        }


        /* ====================================================
           13. ADD MONEY REQUEST
        ==================================================== */

        async handleAddMoney() {
            if (this.loading) return;

            if (!this.currentUser) {
                this.showError(
                    "Please login before adding money."
                );
                return;
            }

            const amount =
                Number(
                    this.elements.addAmount
                        ? this.elements.addAmount.value
                        : 0
                );

            const validation =
                this.validateAmount(
                    amount,
                    WalletConfig.minimumAddAmount,
                    WalletConfig.maximumAddAmount
                );

            if (!validation.valid) {
                this.showError(validation.message);
                return;
            }

            const confirmed =
                window.confirm(
                    "Submit an Add Money request for " +
                    this.formatCurrency(amount) +
                    "?"
                );

            if (!confirmed) return;

            this.setButtonLoading(
                this.elements.addButton,
                true,
                "Submitting..."
            );

            try {
                const request =
                    await this.createWalletRequest({
                        type: "add",
                        amount: amount,
                        amountPaise:
                            Math.round(amount * 100),
                        status: "pending"
                    });

                this.showSuccess(
                    "Add Money request submitted. Request ID: " +
                    request.id
                );

                if (this.elements.addForm) {
                    this.elements.addForm.reset();
                }

                await this.loadRequests();

            } catch (error) {
                console.error(error);

                this.showError(
                    this.getErrorMessage(error)
                );

            } finally {
                this.setButtonLoading(
                    this.elements.addButton,
                    false
                );
            }
        }


        /* ====================================================
           14. WITHDRAW REQUEST
        ==================================================== */

        async handleWithdraw() {
            if (this.loading) return;

            if (!this.currentUser) {
                this.showError(
                    "Please login before requesting withdrawal."
                );
                return;
            }

            const amount =
                Number(
                    this.elements.withdrawAmount
                        ? this.elements.withdrawAmount.value
                        : 0
                );

            const validation =
                this.validateAmount(
                    amount,
                    WalletConfig.minimumWithdrawAmount,
                    WalletConfig.maximumWithdrawAmount
                );

            if (!validation.valid) {
                this.showError(validation.message);
                return;
            }

            if (amount > this.balance) {
                this.showError(
                    "Your displayed wallet balance is insufficient."
                );
                return;
            }

            const confirmed =
                window.confirm(
                    "Submit a withdrawal request for " +
                    this.formatCurrency(amount) +
                    "?"
                );

            if (!confirmed) return;

            this.setButtonLoading(
                this.elements.withdrawButton,
                true,
                "Submitting..."
            );

            try {
                const request =
                    await this.createWalletRequest({
                        type: "withdraw",
                        amount: amount,
                        amountPaise:
                            Math.round(amount * 100),
                        status: "pending"
                    });

                this.showSuccess(
                    "Withdrawal request submitted. Request ID: " +
                    request.id
                );

                if (this.elements.withdrawForm) {
                    this.elements.withdrawForm.reset();
                }

                await this.loadRequests();

            } catch (error) {
                console.error(error);

                this.showError(
                    this.getErrorMessage(error)
                );

            } finally {
                this.setButtonLoading(
                    this.elements.withdrawButton,
                    false
                );
            }
        }


        /* ====================================================
           15. CREATE REQUEST DOCUMENT
        ==================================================== */

        async createWalletRequest(data) {
            if (!this.currentUser) {
                throw new Error(
                    "Authentication required."
                );
            }

            const safeData = {
                type: data.type,
                amount: data.amount,
                amountPaise: data.amountPaise,

                status: "pending",

                userId: this.currentUser.uid,

                userEmail:
                    this.currentUser.email || "",

                createdAt:
                    firebase.firestore.FieldValue
                        .serverTimestamp()
            };

            const reference =
                await this.getRequestReference()
                    .add(safeData);

            return {
                success: true,
                id: reference.id
            };
        }


        /* ====================================================
           16. AMOUNT VALIDATION
        ==================================================== */

        validateAmount(
            amount,
            minimum,
            maximum
        ) {
            if (
                !Number.isFinite(amount) ||
                amount <= 0
            ) {
                return {
                    valid: false,
                    message: "Please enter a valid amount."
                };
            }

            if (
                !Number.isInteger(
                    Math.round(amount * 100)
                )
            ) {
                return {
                    valid: false,
                    message: "Invalid amount."
                };
            }

            if (
                Math.round(amount * 100) !==
                amount * 100
            ) {
                return {
                    valid: false,
                    message:
                        "Amount can have maximum 2 decimal places."
                };
            }

            if (amount < minimum) {
                return {
                    valid: false,
                    message:
                        "Minimum amount is " +
                        this.formatCurrency(minimum)
                };
            }

            if (amount > maximum) {
                return {
                    valid: false,
                    message:
                        "Maximum amount is " +
                        this.formatCurrency(maximum)
                };
            }

            return {
                valid: true,
                message: ""
            };
        }


        /* ====================================================
           17. RENDER WALLET BALANCE
        ==================================================== */

        renderBalance() {
            const formatted =
                this.formatCurrency(this.balance);

            if (this.elements.balance) {
                this.elements.balance.textContent =
                    formatted;
            }

            if (this.elements.availableBalance) {
                this.elements.availableBalance.textContent =
                    formatted;
            }

            document.querySelectorAll(
                "[data-wallet-balance]"
            ).forEach((element) => {
                element.textContent = formatted;
            });

            window.dispatchEvent(
                new CustomEvent(
                    "instaCrownWalletBalanceUpdated",
                    {
                        detail: {
                            balance: this.balance
                        }
                    }
                )
            );
        }


        /* ====================================================
           18. RENDER TRANSACTION HISTORY
        ==================================================== */

        renderTransactions() {
            const container =
                this.elements.transactionList;

            if (!container) return;

            container.replaceChildren();

            if (!this.transactions.length) {
                this.renderEmptyState(
                    container,
                    "No transactions found."
                );

                return;
            }

            this.transactions.forEach((transaction) => {
                const item =
                    document.createElement("div");

                item.className =
                    "wallet-transaction-item";

                const title =
                    document.createElement("div");

                title.className =
                    "wallet-transaction-title";

                title.textContent =
                    transaction.title ||
                    this.getTransactionTitle(transaction);

                const details =
                    document.createElement("div");

                details.className =
                    "wallet-transaction-details";

                details.textContent =
                    this.formatDate(
                        transaction.createdAt
                    );

                const amount =
                    document.createElement("div");

                amount.className =
                    "wallet-transaction-amount";

                const value =
                    this.toValidAmount(
                        transaction.amount
                    );

                const isCredit =
                    transaction.type === "credit" ||
                    transaction.type === "add";

                amount.textContent =
                    (isCredit ? "+" : "-") +
                    this.formatCurrency(value);

                amount.classList.add(
                    isCredit
                        ? "wallet-credit"
                        : "wallet-debit"
                );

                item.append(
                    title,
                    details,
                    amount
                );

                container.appendChild(item);
            });
        }


        /* ====================================================
           19. RENDER REQUEST HISTORY
        ==================================================== */

        renderRequests() {
            const container =
                this.elements.requestList;

            if (!container) return;

            container.replaceChildren();

            if (!this.requests.length) {
                this.renderEmptyState(
                    container,
                    "No wallet requests found."
                );

                return;
            }

            this.requests.forEach((request) => {
                const item =
                    document.createElement("div");

                item.className =
                    "wallet-request-item";

                const title =
                    document.createElement("div");

                title.className =
                    "wallet-request-title";

                title.textContent =
                    request.type === "withdraw"
                        ? "Withdrawal Request"
                        : "Add Money Request";

                const amount =
                    document.createElement("div");

                amount.className =
                    "wallet-request-amount";

                amount.textContent =
                    this.formatCurrency(
                        this.toValidAmount(
                            request.amount
                        )
                    );

                const status =
                    document.createElement("span");

                const safeStatus =
                    String(
                        request.status || "pending"
                    ).toLowerCase();

                status.className =
                    "wallet-request-status status-" +
                    safeStatus.replace(
                        /[^a-z0-9-]/g,
                        ""
                    );

                status.textContent =
                    safeStatus.toUpperCase();

                const date =
                    document.createElement("div");

                date.className =
                    "wallet-request-date";

                date.textContent =
                    this.formatDate(request.createdAt);

                item.append(
                    title,
                    amount,
                    status,
                    date
                );

                container.appendChild(item);
            });
        }


        /* ====================================================
           20. EMPTY STATE
        ==================================================== */

        renderEmptyState(container, message) {
            const empty =
                document.createElement("div");

            empty.className =
                "wallet-empty-state";

            empty.textContent = message;

            container.appendChild(empty);
        }


        /* ====================================================
           21. TRANSACTION TITLE
        ==================================================== */

        getTransactionTitle(transaction) {
            const type =
                String(
                    transaction.type || ""
                ).toLowerCase();

            const titles = {
                credit: "Money Added",
                add: "Money Added",
                debit: "Money Withdrawn",
                withdraw: "Money Withdrawn",
                reward: "Reward Received",
                bonus: "Bonus Received",
                refund: "Refund Received"
            };

            return titles[type] ||
                "Wallet Transaction";
        }


        /* ====================================================
           22. FORMAT CURRENCY
        ==================================================== */

        formatCurrency(amount) {
            const value =
                this.toValidAmount(amount);

            try {
                return new Intl.NumberFormat(
                    "en-IN",
                    {
                        style: "currency",
                        currency: WalletConfig.currency,
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }
                ).format(value);

            } catch (error) {
                return (
                    WalletConfig.currencySymbol +
                    value.toFixed(2)
                );
            }
        }


        /* ====================================================
           23. FORMAT DATE
        ==================================================== */

        formatDate(timestamp) {
            if (!timestamp) {
                return "Date unavailable";
            }

            let date;

            if (
                timestamp &&
                typeof timestamp.toDate === "function"
            ) {
                date = timestamp.toDate();

            } else if (
                timestamp instanceof Date
            ) {
                date = timestamp;

            } else {
                date = new Date(timestamp);
            }

            if (Number.isNaN(date.getTime())) {
                return "Date unavailable";
            }

            return date.toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit"
            });
        }


        /* ====================================================
           24. SAFE AMOUNT CONVERSION
        ==================================================== */

        toValidAmount(value) {
            const amount = Number(value);

            if (
                !Number.isFinite(amount) ||
                amount < 0
            ) {
                return 0;
            }

            return Math.round(amount * 100) / 100;
        }


        /* ====================================================
           25. LOADING STATE
        ==================================================== */

        showLoading() {
            this.loading = true;

            this.setWalletStatus("Loading wallet...");
        }


        hideLoading() {
            this.loading = false;

            this.setWalletStatus("Wallet ready");
        }


        setWalletStatus(message) {
            if (this.elements.status) {
                this.elements.status.textContent =
                    message;
            }
        }


        setButtonLoading(
            button,
            loading,
            loadingText = "Please wait..."
        ) {
            if (!button) return;

            if (loading) {
                button.dataset.originalText =
                    button.textContent;

                button.disabled = true;
                button.textContent = loadingText;

            } else {
                button.disabled = false;

                button.textContent =
                    button.dataset.originalText ||
                    button.textContent;
            }
        }


        /* ====================================================
           26. SUCCESS MESSAGE
        ==================================================== */

        showSuccess(message) {
            this.hideError();

            if (this.elements.success) {
                this.elements.success.textContent =
                    message;

                this.elements.success.hidden = false;
            }

            if (
                window.Toast &&
                typeof window.Toast.show === "function"
            ) {
                window.Toast.show(
                    message,
                    "success"
                );
            } else {
                console.log(
                    "[Wallet Success]",
                    message
                );
            }
        }


        /* ====================================================
           27. ERROR MESSAGE
        ==================================================== */

        showError(message) {
            if (this.elements.error) {
                this.elements.error.textContent =
                    message;

                this.elements.error.hidden = false;
            }

            if (
                window.Toast &&
                typeof window.Toast.show === "function"
            ) {
                window.Toast.show(
                    message,
                    "error"
                );
            } else {
                console.error(
                    "[Wallet Error]",
                    message
                );
            }
        }


        hideError() {
            if (this.elements.error) {
                this.elements.error.textContent = "";
                this.elements.error.hidden = true;
            }

            if (this.elements.success) {
                this.elements.success.textContent = "";
                this.elements.success.hidden = true;
            }
        }


        /* ====================================================
           28. LOGGED OUT STATE
        ==================================================== */

        showLoggedOutState() {
            this.balance = 0;

            this.renderBalance();

            if (this.elements.transactionList) {
                this.elements.transactionList.replaceChildren();

                this.renderEmptyState(
                    this.elements.transactionList,
                    "Login to view your transactions."
                );
            }

            if (this.elements.requestList) {
                this.elements.requestList.replaceChildren();

                this.renderEmptyState(
                    this.elements.requestList,
                    "Login to view your wallet requests."
                );
            }

            this.setWalletStatus(
                "Please login to access your wallet."
            );
        }


        /* ====================================================
           29. REFRESH WALLET
        ==================================================== */

        async refresh() {
            if (!this.currentUser) {
                this.showError(
                    "Please login first."
                );

                return;
            }

            this.showLoading();
            this.hideError();

            await this.loadWalletData();

            this.hideLoading();

            this.showSuccess(
                "Wallet refreshed successfully."
            );
        }


        /* ====================================================
           30. ERROR HANDLING
        ==================================================== */

        getErrorMessage(error) {
            const code =
                error && error.code
                    ? error.code
                    : "";

            const messages = {
                "permission-denied":
                    "Permission denied. Please check your account access.",

                "unauthenticated":
                    "Please login to continue.",

                "unavailable":
                    "Service temporarily unavailable. Try again.",

                "resource-exhausted":
                    "Too many requests. Please try later.",

                "network-request-failed":
                    "Network error. Check your internet connection.",

                "failed-precondition":
                    "Wallet service is not configured correctly."
            };

            return messages[code] ||
                (
                    error && error.message
                        ? error.message
                        : "Something went wrong. Please try again."
                );
        }


        /* ====================================================
           31. GET WALLET INFORMATION
        ==================================================== */

        getWalletInfo() {
            return {
                authenticated:
                    Boolean(this.currentUser),

                balance:
                    this.balance,

                currency:
                    WalletConfig.currency,

                transactions:
                    this.transactions.length,

                requests:
                    this.requests.length,

                initialized:
                    this.initialized
            };
        }


        /* ====================================================
           32. CLEANUP
        ==================================================== */

        destroy() {
            this.stopDataListeners();

            this.currentUser = null;

            this.initialized = false;

            console.log(
                "Insta Crown Wallet destroyed."
            );
        }

    }


    /* ========================================================
       33. CREATE WALLET INSTANCE
    ======================================================== */

    const Wallet =
        new InstaCrownWallet();


    /* ========================================================
       34. GLOBAL WALLET ACCESS
    ======================================================== */

    window.InstaCrownWallet = Wallet;

    window.WalletManager = Wallet;


    /* ========================================================
       35. GLOBAL WALLET HELPERS
    ======================================================== */

    window.refreshInstaCrownWallet =
        function () {
            return Wallet.refresh();
        };


    window.getInstaCrownWalletInfo =
        function () {
            return Wallet.getWalletInfo();
        };


    window.getInstaCrownWalletBalance =
        function () {
            return Wallet.balance;
        };


    /* ========================================================
       36. EXPORT CONFIGURATION
    ======================================================== */

    window.InstaCrownWalletConfig =
        Object.freeze(WalletConfig);


})();


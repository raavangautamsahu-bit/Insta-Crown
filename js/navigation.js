
/* =========================================================
   INSTA CROWN — NAVIGATION.JS
   Complete Website Navigation Controller
   ========================================================= */

"use strict";


/* ---------------------------------------------------------
   01. NAVIGATION CONFIGURATION
   --------------------------------------------------------- */


const NavigationConfig = {

    home: "index.html",

    reels: "reels.html",

    posts: "posts.html",

    stories: "stories.html",

    profile: "profile.html",

    about: "about.html",

    faq: "faq.html",

    contact: "contact.html",

    privacy: "privacy.html",

    terms: "terms.html",

    wallet: "wallet.html"

};


/* ---------------------------------------------------------
   02. CURRENT PAGE DETECTION
   --------------------------------------------------------- */

const Navigation = {

    currentPage: "",

    initialize() {

        this.currentPage = this.detectCurrentPage();

        this.setActiveLinks();

        this.initializeDesktopNavigation();

        this.initializeMobileMenu();

        this.initializeBottomNavigation();

        this.initializeNavigationLinks();

        this.initializeBrowserHistory();

    },

    detectCurrentPage() {

        const pathname = window.location.pathname;

        const filename = pathname
            .split("/")
            .filter(Boolean)
            .pop() || "index.html";

        return filename.toLowerCase();

    },


/* ---------------------------------------------------------
   03. ACTIVE NAVIGATION LINK
   --------------------------------------------------------- */

    setActiveLinks() {

        
        const links = document.querySelectorAll(
            [
                "[data-page]",
                ".desktop-navigation a",
                ".main-navigation a",
                ".mobile-bottom-navigation a",
                ".bottom-navigation a"
            ].join(", ")
        );
       

        links.forEach(link => {

            const target = link.dataset.page;

            const href = link.getAttribute("href");

            const pageName = target || (
                href ? href.split("/").pop().split("?")[0] : ""
            );

            const isActive =
                pageName.toLowerCase() === this.currentPage;

            link.classList.toggle("active", isActive);

            if (isActive) {

                link.setAttribute("aria-current", "page");

            } else {

                link.removeAttribute("aria-current");

            }

        });

    },


/* ---------------------------------------------------------
   04. DESKTOP NAVIGATION
   --------------------------------------------------------- */

    initializeDesktopNavigation() {

        
        const desktopLinks = document.querySelectorAll(
            [
                "#desktopNavigation a",
                ".desktop-navigation a",
                "#mainNavigation a",
                ".main-navigation a"
            ].join(", ")
        );
       

        desktopLinks.forEach(link => {

            link.addEventListener("click", () => {

                desktopLinks.forEach(item => {
                    item.classList.remove("active");
                });

                link.classList.add("active");

            });

        });

    },


/* ---------------------------------------------------------
   05. MOBILE MENU
   --------------------------------------------------------- */
initializeMobileMenu() {

    const menuButton = document.querySelector(
        "#mobileMenuButton, #menuToggle, #mobileMenuToggle"
    );

    const navigationPanel =
        document.getElementById("mobileNavigationPanel") ||
        document.getElementById("mainNavigation") ||
        document.getElementById("desktopNavigation");

    if (!menuButton || !navigationPanel) return;

    const closeMenu = () => {

        menuButton.classList.remove("active");

        menuButton.setAttribute("aria-expanded", "false");

        menuButton.setAttribute(
            "aria-label",
            "Open navigation menu"
        );

        navigationPanel.classList.remove("open");

        navigationPanel.setAttribute("aria-hidden", "true");

    };

    menuButton.setAttribute("aria-expanded", "false");

    navigationPanel.setAttribute("aria-hidden", "true");

    menuButton.addEventListener("click", event => {

        event.stopPropagation();

        const isOpen = !navigationPanel.classList.contains("open");

        menuButton.classList.toggle("active", isOpen);

        navigationPanel.classList.toggle("open", isOpen);

        menuButton.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

        menuButton.setAttribute(
            "aria-label",
            isOpen ? "Close navigation menu" : "Open navigation menu"
        );

        navigationPanel.setAttribute(
            "aria-hidden",
            String(!isOpen)
        );

    });

    navigationPanel.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", closeMenu);

    });

    document.addEventListener("click", event => {

        const clickedInside =
            navigationPanel.contains(event.target) ||
            menuButton.contains(event.target);

        if (!clickedInside) {
            closeMenu();
        }

    });

},
    

/* ---------------------------------------------------------
   06. MOBILE BOTTOM NAVIGATION
   Only Home, Reels and About
   --------------------------------------------------------- */

    initializeBottomNavigation() {

        const bottomLinks = document.querySelectorAll(
            ".mobile-bottom-navigation a, .bottom-navigation a"
        );

        bottomLinks.forEach(link => {

            link.addEventListener("click", () => {

                bottomLinks.forEach(item => {
                    item.classList.remove("active");
                });

                link.classList.add("active");

            });

        });

    },


/* ---------------------------------------------------------
   07. ALL INTERNAL NAVIGATION LINKS
   --------------------------------------------------------- */

    initializeNavigationLinks() {

        const internalLinks = document.querySelectorAll(
            "a[data-page]"
        );

        internalLinks.forEach(link => {

            link.addEventListener("click", event => {

                const targetPage = link.getAttribute("href");

                if (!targetPage) return;

                if (
                    targetPage.startsWith("#") ||
                    targetPage.startsWith("http") ||
                    link.target === "_blank"
                ) {
                    return;
                }

                console.log(
                    "Insta Crown navigation:",
                    targetPage
                );

            });

        });

    },


/* ---------------------------------------------------------
   08. NAVIGATE TO PAGE
   --------------------------------------------------------- */

    goTo(page) {

        if (!page) return;

        const destination = NavigationConfig[page] || page;

        if (destination.startsWith("#")) {

            const element = document.querySelector(destination);

            if (element) {

                element.scrollIntoView({
                    behavior: "smooth"
                });

            }

            return;

        }

        if (destination.startsWith("http")) {

            window.location.href = destination;

            return;

        }

        window.location.href = destination;

    },


/* ---------------------------------------------------------
   09. NAVIGATION WITH PAGE TRANSITION
   --------------------------------------------------------- */

    async navigateWithTransition(url) {

        if (!url) return;

        if (
            url.startsWith("http") &&
            !url.startsWith(window.location.origin)
        ) {

            window.location.href = url;

            return;

        }

        const page = document.querySelector("main") ||
            document.querySelector(".page-content");

        if (!page) {

            window.location.href = url;

            return;

        }

        page.classList.add("page-exit");

        setTimeout(() => {

            window.location.href = url;

        }, 250);

    },


/* ---------------------------------------------------------
   10. BROWSER BACK AND FORWARD SUPPORT
   --------------------------------------------------------- */

    initializeBrowserHistory() {

        window.addEventListener("popstate", () => {

            this.currentPage = this.detectCurrentPage();

            this.setActiveLinks();

        });

    },


/* ---------------------------------------------------------
   11. CLOSE MOBILE MENU
   --------------------------------------------------------- */

    
            closeMobileMenu() {

    const menuButton = document.querySelector(
        "#mobileMenuButton, #menuToggle, #mobileMenuToggle"
    );

    const panel =
        document.getElementById("mobileNavigationPanel") ||
        document.getElementById("mainNavigation") ||
        document.getElementById("desktopNavigation");

    if (menuButton) {

        menuButton.classList.remove("active");

        menuButton.setAttribute("aria-expanded", "false");

        menuButton.setAttribute(
            "aria-label",
            "Open navigation menu"
        );

    }

    if (panel) {

        panel.classList.remove("open");

        panel.setAttribute("aria-hidden", "true");

    }

},


/* ---------------------------------------------------------
   12. REFRESH ACTIVE NAVIGATION
   --------------------------------------------------------- */

    refresh() {

        this.currentPage = this.detectCurrentPage();

        this.setActiveLinks();

    }

};


/* ---------------------------------------------------------
   13. GLOBAL NAVIGATION FUNCTIONS
   --------------------------------------------------------- */

window.Navigation = Navigation;

window.goToPage = (page) => {
    Navigation.goTo(page);
};

window.closeMobileMenu = () => {
    Navigation.closeMobileMenu();
};


/* ---------------------------------------------------------
   14. INITIALIZE NAVIGATION
   --------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {

    Navigation.initialize();

});


/* =========================================================
   END OF INSTA CROWN NAVIGATION.JS
   ========================================================= */


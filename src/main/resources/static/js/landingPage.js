class LandingPageAPP {
    constructor() {
        this.initializeApp();
    }

    async initializeApp() {
        this.setupEventListeners();
        this.checkIfLoggedIn();
    }

    setupEventListeners() {
        document.querySelector('.logInButton')
            .addEventListener('click', () => this.goToAuthPage());
        document.querySelector('.signUpButton')
            .addEventListener('click', () => this.goToAuthPage());
    }

    checkIfLoggedIn() {
        const prevLog = this.getCookie("cachedEmail")
        if(prevLog === ""){
        } else {
            window.location.replace("/recipe/overviewer");
        }
    }

    getCookie(name) {
        const decodedCookies = decodeURIComponent(document.cookie);
        const cookieArr = decodedCookies.split(';');
        for (let i = 0; i < cookieArr.length; i++) {
            let c = cookieArr[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name + "=") === 0) {
                return c.substring(name.length + 1, c.length);
            }
        }
        return "";
    }

    goToAuthPage() {
        window.location.href = "/recipe/fauxlogin";
    }
}

// Initialize the application
const app = new LandingPageAPP();
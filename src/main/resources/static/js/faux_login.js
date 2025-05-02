class FauxLoginAPP {
    constructor() {
        this.initializeApp();
    }

    async initializeApp() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('loginButton')
            .addEventListener('click', () => this.saveEmail());
    }

    saveEmail() {
        const emailFieldValue = document.getElementById('usersEmailField').value.trim();
        this.setCookie("cachedEmail", emailFieldValue)
    }

    setCookie(name, value) {
        const encodedValue = encodeURIComponent(value);
        document.cookie = `${name}=${encodedValue};path=/`;
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
}

// Initialize the application
const app = new FauxLoginAPP();
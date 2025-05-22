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
        document.querySelector('.makeMealButton')
            .addEventListener('click', () => this.goToMealMakerPage());
        document.querySelector('.makePlanButton')
            .addEventListener('click', () => this.goToPlanMakerPage());
        document.querySelector('.setPreferenceButton')
            .addEventListener('click', () => this.goToSetPreferencePage());
        document.querySelector('.settingsButton')
            .addEventListener('click', () => this.goToSettingsPage());
    }

    goToMealMakerPage(){
        window.location.href = "/recipe/generator";
    }

    goToPlanMakerPage(){
        window.location.href = "/recipe/plan";
    }

    goToSetPreferencePage(){
        window.location.href = "/recipe/preferences";
    }

    goToSettingsPage(){
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
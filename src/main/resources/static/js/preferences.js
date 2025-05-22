class RecipeApp {
    constructor() {
        this.initializeApp();
    }

    async initializeApp() {
        this.checkIfPreferenceExists();
        this.setupEventListeners();
    }

    checkIfPreferenceExists() {
        const preferenceString = this.getCookie("preferenceString")
        if(preferenceString === ""){
        } else {
            const container = document.getElementById('existingPreference');
            container.innerHTML = "<h1> This is your already saved preference: "+preferenceString+"</h1>"
        }
    }

    setupEventListeners() {
        document.getElementById('saveButton')
            .addEventListener('click', () => this.savePreferences());
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

    savePreferences() {
        const preferenceFieldValue = document.getElementById('preferenceFieldValue').value.trim();
        document.getElementById('preferenceFieldValue').value = ""
        this.setCookie("preferenceString", preferenceFieldValue)
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
const app = new RecipeApp();
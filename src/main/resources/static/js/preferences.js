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
    }

    savePreferences() {
        const preferenceFieldValue = document.getElementById('preferenceFieldValue').value.trim();
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
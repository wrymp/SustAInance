class OverviewerApp {
    constructor() {
        this.initializeApp();
        this.setupEventListeners()
    }

    initializeApp() {
        this.checkIfInfoExists();
    }

    setupEventListeners() {
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

    checkIfInfoExists() {
        const preferenceString = this.getCookie("preferenceString")
        const planString = this.getCookie("planString")
        const cachedEmail = this.getCookie("cachedEmail")
        console.log(preferenceString)
        console.log(planString)
        console.log(cachedEmail)
        if(preferenceString === ""){
        } else {
            const container = document.getElementById('preferencesDiv');
            container.innerHTML = "<h1> This is your already saved preference: "+preferenceString+"</h1>"
        }
        if(planString === ""){
        } else {
            const container = document.getElementById('plansDiv');
            container.innerHTML = "<h1> This is your already saved meal plan: "+planString+"</h1>"
        }
        if(cachedEmail === ""){
        } else {
            const container = document.getElementById('greetingDiv');
            container.innerHTML = "Hello, "+cachedEmail+"</h1>"
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
}

// Initialize the application
const app = new OverviewerApp();
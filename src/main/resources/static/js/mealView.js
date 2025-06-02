class mealView {
    constructor() {
        this.initializeApp();
        this.setupEventListeners()
    }

    initializeApp() {
        this.setUpViews();
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
        document.querySelector('.backButton')
            .addEventListener('click', () => this.goBack());
        document.querySelector('.addToFavsButton')
            .addEventListener('click', () => this.addToFaves());
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

    setUpViews() {
        const upperContainer = document.getElementById('mealUtils');
        upperContainer.innerHTML = `
            <button id="back" class="backButton">
                Go back
            </button>
            
            <button id="add_to_favs" class="addToFavsButton"> 
                Save to Faves
            </button>
        `

        const mealString = this.getCookie("currMeal");
        const lowerContainer = document.getElementById('mealInfo');
        lowerContainer.textContent = mealString
    }

    addToFaves() {
        return undefined;
    }

    goBack() {
        window.location.href = "/recipe/overviewer"
    }
}

// Initialize the application
const app = new mealView();
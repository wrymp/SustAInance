class MealPlanApp {
    constructor() {
        this.initializeApp();
    }

    async initializeApp() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('generateMealPlan')
            .addEventListener('click', () => this.generateMealPlan());
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

    async generateMealPlan() {
        const FoodTypePreferenceString = this.getCookie("preferenceString")
        const timeframeString =  document.getElementById('timeframe').value;
        const PlanPreferenceString =  document.getElementById('timeframe').value;
        const recipient = this.getCookie("cachedEmail")

        const mealPlanRequest = {
            foodPreferenceString: FoodTypePreferenceString,
            planPreferenceString: PlanPreferenceString,
            timeframe: timeframeString,
            recipient: recipient
        };

        try {
            const response = await fetch('/api/recipe/generateMealPlan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(mealPlanRequest)
            });

            const mealPlanString = await response.text();
            this.setCookie("planString", mealPlanString);
            this.updateResult(mealPlanString);
        } catch (error) {
            console.error('Error adding ingredient:', error);
        }


        return undefined;
    }

    setCookie(name, value) {
        const encodedValue = encodeURIComponent(value);
        document.cookie = `${name}=${encodedValue};path=/`;
    }

    updateResult(newValue) {
        const container = document.getElementById("resultContainer")
        container.innerHTML = `
        <div class="plan_content">
            <pre>${newValue}</pre>
        </div>
    `;
    }
}

// Initialize the application
const app = new MealPlanApp();
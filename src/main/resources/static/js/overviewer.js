class OverviewerApp {
    constructor() {
        this.initializeApp();
    }

    initializeApp() {
        this.checkIfInfoExists();
    }

    checkIfInfoExists() {
        const preferenceString = this.getCookie("preferenceString")
        const planString = this.getCookie("planString")
        console.log(preferenceString)
        console.log(planString)
        if(preferenceString === ""){
        } else {
            const container = document.getElementById('existingPreference');
            container.innerHTML = "<h1> This is your already saved preference: "+preferenceString+"</h1>"
        }
        if(planString === ""){
        } else {
            const container = document.getElementById('existingPlan');
            container.innerHTML = "<h1> This is your already saved meal plan: "+planString+"</h1>"
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
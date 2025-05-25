class authAPP {
    constructor() {
        this.initializeApp();
    }

    async initializeApp() {
        this.addRelevantFieldsAndButtons();
        this.setupEventListeners();
    }

    addRelevantFieldsAndButtons() {
        const params = new URLSearchParams(window.location.search);
        const type = params.get('authType');

        const container = document.getElementById('dataBox');

        if(type === 'logIn') {
            container.innerHTML = `
            <input type="text" id="emailField" placeholder="Your Email:"/>
            <input type="password" id="passField" placeholder="Password"/>
            <button id="logInWithCredentials"> LOG IN </button>
            <div class="orText"> OR </div>
            <div id="g_id_onload"
                 data-client_id="CLIENT_ID"
                 data-context="signin"
                 data-callback="handleCredentialResponse"
                 data-auto_prompt="false">
            </div>
            <div class="g_id_signin"
                 data-type="standard"
                 data-shape="rectangular"
                 data-theme="outline"
                 data-text="sign_in_with"
                 data-size="large">
            </div>`
        } else {
            container.innerHTML = `
            <input type="text" id="emailField" placeholder="Your Email:"/>
            <input type="password" id="passField" placeholder="Password"/>
            <input type="password" id="passAgainField" placeholder="Password again"/>
            <button id="signUpWithCredentials">Sign Up</button>
            <div class="orText"> OR </div>
            <div id="g_id_onload"
                 data-client_id="YOUR_CLIENT_ID"
                 data-callback="handleCredentialResponse"
                 data-auto_prompt="false">
            </div>
            <div class="g_id_signin"
                 data-type="standard"
                 data-shape="rectangular"
                 data-theme="outline"
                 data-text="signup_with"
                data-size = "large" >
            </div>
            `
        }
    }

    setupEventListeners() {
        document.getElementById('signUpWithCredentials')
            .addEventListener('click', () => this.signUp());
        document.getElementById('logInWithCredentials')
            .addEventListener('click', () => this.logIn());

    }

    handleCredentialResponse(response) {
        console.log("Encoded JWT ID token: " + response.credential);
        // You can send this JWT to your backend to verify it and log the user in
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

    signUp() {
        return undefined;
    }

    logIn() {
        return undefined;
    }
}

// Initialize the application
const app = new authAPP();
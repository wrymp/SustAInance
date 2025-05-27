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
                 data-client_id=""
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
                 data-client_id=""
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

window.handleCredentialResponse = function(response) {
    console.log("Encoded JWT ID token: " + response.credential);

    // Decode the JWT payload
    const base64Url = response.credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join('')));

    console.log("Decoded payload:", payload);
    if (response && response.credential) {
            // Name: ${payload.name}
            // Email: ${payload.email}
            // Picture: ${payload.picture}`;
            app.setCookie("cachedEmail", payload.email)
            window.location.href = "/recipe/overviewer"
    }
};

// Initialize the application
const app = new authAPP();
class authAPP {
    constructor() {
        this.initializeApp().then(r => {});
    }

    async initializeApp() {
        await this.addRelevantFieldsAndButtons();
    }

    async getGoogleKey() {
        let key = "yabbadabbadoo";
        try {
            const response = await fetch('/api/auth/getGoogleKey', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });
            const data = await response.json();
            key = data.key;
            console.log("Google Key:", key);
        } catch (error) {
            console.error("Failed to fetch Google Key:", error);
        }
        return key;
    }



    async addRelevantFieldsAndButtons() {
        const params = new URLSearchParams(window.location.search);
        const type = params.get('authType');

        const container = document.getElementById('dataBox');
        const key = await this.getGoogleKey();

        let html = `
        <div id="errorText"></div>
        <input type="text" id="emailField" placeholder="Your Email:"/>
        <input type="password" id="passField" placeholder="Password"/>
        `;

        if (type === 'logIn') {
            html += `
                <button id="logInWithCredentials"> LOG IN </button>
                <div class="orText"> OR </div>`;
        } else {
            html += `
                <input type="password" id="passAgainField" placeholder="Password again"/>
                <button id="signUpWithCredentials">Sign Up</button>
                <div class="orText"> OR </div>`;
        }

        html += `
            <div class="g_id_signin"></div>`;

        container.innerHTML = html;

        if (type === 'logIn') {
            document.getElementById('logInWithCredentials')
                .addEventListener('click', () => this.logIn());
        } else {
            document.getElementById('signUpWithCredentials')
                .addEventListener('click', () => this.signUp());
        }

        if (window.google && window.google.accounts && window.google.accounts.id) {
            window.google.accounts.id.initialize({
                client_id: key,
                callback: handleCredentialResponse,
            });
            window.google.accounts.id.renderButton(
                document.querySelector(".g_id_signin"),
                {
                    type: "standard",
                    theme: "outline",
                    size: "large",
                    shape: "rectangular",
                    text: type === "logIn" ? "sign_in_with" : "signup_with"
                }
            );
        } else {
            console.error("Google script not loaded");
        }
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

    async signUp(){
        document.getElementById('errorText').value = ''
        const givenEmail = document.getElementById('emailField').value.trim();
        const givenPassword = document.getElementById('passField').value.trim();
        const givenPasswordAgain = document.getElementById('passAgainField').value.trim();

        if (givenPassword !== givenPasswordAgain) {
            document.getElementById('errorText').textContent = "Passwords Don't match"
            return
        }

        const request = {
            email: givenEmail,
            password: givenPassword
        };

        try {
            const response = await fetch('/api/auth/registerUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(request)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Sign Up success:', result.message);
                this.setCookie("cachedEmail", givenEmail)
                window.location.href = "/recipe/overviewer"
            } else {
                console.log('Unexpected error:', response.status);
                document.getElementById('errorText').textContent = await response.text()
            }
        } catch (error) {
            console.error('Error adding ingredient:', error);
        }
    }

    async logIn(){
        document.getElementById('errorText').textContent = ''
        const givenEmail = document.getElementById('emailField').value.trim();
        const givenPassword = document.getElementById('passField').value.trim();

        const request = {
            email: givenEmail,
            password: givenPassword
        };

        try {
            const response = await fetch('/api/auth/attemptLogIn', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(request)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Login success:', result.message);
                this.setCookie("cachedEmail", givenEmail)
                window.location.href = "/recipe/overviewer"

            } else if (response.status === 401) {
                console.log('Incorrect password');
                document.getElementById('errorText').textContent = await response.text()
            } else if (response.status === 409) {
                console.log('Email not registered');
                document.getElementById('errorText').textContent = await response.text()
            } else {
                console.log('Unexpected error:', response.status);
                document.getElementById('errorText').textContent = await response.text()
            }
        } catch (error) {
            console.error('Error adding ingredient:', error);
        }
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
    class LandingPageAPP {
        constructor() {
            console.log("All cookies:", document.cookie);
            this.initializeApp();
        }

        async initializeApp() {
            this.setupEventListeners();
            await this.checkIfLoggedIn();
        }

        setupEventListeners() {
            document.querySelector('.logInButton')
                .addEventListener('click', () => this.goToAuthPage('logIn'));
            document.querySelector('.signUpButton')
                .addEventListener('click', () => this.goToAuthPage('signUp'));
        }

        async checkIfLoggedIn() {
            const token = this.getCookie("cachedToken");
            if (token === "") return;

            try {
                const request = {
                    token: token
                };

                const res = await fetch('/api/auth/attemptTokenAuth', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(request)
                });

                if (res.ok) {
                    const data = await res.json();
                    this.setCookie("cachedEmail", data.email);
                    window.location.replace("/recipe/overviewer");
                } else {
                    document.cookie = "cachedToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                }
            } catch (err) {
                console.error("Error validating token:", err);
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

        goToAuthPage(authType) {
            window.location.href = "/recipe/authPage?authType=" + encodeURIComponent(authType);
        }
    }

    // Initialize the application
    const app = new LandingPageAPP();
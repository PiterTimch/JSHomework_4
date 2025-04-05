const registerForm = document.getElementById("loginForm");

function focusInput(input) {
    console.log(input);
    input.style.border = "1px solid red";
}

function showMessage(jsonMessage) {
    const obj = jsonMessage.response.data.errors;
    const errors = Object.keys(obj).map((key) => [key, obj[key]]);

    console.log(typeof errors);

    document.querySelectorAll(".error-message").forEach(el => el.remove());
    document.querySelectorAll("input, label").forEach(el => el.style = "");

    errors.forEach(error => {
        document.getElementById("errorMessage").innerText = error[1];
    });
}

function processRegistration(e) {
    e.preventDefault();

    const loginData = {
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
    };

    axios.post(`${window.API_BASE_URL}/api/Account/login`, loginData, {
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(response => {
            console.log("Success:", response.data.token);
            localStorage.token = response.data.token;
            location.href = "/";
        })
        .catch(error => {
            showMessage(error);
        });
}

registerForm.onsubmit = processRegistration;
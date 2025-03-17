const registerForm = document.getElementById("registerForm");

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
        let inputElement;

        if (error[0] === "photo") {
            inputElement = document.getElementById("fileLabel");
        } else {
            inputElement = document.getElementById(error[0]);
        }

        if (inputElement) {
            focusInput(inputElement);

            const parentDiv = inputElement.closest("div"); // Знаходимо батьківський div

            if (parentDiv && (!parentDiv.nextElementSibling || !parentDiv.nextElementSibling.classList.contains("error-message"))) {
                const errorMessage = document.createElement("span");
                errorMessage.className = "error-message text-red-500 text-sm mt-1 block";
                errorMessage.innerText = error[1];

                parentDiv.insertAdjacentElement("afterend", errorMessage);
            }

        }
    });
}

function processRegistration(e) {
    e.preventDefault();

    const user = {
        email: document.getElementById("email").value,
        firstName: document.getElementById("firstName").value,
        secondName: document.getElementById("secondName").value,
        photo: document.getElementById("formPhoto").src,
        phone: document.getElementById("phone").value,
        password: document.getElementById("password").value,
        confirmPassword: document.getElementById("confirmPassword").value
    };

    axios.post("https://goose.itstep.click/api/Account/register", user, {
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then(response => {
            console.log("Success:", response.data);
            localStorage.currentUser = JSON.stringify(user);
            location.href = "/pages/welcomePage.html";
        })
        .catch(error => {
            showMessage(error);
        });
}

registerForm.onsubmit = processRegistration;
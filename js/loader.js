const loadDOM = (path) => {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", path, false);
    xhr.send();
    document.write(xhr.response);

    if (path.includes("header")) {
        document.addEventListener("DOMContentLoaded", () => {
            toggleUserMenu();
        });
    }
};

const getDOM = (path) => {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", path, false);
    xhr.send();
    return xhr.response;
};

function toggleUserMenu() {
    const token = localStorage.getItem("token");
    const anonimMenu = document.getElementById("anonimMenu");
    const loginMenu = document.getElementById("loginMenu");

    if (token) {
        anonimMenu.classList.add("hidden");
        loginMenu.classList.remove("hidden");
    } else {
        anonimMenu.classList.remove("hidden");
        loginMenu.classList.add("hidden");
    }
}

//window.API_BASE_URL = "https://goose.itstep.click";
window.API_BASE_URL = "http://localhost:5227";
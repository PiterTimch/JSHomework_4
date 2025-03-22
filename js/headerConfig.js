document.addEventListener("DOMContentLoaded", async () => {
    function setupDropdown(menuButtonId, menuId) {
        const menuButton = document.getElementById(menuButtonId);
        const menu = document.getElementById(menuId);

        if (!menuButton || !menu) return;

        menuButton.addEventListener("click", () => {
            menu.classList.toggle("show");
        });

        document.addEventListener("click", (e) => {
            if (!menuButton.contains(e.target) && !menu.contains(e.target)) {
                menu.classList.remove("show");
            }
        });
    }

    setupDropdown("anonimMenuButton", "anonimPopup");
    setupDropdown("userMenuButton", "userPopup");
    setupDropdown("adminMenuButton", "adminPopup");

    const loginMenu = document.getElementById("loginMenu");
    const anonimMenu = document.getElementById("anonimMenu");
    const adminMenu = document.getElementById("adminMenu");

    const profileIcon = document.getElementById("profileIcon");

    async function loadUserData() {
        const token = localStorage.getItem("token");

        if (!token) {
            console.log("Invalid token");
            return;
        }

        try {
            const user = jwt_decode(token);

            localStorage.setItem("user", JSON.stringify(user));

            if (user.roles == "admin") {

                anonimMenu.classList.add("hidden");
                loginMenu.classList.add("hidden");
                adminMenu.classList.remove("hidden");
                return;
            }
            else if (user.image) {
                profileIcon.src = `https://goose.itstep.click/images/100_${user.image}`;
            }

            loginMenu.classList.remove("hidden");
            anonimMenu.classList.add("hidden");

        } catch (error) {
            console.error("Error decoding token:", error);
        }
    }

    await loadUserData();
});

function logout() {
    localStorage.clear();
    window.location.href = "/";
}
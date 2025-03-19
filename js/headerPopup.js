const setupDropdown = () => {
    const userIcon = document.getElementById("user-icon");
    const dropdownMenu = document.getElementById("user-dropdown");

    userIcon.addEventListener("click", () => {
        dropdownMenu.classList.toggle("hidden");
    });

    document.addEventListener("click", (event) => {
        if (!userIcon.contains(event.target) && !dropdownMenu.contains(event.target)) {
            dropdownMenu.classList.add("hidden");
        }
    });
};
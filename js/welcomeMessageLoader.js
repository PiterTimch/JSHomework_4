const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const userPhone = document.getElementById("userPhone");
const userPhoto = document.getElementById("userPhoto");

async function waitForUserData() {
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            const user = localStorage.getItem("user");
            if (user) {
                clearInterval(interval);
                resolve(JSON.parse(user));
            }
        }, 100);
    });
}

async function onloadProcess() {
    const user = await waitForUserData();

    userName.innerText = `${user.firstName} ${user.secondName}`;
    userEmail.innerText = user.email;
    userPhone.innerText = user.phone;
    userPhoto.src = `https://goose.itstep.click/images/${user.photo}`;
}

window.onload = onloadProcess;

const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const userPhone = document.getElementById("userPhone");
const userPhoto = document.getElementById("userPhoto");

function onloadProcess() {
    if (!localStorage.currentUser) return;

    const user = JSON.parse(localStorage.currentUser);

    userName.innerText = `${user.firstName} ${user.secondName}`;
    userEmail.innerText = user.email;
    userPhone.innerText = user.phone;
    userPhoto.src = user.photo;
}

window.onload = onloadProcess;

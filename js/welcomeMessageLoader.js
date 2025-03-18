const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const userPhone = document.getElementById("userPhone");
const userPhoto = document.getElementById("userPhoto");

function onloadProcess() {
    const token = localStorage.getItem("token");
    if (token) {
        const decoded = jwt_decode(token);
        console.log(decoded);
    } else {
        console.log("Токен не знайдено");
    }

    axios.get("https://goose.itstep.click/api/Account/profile", {
        headers: {
            'accept': '*/*',
            'Authorization': `Bearer ${token}`
        }
    })
    .then(response => {
        console.log("Success:", response.data);
        const user = response.data;
        userName.innerText = `${user.firstName} ${user.secondName}`;
        userEmail.innerText = user.email;
        userPhone.innerText = user.phone;
        userPhoto.src = `https://goose.itstep.click/images/${user.photo}`;
    })
    .catch(error => {
        console.error("Error:", error);
    });

    //const user = JSON.parse(localStorage.currentUser);

    //userName.innerText = `${user.firstName} ${user.secondName}`;
    //userEmail.innerText = user.email;
    //userPhone.innerText = user.phone;
    //userPhoto.src = user.photo;
}

window.onload = onloadProcess;

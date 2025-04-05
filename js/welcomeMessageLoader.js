const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const userPhone = document.getElementById("userPhone");
const userPhoto = document.getElementById("userPhoto");
const loading = document.getElementById("loading-overlay");

function getUserDataFromServer() {
    const token = localStorage.getItem("token");

    return axios.get(`${window.API_BASE_URL}/api/Account/profile`, {
        headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "*/*"
        }
    }).then(response => response.data)
        .catch(error => {
            console.error("Error fetching user data:", error);
        });
}

function onloadProcess() {

    getUserDataFromServer().then(user => {
        if (!user) return;

        userName.innerText = `${user.firstName} ${user.secondName}`;
        userEmail.innerText = user.email;
        userPhone.innerText = user.phone;
        userPhoto.src = `${window.API_BASE_URL}/images/800_${user.photo}`;

        loading.classList.add("hidden");
    });
}

window.onload = onloadProcess;

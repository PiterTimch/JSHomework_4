let categoryForm;
let errorMessage;
let progressBar;
let progressContainer;

function generateSlug() {
    const title = document.getElementById("title").value;
    document.getElementById("urlSlug").value = getSlug(title, { lang: 'uk' });
}

function showMessage(jsonMessage) {
    const error = jsonMessage.response.data.error;
    errorMessage.innerText = error;
}

function startProgressBar() {
    progressContainer.classList.remove("hidden");
    let progress = 0;
    const interval = setInterval(() => {
        progress += 5;
        if (progress >= 95) {
            clearInterval(interval);
        }
        progressBar.style.width = progress + "%";
    }, 200);
    return interval;
}

function processSubmit(e) {
    e.preventDefault();

    const category = {
        title: document.getElementById("title").value,
        priority: document.getElementById("priority").value,
        urlSlug: document.getElementById("urlSlug").value,
        image: document.getElementById("formPhoto").src
    };

    const progressInterval = startProgressBar();

    axios.post("https://goose.itstep.click/api/Categories/add", category, {
        headers: { "Content-Type": "application/json" }
    })
        .then(response => {
            clearInterval(progressInterval);
            progressBar.style.width = "100%";
            setTimeout(() => {
                loadToContentFrame("/pages/adminPages/categoriesEdit.html");
            }, 300);
        })
        .catch(error => {
            clearInterval(progressInterval);
            progressBar.style.width = "0%";
            progressContainer.classList.add("hidden");
            showMessage(error);
        });
}

function loadCategoryCreateForm() {
    categoryForm = document.getElementById("categoryForm");
    errorMessage = document.getElementById("errorMessage");
    progressBar = document.getElementById("progressBar");
    progressContainer = document.getElementById("progressContainer");

    categoryForm.onsubmit = processSubmit;
}


loadDOM("/partials/photoCropperModal.html");
let categoryFormEdit;
let errorMessageEdit;
let progressBarEdit;
let progressContainerEdit;
let categoryId;
let loadedCategory;

function generateSlugEdit() {
    const title = document.getElementById("titleEdit").value;
    document.getElementById("urlSlugEdit").value = getSlug(title, { lang: 'uk' });
}

function showMessageEdit(jsonMessage) {
    const error = jsonMessage.response.data.error;
    errorMessageEdit.innerText = error;
}

function startProgressBarEdit() {
    progressContainerEdit.classList.remove("hidden");
    let progress = 0;
    const interval = setInterval(() => {
        progress += 5;
        if (progress >= 95) {
            clearInterval(interval);
        }
        progressBarEdit.style.width = progress + "%";
    }, 200);
    return interval;
}

async function fetchImageAsBase64(imageUrl) {
    try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onload = () => resolve(reader.result.split(",")[1]);
            reader.onerror = (error) => reject(error);
        });
    } catch (error) {
        console.error("Error fetching image as Base64:", error);
        return null;
    }
}

async function processSubmitEdit(e) {
    e.preventDefault();

    const currentImageSrc = document.getElementById("formPhotoEdit").src;
    let imageData = currentImageSrc;

    if (loadedCategory && currentImageSrc === `${window.API_BASE_URL}/images/200_${loadedCategory.image}`) {
        imageData = await fetchImageAsBase64(currentImageSrc);
    }

    const category = {
        id: categoryId,
        title: document.getElementById("titleEdit").value,
        priority: document.getElementById("priorityEdit").value,
        urlSlug: document.getElementById("urlSlugEdit").value,
        image: imageData
    };

    const progressInterval = startProgressBarEdit();

    axios.put(`${window.API_BASE_URL}/api/Categories/edit`, category, {
        headers: { "Content-Type": "application/json" }
    })
        .then(response => {
            clearInterval(progressInterval);
            progressBarEdit.style.width = "100%";
            setTimeout(() => {
                location.href = "/pages/adminPages/categoriesView";
            }, 300);
        })
        .catch(error => {
            clearInterval(progressInterval);
            progressBarEdit.style.width = "0%";
            progressContainerEdit.classList.add("hidden");
            showMessageEdit(error);
        });
}

function loadUserToEditInputs() {
    axios.get(`${window.API_BASE_URL}/api/Categories/get/${categoryId}`)
        .then(response => {
            loadedCategory = response.data;
            document.getElementById("titleEdit").value = loadedCategory.title;
            document.getElementById("priorityEdit").value = loadedCategory.priority;
            document.getElementById("urlSlugEdit").value = loadedCategory.urlSlug;
            document.getElementById("formPhotoEdit").classList.remove("hidden");
            document.getElementById("formPhotoEdit").src = `${window.API_BASE_URL}/images/200_${loadedCategory.image}`;

            document.getElementById("loadingScreen").classList.add("hidden");
        })
        .catch(error => {
            console.error('Error loading category:', error);
        });
}

function loadCategoryEditForm() {
    categoryFormEdit = document.getElementById("categoryEditForm");
    errorMessageEdit = document.getElementById("errorMessageEdit");
    progressBarEdit = document.getElementById("progressBarEdit");
    progressContainerEdit = document.getElementById("progressContainerEdit");

    categoryFormEdit.onsubmit = processSubmitEdit;

    categoryId = localStorage.editCadegoryId;

    loadUserToEditInputs();
}

document.addEventListener(('DOMContentLoaded'), () => {
    loadCategoryEditForm();
});

if (!document.getElementById("fileModal")) {
    loadDOM("/partials/photoCropperModal.html");
}
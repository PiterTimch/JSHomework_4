let createProductForm;
let uploadedImageIds = [];
let loadingOverlay;
let productErrorMessage;

async function loadCategories() {
    try {
        const res = await axios.get("https://goose.itstep.click/api/Categories/list");
        const { data } = res;

        const selectElement = document.getElementById('category');

        data.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.title;
            selectElement.appendChild(option);
        });
    }
    catch (e) {
        console.log(e);
    }
}

function loadImagesInputs() {
    document.getElementById('fileInput').addEventListener('change', async function (event) {
        const fileList = event.target.files;
        const imageList = document.getElementById('imageList');

        for (let file of fileList) {
            await uploadImage(file, imageList);
        }
    });

    new Sortable(document.getElementById('imageList'), {
        animation: 150,
        ghostClass: 'opacity-50'
    });
}

async function uploadImage(file, imageList) {
    const reader = new FileReader();
    reader.onload = async function (e) {
        const placeholder = document.createElement('div');
        placeholder.classList.add('w-full', 'h-32', 'bg-gray-200', 'rounded-lg', 'shadow-md', 'animate-pulse');
        imageList.appendChild(placeholder);

        try {
            const res = await axios.post("https://goose.itstep.click/api/Products/upload", {
                image: e.target.result
            });

            const imageId = res.data.id;
            uploadedImageIds.push(imageId);

            const img = document.createElement('img');
            img.src = e.target.result;
            img.classList.add('w-full', 'h-32', 'object-cover', 'rounded-lg', 'shadow-md');

            const btn = document.createElement('button');
            btn.innerHTML = 'X';
            btn.classList.add('absolute', 'top-1', 'right-1', 'bg-red-500', 'text-white', 'text-sm', 'w-6', 'h-6', 'rounded-full', 'flex', 'items-center', 'justify-center', 'text-xl', 'font-bold', 'cursor-pointer');
            btn.onclick = function () {
                wrapper.remove();

                uploadedImageIds = uploadedImageIds.filter(id => id !== imageId);
            }

            const wrapper = document.createElement('div');
            wrapper.classList.add('relative', 'cursor-move');
            wrapper.appendChild(img);
            wrapper.appendChild(btn);

            imageList.replaceChild(wrapper, placeholder);
        } catch (error) {
            console.error("Image upload failed", error);
            imageList.removeChild(placeholder);
        }
    };
    reader.readAsDataURL(file);
}

function showErrorProductMessage(error) {
    productErrorMessage.innerText = error;
}

async function submitForm(event) {
    event.preventDefault();

    const name = document.getElementById("title").value.trim();
    const categoryId = parseInt(document.getElementById("category").value, 10);
    const price = parseFloat(document.getElementById("price").value);
    const priority = parseFloat(document.getElementById("priority").value);
    const description = tinymce.activeEditor.getContent();

    if (!name || categoryId === 0 || isNaN(price) || uploadedImageIds.length === 0) {
        showErrorProductMessage("Заповніть всі поля та додайте хоча б одне фото.");
        return;
    }

    const productData = {
        name,
        priority,
        categoryId,
        price,
        description,
        ids: uploadedImageIds
    };

    try {
        loadingOverlay.classList.remove("hidden");

        const response = await axios.post("https://goose.itstep.click/api/Products/add", productData);

        createProductForm.reset();
        tinymce.activeEditor.setContent("");
        uploadedImageIds = [];
        document.getElementById("imageList").innerHTML = "";
        showErrorProductMessage("");
    } catch (error) {
        showErrorProductMessage(error);
    } finally {
        loadingOverlay.classList.add("hidden");
    }
}

async function loadCreateProductForm() {
    loadingOverlay = document.getElementById("loading-overlay");
    productErrorMessage = document.getElementById("productErrorMessage");

    tinymce.init({
        selector: '#description',
        plugins: [
            'advlist', 'autolink', 'link', 'image', 'lists', 'charmap', 'preview', 'anchor', 'pagebreak',
            'searchreplace', 'wordcount', 'visualblocks', 'visualchars', 'code', 'fullscreen', 'insertdatetime',
            'media', 'table', 'emoticons', 'help'
        ],
        toolbar: 'undo redo | styles | bold italic | alignleft aligncenter alignright alignjustify | ' +
            'bullist numlist outdent indent | link image | print preview media fullscreen | ' +
            'forecolor backcolor emoticons | help',
        menu: {
            favs: { title: 'My Favorites', items: 'code visualaid | searchreplace | emoticons' }
        },
        menubar: 'favs file edit view insert format tools table help',
    });

    createProductForm = document.getElementById("createProductForm");

    createProductForm.addEventListener("submit", submitForm);

    await loadCategories();
    loadImagesInputs();
}
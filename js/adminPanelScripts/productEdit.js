let editProductForm;
let uploadedImageIdsEdit = [];
let loadingOverlayEdit;
let productErrorMessageEdit;
let loadedProduct;
let productId;

async function loadProductCategories() {
    try {
        const res = await axios.get(`${window.API_BASE_URL}/api/Categories/list`);
        const select = document.getElementById("categoryEdit");
        res.data.forEach(cat => {
            const option = document.createElement("option");
            option.value = cat.id;
            option.textContent = cat.title;
            select.appendChild(option);
        });
    } catch (e) {
        console.error("Error loading categories", e);
    }
}

function loadImageInputEdit() {
    document.getElementById('fileInputEdit').addEventListener('change', async function (event) {
        const fileList = event.target.files;
        const imageList = document.getElementById('imageListEdit');

        for (let file of fileList) {
            await uploadImageEdit(file, imageList);
        }
    });

    new Sortable(document.getElementById('imageListEdit'), {
        animation: 150,
        ghostClass: 'opacity-50'
    });
}

async function uploadImageEdit(file, imageList) {
    const reader = new FileReader();
    reader.onload = async function (e) {
        const placeholder = document.createElement('div');
        placeholder.classList.add('w-full', 'h-32', 'bg-gray-200', 'rounded-lg', 'shadow-md', 'animate-pulse');
        imageList.appendChild(placeholder);

        try {
            const res = await axios.post(`${window.API_BASE_URL}/api/Products/upload`, {
                image: e.target.result
            });

            const imageId = res.data.id;
            uploadedImageIdsEdit.push(imageId);

            const img = document.createElement('img');
            img.src = e.target.result;
            img.classList.add('w-full', 'h-32', 'object-cover', 'rounded-lg', 'shadow-md');

            const btn = document.createElement('button');
            btn.innerHTML = 'X';
            btn.classList.add('absolute', 'top-1', 'right-1', 'bg-red-500', 'text-white', 'text-sm', 'w-6', 'h-6', 'rounded-full', 'flex', 'items-center', 'justify-center', 'text-xl', 'font-bold', 'cursor-pointer');
            btn.onclick = function () {
                wrapper.remove();
                uploadedImageIdsEdit = uploadedImageIdsEdit.filter(id => id !== imageId);
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

function showEditProductError(error) {
    productErrorMessageEdit.innerText = error;
}

async function loadProductDataToForm() {
    try {
        const response = await axios.get(`${window.API_BASE_URL}/api/Products/get/${productId}`);
        loadedProduct = response.data;

        document.getElementById("titleEdit").value = loadedProduct.name;
        document.getElementById("priceEdit").value = loadedProduct.price;
        document.getElementById("priorityEdit").value = loadedProduct.priority;
        document.getElementById("categoryEdit").value = loadedProduct.categoryId;
        tinymce.activeEditor.setContent(loadedProduct.description);

        const imageList = document.getElementById("imageListEdit");

        for (let img of loadedProduct.images) {
            uploadedImageIdsEdit.push(img.id);

            const wrapper = document.createElement('div');
            wrapper.classList.add('relative', 'cursor-move');

            const image = document.createElement("img");
            image.src = `${window.API_BASE_URL}/images/400_${img.name}`;
            image.classList.add("w-full", "h-32", "object-cover", "rounded-lg", "shadow-md");

            const btn = document.createElement("button");
            btn.innerHTML = "X";
            btn.classList.add('absolute', 'top-1', 'right-1', 'bg-red-500', 'text-white', 'text-sm', 'w-6', 'h-6', 'rounded-full', 'flex', 'items-center', 'justify-center', 'text-xl', 'font-bold', 'cursor-pointer');
            btn.onclick = () => {
                wrapper.remove();
                uploadedImageIdsEdit = uploadedImageIdsEdit.filter(id => id !== img.id);
            };

            wrapper.appendChild(image);
            wrapper.appendChild(btn);
            imageList.appendChild(wrapper);
        }

        document.getElementById("loadingScreen").classList.add("hidden");
    } catch (error) {
        console.error("Error loading product data", error);
    }
}

async function submitEditProductForm(e) {
    e.preventDefault();

    const name = document.getElementById("titleEdit").value.trim();
    const price = parseFloat(document.getElementById("priceEdit").value);
    const priority = parseFloat(document.getElementById("priorityEdit").value);
    const categoryId = parseInt(document.getElementById("categoryEdit").value);
    const description = tinymce.activeEditor.getContent();

    if (!name || isNaN(price) || isNaN(priority) || uploadedImageIdsEdit.length === 0) {
        showEditProductError("Заповніть усі поля та додайте фото");
        return;
    }

    const productData = {
        id: productId,
        name,
        price,
        priority,
        categoryId,
        description,
        image: uploadedImageIdsEdit[0],
        ids: uploadedImageIdsEdit
    };

    try {
        loadingOverlayEdit.classList.remove("hidden");

        await axios.put(`${window.API_BASE_URL}/api/Products/edit`, productData);

        location.href = "/pages/adminPages/productsView.html";
    } catch (error) {
        showEditProductError(error?.response?.data?.error || "Сталася помилка");
    } finally {
        loadingOverlayEdit.classList.add("hidden");
    }
}

async function loadEditProductForm() {
    loadingOverlayEdit = document.getElementById("loadingScreen");
    productErrorMessageEdit = document.getElementById("productErrorMessageEdit");

    tinymce.init({
        selector: '#descriptionEdit',
        plugins: [
            'advlist', 'autolink', 'link', 'image', 'lists', 'charmap', 'preview', 'anchor', 'pagebreak',
            'searchreplace', 'wordcount', 'visualblocks', 'visualchars', 'code', 'fullscreen', 'insertdatetime',
            'media', 'table', 'emoticons', 'help'
        ],
        toolbar: 'undo redo | styles | bold italic | alignleft aligncenter alignright alignjustify | ' +
            'bullist numlist outdent indent | link image | print preview media fullscreen | ' +
            'forecolor backcolor emoticons | help',
        menubar: 'favs file edit view insert format tools table help',
    });

    editProductForm = document.getElementById("editProductForm");
    editProductForm.addEventListener("submit", submitEditProductForm);

    productId = new URLSearchParams(window.location.search).get("id");

    await loadProductCategories();
    loadImageInputEdit();
    await loadProductDataToForm();
}

document.addEventListener("DOMContentLoaded", () => {
    loadEditProductForm();
});

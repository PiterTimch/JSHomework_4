let productModel = {
    id: null,
    name: '',
    price: 0,
    priority: 0,
    categoryId: null,
    description: '',
    imageIds: [],
    images: []
};

let editProductForm;
let loadingOverlayEdit;
let productErrorMessageEdit;

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
        ghostClass: 'opacity-50',
        onEnd: updateImageOrderFromDOM
    });
}

function updateImageOrderFromDOM() {
    const imageList = document.getElementById('imageListEdit');
    const newIds = [];

    imageList.querySelectorAll('div.relative').forEach(wrapper => {
        const id = wrapper.dataset.id;
        if (id) newIds.push(id);
    });

    productModel.imageIds = newIds;
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
            productModel.imageIds.push(imageId);
            productModel.images.push({ id: imageId, name: res.data.name });

            const wrapper = createImageWrapper(e.target.result, imageId);
            imageList.replaceChild(wrapper, placeholder);
        } catch (error) {
            console.error("Image upload failed", error);
            imageList.removeChild(placeholder);
        }
    };
    reader.readAsDataURL(file);
}

function createImageWrapper(src, imageId) {
    const img = document.createElement('img');
    img.src = src;
    img.classList.add(
        'w-full', 'h-32', 'object-cover', 'rounded-lg', 'shadow-md'
    );

    const btn = document.createElement('button');
    btn.innerHTML = 'X';
    btn.classList.add(
        'absolute', 'top-1', 'right-1', 'bg-red-500', 'text-white',
        'text-sm', 'w-6', 'h-6', 'rounded-full', 'flex', 'items-center',
        'justify-center', 'text-xl', 'font-bold', 'cursor-pointer'
    );
    btn.onclick = function () {
        wrapper.remove();
        productModel.imageIds = productModel.imageIds.filter(id => id !== imageId);
        productModel.images = productModel.images.filter(img => img.id !== imageId);
    };

    const wrapper = document.createElement('div');
    wrapper.classList.add('relative', 'cursor-move');
    wrapper.dataset.id = imageId;
    wrapper.appendChild(img);
    wrapper.appendChild(btn);

    return wrapper;
}

function showEditProductError(error) {
    productErrorMessageEdit.innerText = error;
}

async function loadProductDataToForm() {
    try {
        const response = await axios.get(`${window.API_BASE_URL}/api/Products/get/${productModel.id}`);
        const product = response.data;

        productModel = {
            id: product.id,
            name: product.name,
            price: product.price,
            priority: product.priority,
            categoryId: product.categoryId,
            description: product.description,
            imageIds: product.images.map(img => img.id),
            images: product.images
        };

        document.getElementById("titleEdit").value = product.name;
        document.getElementById("priceEdit").value = product.price;
        document.getElementById("priorityEdit").value = product.priority;
        document.getElementById("categoryEdit").value = product.categoryId;
        tinymce.activeEditor.setContent(product.description);

        const imageList = document.getElementById("imageListEdit");
        product.images.forEach(img => {
            const wrapper = createImageWrapper(`${window.API_BASE_URL}/images/400_${img.name}`, img.id);
            imageList.appendChild(wrapper);
        });

        loadingOverlayEdit.classList.add("hidden");
    } catch (error) {
        console.error("Error loading product data", error);
    }
}

async function submitEditProductForm(e) {
    e.preventDefault();

    productModel.name = document.getElementById("titleEdit").value.trim();
    productModel.price = parseFloat(document.getElementById("priceEdit").value);
    productModel.priority = parseFloat(document.getElementById("priorityEdit").value);
    productModel.categoryId = parseInt(document.getElementById("categoryEdit").value);
    productModel.description = tinymce.activeEditor.getContent();

    if (!productModel.name || isNaN(productModel.price) || isNaN(productModel.priority) || productModel.imageIds.length === 0) {
        showEditProductError("Заповніть усі поля та додайте фото");
        return;
    }

    const productData = {
        id: productModel.id,
        name: productModel.name,
        price: productModel.price,
        priority: productModel.priority,
        categoryId: productModel.categoryId,
        description: productModel.description,
        image: productModel.imageIds[0],
        ids: productModel.imageIds
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

    editProductForm = document.getElementById("editProductForm");
    editProductForm.addEventListener("submit", submitEditProductForm);

    productModel.id = new URLSearchParams(window.location.search).get("id");

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
        setup: function (editor) {
            editor.on('init', async function () {
                await loadProductDataToForm();
            });
        }
    });

    await loadProductCategories();
    loadImageInputEdit();
}

document.addEventListener("DOMContentLoaded", () => {
    loadEditProductForm();
});
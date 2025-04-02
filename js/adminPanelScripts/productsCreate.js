let createProductForm;
let uploadedImageIds = [];

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
        try {
            const res = await axios.post("https://goose.itstep.click/api/Products/upload", {
                image: e.target.result
            });

            const imageId = res.data.id;
            uploadedImageIds.push(imageId);

            const img = document.createElement('img');
            img.src = e.target.result;
            img.classList.add('w-full', 'h-32', 'object-cover', 'rounded-lg', 'shadow-md');

            const wrapper = document.createElement('div');
            wrapper.classList.add('relative', 'cursor-move');
            wrapper.appendChild(img);

            imageList.appendChild(wrapper);
        } catch (error) {
            console.error("Image upload failed", error);
        }
    };
    reader.readAsDataURL(file);
}

async function loadCreateProductForm() {
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

    createProductForm.addEventListener("submit", (e) => {
        e.preventDefault();
        console.log("Working");
        let content = tinymce.activeEditor.getContent();
        console.log(content);
        console.log("Uploaded Image IDs:", uploadedImageIds);
    });

    await loadCategories();
    loadImagesInputs();
}
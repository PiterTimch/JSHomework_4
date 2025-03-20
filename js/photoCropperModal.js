const formPhoto = document.getElementById("formPhoto");

const modal = document.getElementById("fileModal");
const closeModal = document.getElementById("closeModal");
const cancelBtn = document.getElementById("cancelBtn");
const saveBtn = document.getElementById("saveBtn");
const croppingImage = document.getElementById("croppingImage");
const previewImage = document.getElementById("previewImage");

const leftTurn = document.getElementById("leftTurn");
const rightTurn = document.getElementById("rightTurn");
const horizontalTurn = document.getElementById("horizontalTurn");
const verticalTurn = document.getElementById("verticalTurn");

let uploadedImageURL;
let cropper;

function openModalWindow(e) {
    const { target } = e;
    const { files } = target;
    const file = files[0];

    if (file) {
        if (/^image\/\w+/.test(file.type)) {

            modal.classList.remove("hidden");
            modal.classList.add("flex");

            if (uploadedImageURL) {
                URL.revokeObjectURL(uploadedImageURL);
            }

            croppingImage.src = uploadedImageURL = URL.createObjectURL(file);

            if (cropper) {
                cropper.destroy();
            }

            cropper = new Cropper(croppingImage, {
                aspectRatio: 1,
                viewMode: 1,
                autoCrop: true,
                preview: ".img-preview"
                //crop() {
                //    updatePreview();
                //}
            });


        }
    }
}

//function updatePreview() {
//    if (cropper) {
//        const canvas = cropper.getCroppedCanvas();
//        if (canvas) {
//            previewImage.src = canvas.toDataURL();
//        }
//    }
//}

function closeModalWindow() {
    modal.classList.add("hidden");
    modal.classList.remove("flex");

    fileInput.value = "";

    if (cropper) {
        cropper.destroy();
        cropper = null;
    }

    if (uploadedImageURL) {
        URL.revokeObjectURL(uploadedImageURL);
        uploadedImageURL = null;
    }
}

function saveImage() {
    formPhoto.src = cropper.getCroppedCanvas().toDataURL();
    formPhoto.classList.remove("hidden");
    formPhoto.classList.add("h-[200px]");

    closeModalWindow();
}

function loadNewImage(path) {
    if (loadedImage.classList.contains("hidden")) {
        loadedImage.classList.remove("hidden");
        loadedImage.classList.add("h-[200px]");
    }

    loadedImage.src = path;
}

leftTurn.onclick = () => {
    if (cropper) {
        cropper.rotate(-90);
    }
}

rightTurn.onclick = () => {
    if (cropper) {
        cropper.rotate(90);
    }
}

verticalTurn.onclick = () => {
    if (cropper) {
        cropper.rotate(180);
    }
}

horizontalTurn.onclick = () => {
    if (cropper) {
        cropper.scaleX(-cropper.getData().scaleX || -1);
    }
}

closeModal.addEventListener("click", closeModalWindow);
cancelBtn.addEventListener("click", closeModalWindow);
saveBtn.addEventListener("click", saveImage);
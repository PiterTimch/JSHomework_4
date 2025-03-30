function openDeleteModal(name) {
    document.getElementById("categoryMoadlName").innerText = name;
    document.getElementById("deleteModal").classList.remove("hidden");
}

function closeDeleteModal() {
    document.getElementById("deleteModal").classList.add("hidden");
}
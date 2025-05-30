﻿function deleteProduct(event) {
    const id = event.target.dataset.id;
    const name = event.target.dataset.name;

    productToDelete = id;

    document.getElementById("modalProductName").innerText = name;

    document.getElementById("deleteModal").classList.remove("hidden");
}

function editProduct(event) {
    const id = event.target.dataset.id;

    location.href = `productEdit.html?id=${id}`;
}

async function fetchProducts() {
    try {

        const response = await axios.get(`${window.API_BASE_URL}/api/Products/list`);
        console.log('Products:', response);

        const { data } = response;
        const tableBody = document.getElementById('productsTableBody');
        paginationControls.innerHTML = '';

        for (let i = 0; i < data.pages; i++) {
            paginationControls.innerHTML += `
                <button onclick="onClickProductsPages(event)" 
                    class="px-4 py-2 border rounded-lg ${i + 1 == data.currentPage ? 'text-[#fff] bg-gray-800' : 'bg-gray-200'}">
                    ${i + 1}
                </button>`;
        }

        tableBody.innerHTML = '';

        data.forEach((product) => {
            const row = document.createElement('tr');
            row.className = "border-b hover:bg-gray-100";
            row.innerHTML = `
                <td class="py-3 px-4">
                    <img src="${window.API_BASE_URL}/images/200_${product.images[0]}" class="w-[50px] h-[50px] object-cover rounded-lg" alt="${product.name}">
                </td>
                <td class="py-3 px-4">${product.id}</td>
                <td class="py-3 px-4">${product.name}</td>
                <td class="py-3 px-4">${product.categoryName}</td>
                <td class="py-3 px-4">${product.priority}</td>
                <td class="py-3 px-4">${product.price} UAH</td>
                <td class="py-3 px-4 cursor-pointer text-blue-600" data-id="${product.id}" onclick="editProduct(event)">Edit</td>
                <td class="py-3 px-4 cursor-pointer text-[#c70000]" data-id="${product.id}" data-name="${product.name}" onclick="deleteProduct(event)">Delete</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        document.getElementById('productsTableBody').innerHTML = `
            <tr><td colspan="7" class="text-center py-4 text-red-500">Failed to load products</td></tr>
        `;
    }
}

let productToDelete;

function closeModal() {
    document.getElementById("deleteModal").classList.add("hidden");
    productToDelete = null;
}

document.getElementById("confirmDeleteBtn").addEventListener("click", async () => {
    if (!productToDelete) return;

    try {
        await axios.delete(`${window.API_BASE_URL}/api/Products/delete/${productToDelete}`);
        closeModal();
        fetchProducts();
    } catch (error) {
        console.error("Failed to delete product", error);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
});
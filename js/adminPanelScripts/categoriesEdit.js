let searchParams = {
    page: 1,
    title: '',
};

function searchCategories() {
    searchParams.title = document.getElementById('searchInput').value;
    fetchCategories();
}

function deleteCategory(e) {
    const categoryId = e.target.dataset.id;
    const token = localStorage.getItem("token");

    if (!token) {
        console.error("Auth token is missing");
        return;
    }

    axios.delete(`https://goose.itstep.click/api/Categories/delete/${categoryId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
        .then(() => {
            fetchCategories();
        })
        .catch((error) => {
            console.error("Error deleting category:", error);
        });
}

function onClickCategoriesPages(e) {
    searchParams.page = e.target.innerText;
    fetchCategories();
}

async function fetchCategories() {
    try {
        const paginationControls = document.getElementById('paginationControls');

        const response = await axios.get(`https://goose.itstep.click/api/Categories/search?${Qs.stringify(searchParams)}`);

        console.log('Categories:', response);

        const { data } = response;
        const { categories, pages, currentPage } = data;
        const tableBody = document.getElementById('categoriesTableBody');

        paginationControls.innerHTML = '';

        for (var i = 0; i < pages; i++) {
            if (i + 1 == currentPage) {
                paginationControls.innerHTML += `<button onclick="onClickCategoriesPages(event)" class="px-4 py-2 border rounded-lg text-[#fff] bg-gray-800">${i + 1}</button>`;
            }
            else {
                paginationControls.innerHTML += `<button onclick="onClickCategoriesPages(event)" class="px-4 py-2 border rounded-lg bg-gray-200">${i + 1}</button>`;
            }
        }

        tableBody.innerHTML = '';

        categories.forEach((category) => {
            const row = document.createElement('tr');
            row.className = "border-b hover:bg-gray-100";
            row.innerHTML = `
                    <td class="py-3 px-4">
                        <img src="https://goose.itstep.click/images/200_${category.image}" class="w-[100px] h-[100px] object-cover rounded-lg" alt="${category.title}">
                    </td>
                    <td class="py-3 px-4">${category.id}</td>
                    <td class="py-3 px-4">${category.title}</td>
                    <td class="py-3 px-4">${category.priority}</td>
                    <td class="py-3 px-4">${category.urlSlug}</td>
                    <td class="py-3 px-4 cursor-pointer text-[#c70000]" data-id="${category.id}" onclick="deleteCategory(event)">Delete</td>
                        `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        document.getElementById('categoriesTableBody').innerHTML = `
                        <tr><td colspan="5" class="text-center py-4 text-red-500">Failed to load categories</td></tr>
                    `;
    }
}
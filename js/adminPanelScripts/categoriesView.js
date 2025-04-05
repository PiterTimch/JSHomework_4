let searchParams = {
    page: new URLSearchParams(window.location.search).get('page') || 1,
    title: new URLSearchParams(window.location.search).get('title') || '',
};

let searchCategoriesForm;

async function deleteCategory(event) {
    const category =
    {
        id: event.target.getAttribute('data-id'),
        title: event.target.getAttribute('data-title')
    };

    if (!category.id) return;

    openDeleteModal(category.title);

    document.getElementById('deleteCategoryBtn').onclick = async () => {
        try {
            await axios.delete(`${window.API_BASE_URL}/api/Categories/delete/${category.id}`);
            closeDeleteModal();
            fetchCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };
}

function editCategory(event) {
    localStorage.editCadegoryId = event.target.getAttribute('data-id');

    location.href = "/pages/adminPages/categoriesEdit.html";
}

function searchCategories() {
    const searchTitle = document.getElementById('searchInput').value;
    searchParams.title = searchTitle;
    searchParams.page = 1;

    if (!searchParams.title) {
        delete searchParams.title;
    }

    const newUrl = `${window.location.pathname}?${Qs.stringify(searchParams)}`;
    window.history.pushState({}, '', newUrl);

    fetchCategories();
}

function onClickCategoriesPages(e) {
    searchParams.page = e.target.innerText;

    if (!searchParams.title) {
        delete searchParams.title;
    }

    const newUrl = `${window.location.pathname}?${Qs.stringify(searchParams)}`;
    window.history.pushState({}, '', newUrl);

    fetchCategories();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

async function fetchCategories() {
    try {
        const paginationControls = document.getElementById('paginationControls');

        searchCategoriesForm = document.getElementById('searchCategoriesForm');
        searchCategoriesForm.onsubmit = (e) => {
            e.preventDefault();
            searchCategories();
        }

        const response = await axios.get(`${window.API_BASE_URL}/api/Categories/search?${Qs.stringify(searchParams)}`);

        console.log('Categories:', response);

        const { data } = response;
        const { categories, pages, currentPage } = data;
        const tableBody = document.getElementById('categoriesTableBody');

        paginationControls.innerHTML = '';

        for (var i = 0; i < pages; i++) {
            paginationControls.innerHTML += `
                <button onclick="onClickCategoriesPages(event)" 
                    class="px-4 py-2 border rounded-lg ${i + 1 == currentPage ? 'text-[#fff] bg-gray-800' : 'bg-gray-200'}">
                    ${i + 1}
                </button>`;
        }

        tableBody.innerHTML = '';

        categories.forEach((category) => {
            const row = document.createElement('tr');
            row.className = "border-b hover:bg-gray-100";
            row.innerHTML = `
                <td class="py-3 px-4">
                    <img src="${window.API_BASE_URL}/images/200_${category.image}" 
                         class="w-[100px] h-[100px] object-cover rounded-lg" alt="${category.title}">
                </td>
                <td class="py-3 px-4">${category.id}</td>
                <td class="py-3 px-4">${category.title}</td>
                <td class="py-3 px-4">${category.priority}</td>
                <td class="py-3 px-4">${category.urlSlug}</td>
                <td class="py-3 px-4 cursor-pointer text-blue-600" data-id="${category.id}" onclick="editCategory(event)">Edit</td>
                <td class="py-3 px-4 cursor-pointer text-[#c70000]" data-id="${category.id}" data-title="${category.title}" onclick="deleteCategory(event)">Delete</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        document.getElementById('categoriesTableBody').innerHTML = `
            <tr><td colspan="6" class="text-center py-4 text-red-500">Failed to load categories</td></tr>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchCategories();
});
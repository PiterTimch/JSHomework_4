function loadDash() {
    lucide.createIcons();

    const salesCtx = document.getElementById('salesChart').getContext('2d');
    new Chart(salesCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Sales',
                data: [1200, 1500, 1100, 1800, 1700, 2000],
                borderColor: '#0db865',
                fill: false,
            }]
        }
    });

    const usersCtx = document.getElementById('usersChart').getContext('2d');
    new Chart(usersCtx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Users',
                data: [300, 450, 500, 600, 700, 850],
                backgroundColor: '#3b82f6'
            }]
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadDash();
});
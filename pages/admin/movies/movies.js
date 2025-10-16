const tableBody = document.querySelector('.body-table');
const logoutBtn = document.querySelector('.logout');
const token = localStorage.getItem('token');
let currentPage = 1;
const itemsPerPage = 9;
let allMovies = [];

async function getMovies() {
    const url = `https://api.sarkhanrahimli.dev/api/filmalisa/admin/movies`;
    const options = {
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    }

    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log('Error:', error);
    }
}

async function renderMovies() {
    const moviesData = await getMovies();
    allMovies = moviesData.data;
    showPage(currentPage);
    renderPagination();
}

function showPage(page) {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const moviesToShow = allMovies.slice(start, end);

    tableBody.innerHTML = moviesToShow.map(movie => `
        <tr>
            <td>${movie.id}</td>
            <td><img class="movie-icon" src="${movie.cover_url}" alt=""> </td>
            <td>${movie.title}</td>
            <td>${movie.overview}</td>
            <td>${movie.category?.name || 'No category'}</td>
            <td>${movie.imdb}</td>
           <td>
               <button class="edit-btn"><i class="fa-solid fa-pen"></i></button>
            </td>
           <td>
              <button class="delete-btn"><i class="fa-solid fa-trash"></i></button>
          </td>
        </tr>
    `).join('');
}

function renderPagination() {
    const totalPages = Math.ceil(allMovies.length / itemsPerPage);
    const pagination = document.querySelector('.pagination');

    let html = '';

    // Prev düyməsi
    html += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage - 1}">Prev</a>
             </li>`;

    // Səhifə nömrələri
    for (let i = 1; i <= totalPages; i++) {
        html += `<li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                 </li>`;
    }

    // Next düyməsi
    html += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>
             </li>`;

    pagination.innerHTML = html;

    // Click event
    pagination.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const page = Number(e.target.dataset.page);
            if (page >= 1 && page <= totalPages) {
                currentPage = page;
                showPage(currentPage);
                renderPagination();
            }
        });
    });
}

renderMovies();

logoutBtn.addEventListener('click',()=>{
    localStorage.removeItem('token');
    window.location.href = '/pages/admin/login/login.html';
})

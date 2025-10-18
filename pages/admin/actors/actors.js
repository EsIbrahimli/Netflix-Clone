const tableBody = document.querySelector('.body-table');
const logoutBtn = document.querySelector('.logout');
const createBtn = document.querySelector('#create-btn');
const actorNameInput = document.getElementById('actor-name-input');
const actorSurnameInput = document.getElementById('actor-surname-input');
const actorImgInput = document.getElementById('actor-img-input');
const addActorBtn = document.getElementById('add-actor-btn');
const actorsModal = document.querySelector('.actors-modal');
const movieContainer = document.querySelector('.movie-container');
const token = localStorage.getItem('token');


let currentPage = 1;
const itemsPerPage = 8;
let allActors = [];

//Api functions
async function getActors() {
    const url = `https://api.sarkhanrahimli.dev/api/filmalisa/admin/actors`;
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
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

async function addNewActor(newActor) {
    const url = `https://api.sarkhanrahimli.dev/api/filmalisa/admin/actors`;
    const options = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newActor)
    }
    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log('Error:', error);
    }
}

async function renderActors() {
    const dataActors = await getActors();
    allActors = dataActors.data;
    showPage(currentPage);
    renderPagination();
}


function showPage(page) {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const actorsToShow = allActors.slice(start, end);

    tableBody.innerHTML = actorsToShow.map(actor => `
           <tr>
                        <td>${actor.id}</td>
                        <td><img class="movie-icon" src="${actor.img_url}" alt=""></td>
                        <td>${actor.name}</td>
                        <td>${actor.surname}</td>
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
    const totalPages = Math.ceil(allActors.length / itemsPerPage);
    const pagination = document.querySelector('.pagination');
    let html = '';

    const visiblePages = 3; // eyni anda neçə səhifə görünsün
    let startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
    let endPage = Math.min(totalPages, startPage + visiblePages - 1);

    // Əgər sonlara yaxınlaşırsa
    if (endPage - startPage < visiblePages - 1) {
        startPage = Math.max(1, endPage - visiblePages + 1);
    }

    // Prev düyməsi
    html += `
    <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${currentPage - 1}">&laquo;</a>
    </li>
  `;

    // Səhifə nömrələri
    for (let i = startPage; i <= endPage; i++) {
        html += `
      <li class="page-item ${i === currentPage ? 'active' : ''}">
        <a class="page-link" href="#" data-page="${i}">${i}</a>
      </li>
    `;
    }

    // Next düyməsi
    html += `
    <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${currentPage + 1}">&raquo;</a>
    </li>
  `;

    pagination.innerHTML = html;

    // Klik hadisəsi
    const links = pagination.querySelectorAll('.page-link');
    links.forEach(link => {
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



renderActors();

//EVENTS 

createBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    actorsModal.style.display = 'flex';
})

window.addEventListener('click', (e) => {
    actorsModal.style.display = 'none';
});

actorsModal.addEventListener('click', (e) => {
    e.stopPropagation();
});


addActorBtn.addEventListener('click', async () => {
    const newActor = {
        name: actorNameInput.value.trim(),
        surname: actorSurnameInput.value.trim(),
        img_url: actorImgInput.value.trim()
    }

    await addNewActor(newActor);
    await renderActors();
    console.log('Actor added successfully');
    actorsModal.style.display = 'none';
})


logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/pages/admin/login/login.html';
})
const movieHeroCategoryName = document.getElementById('movie-hero-category-name');
const movieHeroTitle = document.getElementById('movie-hero-title');
const heroCoverImg = document.querySelector('.hero-cover-img');
const movieInfoCover = document.getElementById('movie-info-cover');
const movieInfoTitle = document.querySelector('.movie-info-title');
const movieInfoDescription = document.querySelector('.movie-info-description');
const movieInfoRating = document.querySelector('.movie-info-rating');
const movieInfoRunTime = document.querySelector('.movie-info-episode-run-time-value');
const movieInfoGenres = document.querySelector('.movie-info-genres-value');
const actorImg = document.getElementById('actor-img');
const actorName = document.getElementById('actor-name');
const addFavIcon = document.querySelector('.add-fav-icon');
const watchLink = document.querySelector('.watch-link');
const profileImg = document.querySelector('.profile-img'); // comment form'da istifadə edilir
const commentInput = document.querySelector('#comment-input'); // comment form'da istifadə edilir
const commentBtn = document.querySelector('#comment-btn'); // comment form'da istifadə edilir
const commentsContainer = document.querySelector('.comments-container');
const commentProfileInfo = document.querySelector('.comment-profile-info');
const commentProfileName = document.querySelector('.comment-profile-name');
const commentProfileTime = document.querySelector('.comment-profile-time');
const commentTextContainer = document.querySelector('.comment-text-container');
const commentText = document.querySelector('.comment-text');``

const selectedMovieId = localStorage.getItem('selectedMovieId');
const token = localStorage.getItem('token');
const userId = localStorage.getItem('userId');
const userImg = localStorage.getItem('userImg');

// Əgər token və ya userId yoxdursa, login səhifəsinə yönləndir
if (!token || !userId) {
    window.location.href = '/pages/client/login/login.html';
}

async function getMovieById(id) {
    const url = `https://api.sarkhanrahimli.dev/api/filmalisa/movies/${id}`;
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
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

async function getActors() {
    const url = `https://api.sarkhanrahimli.dev/api/filmalisa/admin/actors`;
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
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

async function getComments() {
    const url = `https://api.sarkhanrahimli.dev/api/filmalisa/movies/${selectedMovieId}/comments`;
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
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

async function addComment(newComment) {
    const url = `https://api.sarkhanrahimli.dev/api/filmalisa/movies/${selectedMovieId}/comment`;
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newComment)
    }
    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log('Error:', error);
    }
}

async function deleteComment(commentId) {
    const url = `https://api.sarkhanrahimli.dev/api/filmalisa/movies/${selectedMovieId}/comment/${commentId}`;
    const options = {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
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

async function getAccount() {
    const url = `https://api.sarkhanrahimli.dev/api/filmalisa/profile`;
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    }
    try {
        const response = await fetch(url, options);
        const data = await response.json();
        return data;
    } catch (error) {
        
    }
}

//------------------------------------------------------------------------
async function displayUserProfileImg() {
    if(userImg){
        profileImg.src = userImg;
    } else {
        // Əgər localStorage-də yoxdursa, API-dən al
        const accountData = await getAccount();
        if(accountData && accountData.data && accountData.data.img_url){
            profileImg.src = accountData.data.img_url;
            // localStorage-ə də saxla
            localStorage.setItem('userImg', accountData.data.img_url);
        } else {
            profileImg.src = '/assets/images/default.jpg';
        }
    }
}

displayUserProfileImg();

async function displayMovie() {
    const movie = await getMovieById(selectedMovieId);
    console.log('Movie:', movie);
    movieHeroCategoryName.textContent = movie.data.category.name;
    movieHeroTitle.textContent = movie.data.title;
    heroCoverImg.src = movie.data.cover_url;
    movieInfoCover.src = movie.data.cover_url;
    movieInfoTitle.innerHTML = `${movie.data.title} <span class="watch-link"; href="${movie.data.watch_url}">Watch Link</span>`;
    movieInfoDescription.textContent = movie.data.overview;
    movieInfoRating.innerHTML = `<img src="/assets/icons/movie-info-star.svg" alt="">${(movie.data.imdb / 2).toFixed(1)}`;
    movieInfoRunTime.textContent = `${movie.data.run_time_min} min`;
    movieInfoGenres.textContent = movie.data.category.name;
    
    // Actor bilgisi - movie'de varsa onu kullan, yoksa API'den ilk actor'ü al
    if (movie.data.actors && movie.data.actors.length > 0) {
        actorImg.src = movie.data.actors[0].img_url;
        actorName.textContent = movie.data.actors[0].name;
    } else {
        const actors = await getActors();
        actorImg.src = actors.data[0].img_url;
        actorName.textContent = actors.data[0].name;
    }
}

displayMovie();

async function displayComments() {
    const comments = await getComments();
    console.log('Selected Movie ID:', selectedMovieId);
    console.log('Comments:', comments.data);
    console.log('User ID:', userId);
    console.log('Comments:', comments);
    commentsContainer.innerHTML = '';
    comments.data.forEach(comment => {
        commentsContainer.innerHTML += `
                    <div class="comment-item" data-comment-id="${comment.id}">
                        <div class="comment-content">
                            <div class="comment-profile-info">
                               <img class="profile-img" src="${comment.user.img_url}" alt="">
                               <h1 class="comment-profile-name">${comment.user.full_name}</h1>
                            </div>
                             <div class="comment-profile-time-container">
                                   <span class="comment-profile-time">${comment.created_at}</span>
                                   <i class="fa-solid fa-xmark delete-comment-icon" data-comment-id="${comment.id}"></i>
                            </div>
                        </div>
                        <div class="comment-text-container">
                            <p class="comment-text">${comment.comment}</p>
                        </div>
                    </div>
        `
    });
}

displayComments();

async function submitComment() {
    const newComment = {
        comment: commentInput.value,
        user_id: userId,
        movie_id: selectedMovieId,
    }
    await addComment(newComment);
    await displayComments();
    commentInput.value = '';
    Toastify({
        text: "Comment uğurla əlavə edildi ✅",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "#28a745",
    }).showToast();
}

commentBtn.addEventListener('click', async (e) => {
    e.preventDefault(); 
    if(commentInput.value.trim() === ''){
        Toastify({
            text: "Comment daxil edin ❌",
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "#a72a28ff",
        }).showToast();
        return;
    }
    await submitComment();
    
});

// Comment silmək üçün event delegation
commentsContainer.addEventListener('click', async (e) => {
    if(e.target.classList.contains('delete-comment-icon')){
        const commentId = e.target.getAttribute('data-comment-id');
        const result = await deleteComment(commentId);
        if(result.result === true){ // düz bu hissə
            await displayComments();
            Toastify({
                text: "Comment uğurla silindi ✅",
                duration: 3000,
                gravity: "top",
                position: "right",
                backgroundColor: "#28a745",
            }).showToast();
        }
    }
});
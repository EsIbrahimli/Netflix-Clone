const fantasyMoviesSection = document.querySelector('.fantasy-movies-section');
const fantasyMoviesCards = document.querySelector('.fantasy-movies-cards');
const actionMoviesCards = document.querySelector('.action-movies-cards');
const thrillerMoviesCards = document.querySelector('.thriller-movies-cards');
const mysteryMoviesCards = document.querySelector('.mystery-movies-cards');
const comedyMoviesCards = document.querySelector('.comedy-movies-cards');
const dramMoviesCards = document.querySelector('.dram-movies-cards');
const crimeMoviesCards = document.querySelector('.crime-movies-cards');
const crimeeMoviesCards = document.querySelector('.crimee-movies-cards');   
const carouselInner = document.querySelector('.carousel-inner');

//Token
const token = localStorage.getItem('token');


//API Calls
async function getMovies(){
    const url = `https://api.sarkhanrahimli.dev/api/filmalisa/categories`;
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
        console.log('Error fetching movies:', error);
    }
}

//----------------------------------------------------------------------------------------------
async function displayFantasyMovies(){
    const movies = await getMovies();
    
    if(movies && movies.data && movies.data.length > 0){
        // Find fantasy category
        const fantasyCategory = movies.data.find(category => category.name === 'Fantasyyy');
        
        if(fantasyCategory && fantasyCategory.movies && fantasyCategory.movies.length > 0){
            fantasyMoviesCards.innerHTML = fantasyCategory.movies.map(movie => `
                <div class="fantasy-movie-card1">
                <div class="overlay-movies"></div>
                <img src="${movie.cover_url}" alt="">
            <div class=movie-content>
                <h3 class="movie-category-name">${fantasyCategory.name}</h3>
                <div class="rating-stars">
               ${generateStars(movie.imdb / 2 || 0)}
               </div>
                 <h1 class="movie-title">${movie.title}</h1>
                 </div>
             </div> 
            `).join('');
        }
        else{
            fantasyMoviesCards.innerHTML = 'No fantasy movies found';
        }
    }
}

displayFantasyMovies();


async function displayActionMovies(){
    const movies = await getMovies();
    const actionMovies = movies.data.find(category => category.name === 'Action');

    if(actionMovies && actionMovies.movies && actionMovies.movies.length > 0){
        actionMoviesCards.innerHTML = actionMovies.movies.map(movie => `
             <div class="action-movie-card1">
             <div class="overlay-movies"></div>
             <img src="${movie.cover_url}" alt="">
            <div class=movie-content>
                <h3 class="movie-category-name">${actionMovies.name}</h3>
                <div class="rating-stars">
               ${generateStars(movie.imdb / 2 || 0)}
               </div>
                 <h1 class="movie-title">${movie.title}</h1>
                 </div>
             </div> `).join('');
    }
    else{
        actionMoviesCards.innerHTML = 'No action movies found';
    }
}

displayActionMovies();


async function displayThrillerMovies(){
    const movies = await getMovies();
    const thrillerMovies = movies.data.find(category => category.name === 'Thriller');

    if(thrillerMovies && thrillerMovies.movies && thrillerMovies.movies.length > 0){
        thrillerMoviesCards.innerHTML = thrillerMovies.movies.map(movie => `
            <div class="thriller-movie-card1">
            <div class="overlay-movies"></div>
            <img src="${movie.cover_url}" alt="">
            <div class=movie-content>
                <h3 class="movie-category-name">${thrillerMovies.name}</h3>
                <div class="rating-stars">
               ${generateStars(movie.imdb / 2 || 0)}
               </div>
                 <h1 class="movie-title">${movie.title}</h1>
                 </div>
             </div> `).join('');
    }
    else{
        thrillerMoviesCards.innerHTML = 'No thriller movies found';
    }
}

displayThrillerMovies();


async function displayMysteryMovies(){
    const movies = await getMovies();
    const mysteryMovies = movies.data.find(category => category.name === 'Mystery');

    if(mysteryMovies && mysteryMovies.movies && mysteryMovies.movies.length > 0){
        mysteryMoviesCards.innerHTML = mysteryMovies.movies.map(movie => `
            <div class="mystery-movie-card1">
            <div class="overlay-movies"></div>
            <img src="${movie.cover_url}" alt="">
            <div class=movie-content>
                <h3 class="movie-category-name">${mysteryMovies.name}</h3>
                <div class="rating-stars">
               ${generateStars(movie.imdb / 2 || 0)}
               </div>
                 <h1 class="movie-title">${movie.title}</h1>
                 </div>
             </div> `).join('');
    }
    else{
        mysteryMoviesCards.innerHTML = 'No mystery movies found';
    }
}

displayMysteryMovies();


async function displayComedyMovies(){
    const movies = await getMovies();
    const comedyMovies = movies.data.find(category => category.name === 'Comedy');

    if(comedyMovies && comedyMovies.movies && comedyMovies.movies.length > 0){
        comedyMoviesCards.innerHTML = comedyMovies.movies.map(movie => `
             <div class="comedy-movie-card1">
             <div class="overlay-movies"></div>
             <img src="${movie.cover_url}" alt="">
            <div class=movie-content>
                <h3 class="movie-category-name">${comedyMovies.name}</h3>
                <div class="rating-stars">
               ${generateStars(movie.imdb / 2 || 0)}
               </div>
                 <h1 class="movie-title">${movie.title}</h1>
                 </div>
             </div> `).join('');
    }
    else{
        comedyMoviesCards.innerHTML = 'No comedy movies found';
    }
}

displayComedyMovies();


async function displayDramMovies(){
    const movies = await getMovies();
    const dramMovies = movies.data.find(category => category.name === 'Dram');

    if(dramMovies && dramMovies.movies && dramMovies.movies.length > 0){
        dramMoviesCards.innerHTML = dramMovies.movies.map(movie => `
              <div class="dram-movie-card1">
              <div class="overlay-movies"></div>
              <img src="${movie.cover_url}" alt="">
            <div class=movie-content>
                <h3 class="movie-category-name">${dramMovies.name}</h3>
                <div class="rating-stars">
               ${generateStars(movie.imdb / 2 || 0)}
               </div>
                 <h1 class="movie-title">${movie.title}</h1>
                 </div>
             </div> `).join('');
    }
    else{
        dramMoviesCards.innerHTML = 'No dram movies found';
    }
}

displayDramMovies();


async function displayCrimeMovies(){
    const movies = await getMovies();
    const crimeMovies = movies.data.find(category => category.name === 'Crime');

    if(crimeMovies && crimeMovies.movies && crimeMovies.movies.length > 0){
        crimeMoviesCards.innerHTML = crimeMovies.movies.map(movie => `
            <div class="crime-movie-card1">
            <div class="overlay-movies"></div>
            <img src="${movie.cover_url}" alt="">
            <div class=movie-content>
                <h3 class="movie-category-name">${crimeMovies.name}</h3>
                <div class="rating-stars">
               ${generateStars(movie.imdb / 2 || 0)}
               </div>
                 <h1 class="movie-title">${movie.title}</h1>
                 </div>
             </div>`).join('');
    }
    else{
        crimeMoviesCards.innerHTML = 'No crime movies found';
    }
}

displayCrimeMovies();


async function displayCrimeeMovies(){
    const movies = await getMovies();
    const crimeeMovies = movies.data.find(category => category.name === 'Crimee');

    if(crimeeMovies && crimeeMovies.movies && crimeeMovies.movies.length > 0){
        crimeeMoviesCards.innerHTML = crimeeMovies.movies.map(movie => `
            <div class="crimee-movie-card1">
            <div class="overlay-movies"></div>
            <img src="${movie.cover_url}" alt="">
                <div class=movie-content>
                <h3 class="movie-category-name">${crimeeMovies.name}</h3>
                <div class="rating-stars">
               ${generateStars(movie.imdb / 2 || 0)}
               </div>
                 <h1 class="movie-title">${movie.title}</h1>
                 </div>
             </div>`).join('');
    }
    else{
        crimeeMoviesCards.innerHTML = 'No crimee movies found';
    }
}

displayCrimeeMovies();
//---------------------------------------------------------------------------------------------

async function carousel() {
    const movies = await getMovies();
    
    if (movies && movies.data && movies.data.length > 0) {
      // 1. Bütün kategoriyalardakı filmləri bir massivə yığaq
      const allMovies = movies.data.flatMap(category => 
        category.movies.map(movie => ({
          ...movie,
          categoryName: category.name
        }))
      );
  
      // 2. İlk 3 filmi götürək
      const firstThree = allMovies.slice(0, 3);
  
      // 3. Carousel HTML yaradaq
      carouselInner.innerHTML = firstThree.map((movie, index) => `
        <div class="carousel-item ${index === 0 ? 'active' : ''}">
          <div class="overlay"></div>
          <img src="${movie.cover_url}" class="d-block w-100" alt="${movie.title}">
          <div class="carousel-content">
            <h3 class="slider-movie-category-name">${movie.categoryName}</h3>
           <div class="slider-rating-stars">
           <div class="rating-stars">
            ${generateStars(movie.imdb / 2 || 0)}
           </div>
           </div>
            <h1 class="slider-movie-title">${movie.title}</h1>
            <p>${movie.overview}</p>
            <button class="watch-btn">Watch Now</button>
          </div>
        </div>
      `).join('');
    }
  }
  
  carousel();
  
  function generateStars(rating) {
    if (!rating) return '<i class="fa fa-star-o"></i>'.repeat(5);
  
    const maxRating = rating > 5 ? rating / 2 : rating;
    const fullStars = Math.floor(maxRating);
    const halfStar = maxRating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  
    let starsHTML = '';
    for (let i = 0; i < fullStars; i++) starsHTML += '<i class="fa fa-star"></i>';
    if (halfStar) starsHTML += '<i class="fa fa-star-half-alt"></i>';
    for (let i = 0; i < emptyStars; i++) starsHTML += '<i class="fa fa-star-o"></i>';
  
    return starsHTML;
  }
  
  
  

function getDetailedPage(){
    window.location.href = `../detailed/detailed.html`;
}
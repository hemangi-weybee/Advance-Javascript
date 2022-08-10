'use strict';

const loadingPage = document.querySelector('.temp_page');
const mainContainer = document.querySelector('.main_content');
const characterContainer = document.querySelector('.all_characters');
const errorContainer = document.querySelector('.error');
const pageNav = document.querySelector('.pages_link');
const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const btnClose = document.querySelector('.close_modal');
const modalLoader = document.querySelector('.modal_loader');
const modalData = document.querySelector('.character_detail');
const modelImg = document.querySelector('.character_detail_img');
const modelName = document.querySelector('.character_head').querySelector('h2');
const modalCharacterDetail = document.querySelector('.character_body');

const characterDataset = [];
let currentPage = 1;

const renderError = function () {
    errorContainer.innerHTML = 'Error : Something went wrong! Try again Later.';
    errorContainer.classList.remove('hidden');
    loadingPage.classList.add('hidden');
    mainContainer.classList.remove('hidden');
}

const renderPageNO = function (pageNo) {
    const navlink = `<li class="nav_link ${pageNo === 1 ? "current" : ''} "><a href="${pageNo}">${pageNo}</a></li> `
    pageNav.insertAdjacentHTML('beforeend', navlink);
}

const renderCharacterCard = async function (page) {
    currentPage = page - 1;
    characterContainer.innerHTML = '';
    const data = characterDataset.filter(c => c.page === page)
    for (const c of data) {
        try {
            const img = await createImage(`https://starwars-visualguide.com/assets/img/characters/${c.id}.jpg`);
            c.img = img.outerHTML;
            const characterCardHtml = `
                        <div class="character_card" data-id = "${c.id}">
                            <div class="character_img"> ${c.img} </div> 
                            <div class="character_name"> <h4> ${c.detail.name}</h4> </div>
                        </div>`;

            characterContainer.insertAdjacentHTML('beforeend', characterCardHtml);
        } catch (err) {
            renderError();
            console.error(err);
        }
    }
    loadingPage.classList.add('hidden');
    mainContainer.classList.remove('hidden');
}

const openModal = async function (character) {
    modal.classList.remove('hidden');
    overlay.classList.remove('hidden');
    modalLoader.classList.remove('hidden');
    modalData.style.display = 'none';

    try {
        if (character.detail.species.length !== 0) {
            const species = await getJSON(character.detail.species[0]);
            character.species = species.name;
        } else {
            character.species = 'Unknown';
        }
    
        const homeworld = await getJSON(character.detail.homeworld);
        character.homeworld = homeworld.name;
    
        const films = await getFilms(character.detail.films);
        character.films = films;
    } catch (err) {
        renderError();
        modal.classList.add('hidden');
    overlay.classList.add('hidden');
    }

    renderModalContent(character);
};

const closeModal = function () {
    modal.classList.add('hidden');
    overlay.classList.add('hidden');
    modalLoader.classList.remove('hidden');
    modalData.style.display = 'none';
};

const renderModalContent = function (character) {

    modelImg.innerHTML = character.img;
    modelName.innerHTML = character.detail.name;
    modalCharacterDetail.innerHTML = '';

    const detailHTML = `
        <div class="content"> <i class="fa-solid fa-calendar-day"></i> <span class="heading"> Birthyear :  <span> ${character.detail.birth_year} </span> </span> </div>
        <div class="content"> <i class="fa-solid fa-user"></i> <span class="heading"> Gender : <span> ${character.detail.gender} </span> </span> </div>
        <div class="content"> <i class="fa-solid fa-circle-question"></i> <span class="heading"> Species : <span> ${character.species} </span> </span> </div>
        <div class="content"> <i class="fa-solid fa-globe"></i> <span class="heading"> Homeworld : <span> ${character.homeworld} </span> </span> </div>
        <div class="content"> <i class="fa-solid fa-clapperboard"></i> <span class="heading"> Appearances : </span> </div>
        <div class='movie'> ${character.films} </div>
    `;

    modalCharacterDetail.insertAdjacentHTML('beforeend', detailHTML)
    modalLoader.classList.add('hidden');
    modalData.style.display = 'flex';
}

const createImage = function (imgPath) {
    return new Promise(function (resolve, reject) {
        const ele = document.createElement('img');
        ele.src = imgPath;
        ele.addEventListener('load', () => resolve(ele))
        ele.addEventListener('error', () => reject(new Error('Image not found')));
    });
}

const getJSON = async function (url) {
    errorContainer.classList.add('hidden');
    try {
        const response = await fetch(url,{mode: 'no-cors'});
        if (!response.ok) return null;
        const data = await response.json();
        return data;
    } catch (err) {
        renderError();
        console.error(err);
    }
}

const getFilms = async function (url) {
    errorContainer.classList.add('hidden');
    const result = [];
    try {
        for (let i = 0; i < url.length; i++) {
            const data = await getJSON(url[i]);
            result.push(data.title);
        }
        return result.join(',<br>');
    } catch (err) {
        renderError();
        console.error(err);
    }
}

const getCharacter = async function (url = 'https://swapi.dev/api/people/') {
    try {
        const data = await getJSON(url);
        let pageNo;
        if (data.next) pageNo = Number(data.next.slice(data.next.length - 1)) - 1;
        else pageNo = Number(data.previous.slice(data.previous.length - 1)) + 1;
        data.results.forEach(c => {
            const id = Number(c.url.slice(c.url.slice(0, c.url.lastIndexOf('/')).lastIndexOf('/') + 1, c.url.lastIndexOf('/')));
            const character = { id: id, page: pageNo, detail: c };
            characterDataset.push(character);
        })
        renderPageNO(pageNo);
        if (pageNo === 4) {
            pageNav.style.display = 'none';
            document.querySelector('body').style.backgroundColor = '#c5c5c5';
            renderCharacterCard(1);
        }
        if (data.next) await getCharacter(data.next);
        if (!data.next) {
            pageNav.style.display = 'flex';
            // document.querySelector('body').style.backgroundColor = '#c5c5c5';
            // renderCharacterCard(1);
        }
    } catch (err) {
        console.error(err);
        renderError();
    }
}

getCharacter();

btnClose.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal(); });

characterContainer.addEventListener('click', function (e) {
    const element = e.target.closest('.character_card');
    if (!element) return;
    openModal(characterDataset.find(c => c.id === Number(element.dataset.id)));
})

pageNav.addEventListener('click', function (e) {
    e.preventDefault();
    const ele = e.target.closest('.nav_link').querySelector('a');
    if (!ele) return;
    document.querySelectorAll('.nav_link')[currentPage].classList.remove('current');
    renderCharacterCard(Number(ele.getAttribute('href')));
    document.querySelectorAll('.nav_link')[currentPage].classList.add('current');
})
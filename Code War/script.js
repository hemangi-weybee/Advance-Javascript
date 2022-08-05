'use strict';

const loadingPage = document.querySelector('.temp_page');
const mainContainer = document.querySelector('.main_content');
const characterContainer = document.querySelector('.all_characters');

const dataset = [];

const createImage = function (imgPath) {

    return new Promise(function (resolve, reject) {
        const ele = document.createElement('img');
        ele.src = imgPath;
        document.querySelectorAll('.character_img')[dataset.length-1].append(ele);

        ele.addEventListener('load', () => {
            resolve(ele);
        })
        ele.addEventListener('error', () => reject(new Error('Image not found')));
    });
}

const getCharacter = async function (i) {
    try {
        const response = await fetch(`https://swapi.dev/api/people/${i}`)
        return response;
    } catch (err) {
        console.error(err);
    }
}

const getData = async function () {
    try {
        const response = await fetch('https://swapi.dev/api/people');
        const data = await response.json();
        console.log(data.count);

        for (let i = 1; i <= data.count; i++) {
            const response = await getCharacter(i);
            if(!response.ok) continue;
            const data = await response.json(); 
            const character = {
                id: i,
                detail: data 
            }
            dataset.push(character);
            try {
                const characterCardHtml = `
                    <div class="character_card" data-id = "${i}">
                        <div class="character_img"> </div> 
                        <div class="character_name"> <h3> ${data.name}</h3> </div>
                    </div>`;

                characterContainer.insertAdjacentHTML('beforeend', characterCardHtml);

                const img = await createImage(`https://starwars-visualguide.com/assets/img/characters/${i}.jpg`, i)
            } catch (err) {
                console.error(err);
            }
        }
        loadingPage.classList.add('hidden');
        mainContainer.classList.remove('hidden');
    } catch (err) {
        console.error(err)
    }
}



getData();
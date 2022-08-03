'use strict';

/////////////////////////////////////////////////////////
///// Challenge 1

/*
//Reverse Goecoding  

const options = {
    method: 'GET',
    headers: {
        'X-RapidAPI-Key': 'SIGN-UP-FOR-KEY',
        'X-RapidAPI-Host': 'opencage-geocoder.p.rapidapi.com'
    }
};

// const lat = 22.2885129, lng = 70.7763053;

fetch(`https://api.opencagedata.com/geocode/v1/json?key=7646e7715d3d406f946a0dcd8c4d38dc&q=${lat}%2C%20${lng}&pretty=1&no_annotations=1`, options)
    .then(response => response.json())
    .then(response => console.log(response))
    .catch(err => console.error(err));

*/

const btn = document.querySelector('.btn-country');
const countriesContainer = document.querySelector('.countries');
const limitHeader = document.querySelector('.limit');

const renderCountry = function (data, className = '') {
    const [currency] = Object.values(data.currencies);
    const html = `
            <article class="country ${className}">
                <img class="country__img" src="${data.flags.svg}" />
                <div class="country__data">
                    <h3 class="country__name">${data.name.common}</h3>
                    <h4 class="country__region">${data.region}</h4>
                    <p class="country__row"><span>👫</span>${(+data.population / 1000000).toFixed(2)} Million</p>
                    <p class="country__row"><span>🗣️</span>${Object.values(data.languages).join(', ')}</p>
                    <p class="country__row"><span>💰</span>${Object.values(currency).join(' : ')}</p>
                </div>
        </article>`;

    countriesContainer.insertAdjacentHTML('beforeend', html);
    // countriesContainer.style.opacity = 1;
}

const renderError = function (msg) {

    countriesContainer.insertAdjacentText('beforeend', msg);
    // countriesContainer.style.opacity = 1; 
}

const getJSON = function (url, errMessage = 'Something went wrong!') {
    return fetch(url)
        .then(response => {
            if (!response.ok) throw new Error(errMessage);
            return response.json();
        })
}

const getPosition = function () {
    return new Promise(function (resolve, reject) {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
}

const getCountryData = function () {
    let country, limit;

    getPosition()
        .then(pos => {
            const { latitude, longitude } = pos.coords;
            return fetch(`https://api.opencagedata.com/geocode/v1/json?key=7646e7715d3d406f946a0dcd8c4d38dc&q=${latitude}%2C%20${longitude}&pretty=1&no_annotations=1`)
        })
        .then(response => {
            if (!response.ok) throw new Error(`Problem with Geocoding (${response.status})`);
            return response.json();
        })
        .then(data => {
            limit = data.rate.remaining
            if (limit === 0) throw new Error(`Couldn't load the data. Reached max limit. Try Again Tomorrow!`)

            // console.log(`limit : ${limit}`)

            console.log(`You are in ${data.results[0].components.city ? data.results[0].components.city + ', ' : ''}${data.results[0].components.state ? data.results[0].components.state + ', ' : ''}${data.results[0].components.country}`)

            const code = data.results[0].components.country_code;
            country = data.results[0].components.country;

            return getJSON(`https://restcountries.com/v3.1/alpha/${code}`, 'Country not Found!');
        })
        .then(data => {
            const index = data.findIndex(c => c.name.common === country);
            renderCountry(data[index]);

            const neighbour = data[index].borders;

            if (!neighbour) throw new Error(`No Neighbour found!`);

            return getJSON(`https://restcountries.com/v3.1/alpha/${neighbour[0]}`, 'Country not Found!');
        })
        .then(data => renderCountry(data[0], 'neighbour'))
        .catch(error => renderError(`${error.message}`))
        .finally(() => {
            limitHeader.style.display = 'block';
            limitHeader.innerHTML = `Limit : ${limit}`;

            countriesContainer.style.opacity = 1;
        });

}

btn.addEventListener('click', function () {

    // getCountryData(52.508, 13.381); //Germany
    // getCountryData(19.037, 72.873); //india
    // getCountryData(-33.933, 18.474); //South Africa

    getCountryData();
});

/////////////////////////////////////////////////////////
///// Challenge 2

const imgContainer = document.querySelector('.images');

const wait = function (seconds) {
    return new Promise(function (resolve) {
        setTimeout(resolve, seconds * 1000)
    });
}

const createImage = function (imgPath) {
    return new Promise(function (resolve, reject) {
        const ele = document.createElement('img');
        ele.src = imgPath;
        

        ele.addEventListener('load', () => {
            imgContainer.append(ele);
            resolve(ele)
        })

        ele.addEventListener('error', () => reject(new Error('Image not found')));
    })
}

// let current;

// createImage('img/img-1.jpg')
//   .then(ele => {
//     current = ele;
//     return wait(2);
// })
// .then(() => {
//     current.style.display = 'none';
//     return createImage('img/img-2.jpg')})
// .then(ele => {
//     current = ele;
//     return wait(2);
// })
// .then(() => {
//     current.style.display = 'none';
//     return createImage('img/img-3.jpg')})
// .then(ele => {
//     current = ele;
//     return wait(2);
// })


/////////////////////////////////////////////////////////
///// Challenge 3


//// Part 1
const loadNPause = async function () {
    try {
        let img = await createImage('img/img-1.jpg');
        await wait(2);
        img.style.display = 'none';

        img = await createImage('img/img-2.jpg');
        await wait(2);
        img.style.display = 'none';

        img = await createImage('img/img-3.jpg');
        await wait(2);
    }catch (err) {
        console.error(err)
    }
}

// loadNPause();


////Part 2
const loadAll = async function(imgArr) {
    try{
        const imgs = imgArr.map(async i => await createImage(i))
        const imgEL = await Promise.all(imgs);
        imgEL.forEach(img => img.classList.add('parallel'))
    } catch(err) {
        console.error(`⏹ ${err}`);
    }
}

loadAll(['img/img-1.jpg', 'img/img-2.jpg', 'img/img-3.jpg']);

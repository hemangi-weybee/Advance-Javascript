'use strict';

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
    countriesContainer.style.opacity = 1;

}

const renderError = function (msg) {
    countriesContainer.insertAdjacentText('beforeend', msg);
    countriesContainer.style.opacity = 1;
}

const getJSON = function (url, errMessage = 'Something went wrong!') {
    return fetch(url)
        .then(response => {
            if (!response.ok) throw new Error(errMessage);
            return response.json();
        })
}

///////////////////////////////////////

/*
const getCountryAndNeighbour = function(country) {

    const request = new XMLHttpRequest();

    request.open('GET', `https://restcountries.com/v3.1/name/${country}`);
    request.send();

    request.addEventListener('load', function () {
        const [data] = JSON.parse(this.responseText);
        console.log(data);
        renderCountry(data);

        const neighbour = data.borders;

        if(!neighbour) return

        neighbour.forEach(n => {
            const request = new XMLHttpRequest();
    
            request.open('GET', `https://restcountries.com/v3.1/alpha/${n}`);
            request.send();

            request.addEventListener('load', function () {
                const [data] = JSON.parse(this.responseText);
                console.log(data);
                renderCountry(data, 'neighbour');
            });
        })        
    });
}

getCountryAndNeighbour('india')
// getCountryAndNeighbour('portugal')
// getCountryAndNeighbour('usa')
// getCountryAndNeighbour('germany')


// const request = fetch('https://restcountries.com/v3.1/name/india')
// console.log(request)
*/

/*
const getCountryAndNeighbour = function (country) {
    fetch(`https://restcountries.com/v3.1/name/${country}`)
        .then(response => {
            if(!response.ok) throw new Error(`Country not Found (${response.status})`);
            return response.json();
        })
        .then(data => {
            console.log(data)
            const index = data.findIndex( c => c.name.common.toLowerCase() === country);
            renderCountry(data[index])

            const neighbour = data[index].borders;

            if(!neighbour) return

            return fetch(`https://restcountries.com/v3.1/alpha/${neighbour[0]}`)
        })
        .then(response => response.json())
        .then(data => renderCountry(data[0], 'neighbour'))
        .catch(error => renderError(`${error.message}. Try again!`))
        .finally(() => {
            countriesContainer.style.opacity = 1;
        })
}

getCountryAndNeighbour('bdksajbkj');


const getCountryAndNeighbour = function (country) {
    getJSON(`https://restcountries.com/v3.1/name/${country}`, 'Country not Found!')
        .then(data => {
            console.log(data);
            const index = data.findIndex(c => c.name.common.toLowerCase() === country);
            renderCountry(data[index]);

            const neighbour = data[index].borders;

            if (!neighbour) throw new Error(`No Neighbour found!`);

            return getJSON(`https://restcountries.com/v3.1/alpha/${neighbour[0]}`, 'Country not Found!');
        })
        .then(data => renderCountry(data[0], 'neighbour'))
        .catch(error => renderError(`${error.message}`))
        .finally(() => {
            countriesContainer.style.opacity = 1;
        });
}

btn.addEventListener('click', function () {
    getCountryAndNeighbour('india')
    getCountryAndNeighbour('australia')
});

// console.log('Test Start')
// setTimeout(() => console.log('0 Sec timer'), 0)
// Promise.resolve('Resolved promise 1')
// .then(res => {
//     for (let index = 0; index < 100000; index++) {}    
//     console.log(res)
// })
// console.log('Test End')

/////////////////////////////////////////////////////
//////////// Creating Promise


const lotteryPromise = new Promise(function (resolve, reject) {
    console.log('Lottery is happening');
    setTimeout(function () {
        if (Math.random() >= 0.5) {
            resolve('You WIN 💰');
        } else {
            reject(new Error('You Lost your money 😢'));
        }
    }, 2000)
});

lotteryPromise
    .then(res => console.log(res))
    .catch(err => console.error(err))



//Promisifying setTimeout
const wait = function (seconds) {
    return new Promise(function (resolve) {
        setTimeout(resolve, seconds * 1000)
    });
}

wait(1).then(() => {
    console.log('1 second')
    return wait(1)
}).then(() => {
    console.log('2 seconds')
    return wait(1)
}).then(() => {
    console.log('3 seconds')
    return wait(1)
}).then(() => {
    console.log('4 seconds')
    return wait(1)
}).then(() => {
    console.log('5 seconds')
});

Promise.resolve('abc').then((x) => console.log(x))
Promise.reject(new Error('Problem!')).catch(x => console.error(x))

*/

///////////////////////////////////////////////
///// Async Await

const getPosition = function () {
    return new Promise(function (resolve, reject) {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
}

const getCountryData = async function () {

    try {
        //current geolocation
        const pos = await getPosition();
        const { latitude, longitude } = pos.coords;

        //Reverse Geocoding
        const resGeo = await fetch(`https://api.opencagedata.com/geocode/v1/json?key=7646e7715d3d406f946a0dcd8c4d38dc&q=${latitude}%2C%20${longitude}&pretty=1&no_annotations=1`);
        if (!resGeo.ok) throw new Error(`Problem with Geocoding (${resGeo.status})`);
        const dataGeo = await resGeo.json();

        const limit = dataGeo.rate.remaining;
        if (limit === 0) throw new Error(`Couldn't load the data. Reached max limit. Try Again Tomorrow!`)

        //Country Data
        const res = await fetch(`https://restcountries.com/v3.1/alpha/${dataGeo.results[0].components.country_code}`);
        if (!res.ok) throw new Error(`Country not found (${res.status})`);
        const data = await res.json();

        renderCountry(data[0]);

        limitHeader.style.display = 'block';
        limitHeader.innerHTML = `Limit : ${limit}`;

        return (`You are in ${dataGeo.results[0].components.city ? dataGeo.results[0].components.city + ', ' : ''}${dataGeo.results[0].components.state ? dataGeo.results[0].components.state + ', ' : ''}${dataGeo.results[0].components.country}`)

    } catch (err) {
        console.error(`${err} 🎆`);
        renderError(`${err.message} try again! 🎆`)

        throw err;
    }
}

btn.addEventListener('click', function () {
    console.log('1: Will get location')
    // const city = getCountryData();
    // console.log(city);
    getCountryData()
        .then(city => console.log(`2: ${city}`))
        .catch(err => console.log(`2: ${err.message}`))
        .finally(() => console.log('3: Finished getting location'));

});

// (async function(){
//     console.log('1: Will get location');
//     try {
//         const city = await getCountryData();
//         console.log(`2: ${city}`)
//     } catch (err) {
//         console.error(`2: ${err.message}`)
//     }
//     console.log('3: Finished getting location')
// })();

// const get3countries = async function(c1,c2,c3) {
//     const url = `https://restcountries.com/v3.1/name/`;
//     try {
//         // const [ data1 ] = await getJSON(`${url}${c1}`);
//         // const [ data2 ] = await getJSON(`${url}${c2}`);
//         // const [ data3 ] = await getJSON(`${url}${c3}`);

//         // console.log([ data1.capital, data2.capital, data3.capital].flat())

//         const data = await Promise.all([await getJSON(`${url}${c1}`), await getJSON(`${url}${c2}`), await getJSON(`${url}${c3}`)]);
//         console.log(data.map(d => d[0].capital).flat());
//     } catch (err) {
//         console.log(err);
//     }
// }

// get3countries('portugal', 'canada', 'tanzania');



/////////////////////////////////////////
//// Race against timeout

const timeout = function (sec) {
    return new Promise(function (_, reject) {
        setTimeout(function () {
            reject(new Error('Request timeout!'))
        }, sec * 1000)
    })
}

Promise.race([
    getJSON(`https://restcountries.com/v3.1/name/tanzania`),
    timeout(1)
]).then(res => console.log(res[0]))
    .catch(err => console.error(err));


//////////////////////////////////////////
//// allSettled result of promises

Promise.allSettled([
    Promise.resolve('success 1'),
    Promise.resolve('success 2'),
    Promise.reject('error'),
])
    .then(res => console.log(res))
    .catch(err => console.error(err))

//////////////////////////////////////////
//// All result of promises is short circuited

Promise.all([
    Promise.resolve('success 1'),
    Promise.resolve('success 2'),
    Promise.reject('error'),
])
    .then(res => console.log(res))
    .catch(err => console.error(err))

/////////////////////////////////////////
//// Whoever done process first is the result

// (async function () {
//     // const url = `https://restcountries.com/v3.1/name/`;
//     const res = await Promise.race([
//         await getJSON(`https://restcountries.com/v3.1/name/italy`),
//         await getJSON(`https://restcountries.com/v3.1/name/egypt`),
//         await getJSON(`https://restcountries.com/v3.1/name/mexico`)
//     ]);
//     console.log(res[0]);
// })();

/////////////////////////////////////
//// Rejected promises are ignored in ANY

Promise.any([
    Promise.reject('error'),
    Promise.resolve('success 1'),
    Promise.resolve('success 2'),
])
    .then(res => console.log(res))
    .catch(err => console.error(err))

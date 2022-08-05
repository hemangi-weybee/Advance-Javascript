'use strict';

const containerError = document.querySelector('.error');
const containerClan = document.querySelector('.all__clan');
const containerClanMember = document.querySelector('.all__clan__members');
const mainClanMember = document.querySelector('.clan__members');
const containerMemberDetail = document.querySelector('.contain__members');
const loader = document.querySelector('.box__Loading');
const clanLoader = document.querySelector('.clan__loading');

let currentClan, members = [];

const options = {
    method: 'GET',
    headers: {
        'X-RapidAPI-Key': '8aac457b96msh89ac948cd94a661p17af02jsn9ae3ddf83535',
        'X-RapidAPI-Host': 'naruto-database.p.rapidapi.com'
    }
};

const renderError = function (msg) {

    containerError.innerHTML = `${msg}`
    containerError.classList.remove('hidden');

    loader.classList.add('hidden');
    clanLoader.classList.add('hidden');
}

const renderClan = function (clan) {

    clan.flat().forEach(c => {
        const clanHTML = `<li class="clan_name" data-clan="${c.toLowerCase()}"> ${c}</li>`
        containerClan.insertAdjacentHTML('beforeend', clanHTML);
    });

    loader.classList.add('hidden');
}

const renderClanMember = function (clanMember) {

    clanMember.forEach((c, i) => {
        const clanMemberHTML = `<li class="clan_member" data-member="${i}"> ${c}</li>`
        containerClanMember.insertAdjacentHTML('beforeend', clanMemberHTML);
    });

    clanLoader.classList.add('hidden');
    mainClanMember.classList.remove('hidden')
}

const createImage = function (imgPath) {

    return new Promise(function (resolve, reject) {
        const ele = document.createElement('img');
        ele.src = imgPath;

        ele.addEventListener('load', () => {
            resolve(ele)
        })
        ele.addEventListener('error', () => reject(new Error('Image not found')));
    })
}

const renderMemberDetail = async function (member) {

    const html = `
    <div class="clan member__detail"> 
        <h2 class="clan__member">  </h2>
        <div class="member_img"></div>
        <div class="details">
        </div>
    </div>`;

    containerMemberDetail.insertAdjacentHTML('afterbegin', html);

    const memberHead = document.querySelector('.clan__member');
    const memberImg = document.querySelector('.member_img');
    const memberDetail = document.querySelector('.details');


    for (const key in member) {
        const head = key.slice(key.indexOf(' ') + 1).trim();
        const value = member[key];

        if (head === 'Name') {
            memberHead.innerHTML = value;
            let img;

            try {
                img = await createImage(`http://narutoql.s3.amazonaws.com/${value.split(' ')[0]}.jpg`);
            } catch (err) {
                img = await createImage('./image.jpg');
            } finally {
                memberImg.append(img);
            }

        }
        else if (head === 'Family') {
            const familyHTML = `<div class="family__member"> <h4 class="family__head"> Family : </h4></div>`;
            memberDetail.insertAdjacentHTML('beforeend', familyHTML);

            const familyMemberDetail = document.querySelector('.family__member');

            for (const i in value) {
                const detailHTML = `
                <div class="family__one__line"> 
                    <h4> ${i} : </h4> <span> ${value[i]} </span> 
                </div>`;
                familyMemberDetail.insertAdjacentHTML('beforeend', detailHTML);
            }
        }
        else {
            const detailHTML = `
                <div class="one__line"> 
                    <h4> ${head} : </h4> <span> ${value} </span> 
                </div>`;
            memberDetail.insertAdjacentHTML('beforeend', detailHTML)
        }
    }

    containerMemberDetail.classList.remove('hidden');
}

//// Async Await

const getAllClanAsync = async function () {
    containerError.classList.add('hidden');
    try {
        const response = await fetch('https://naruto-database.p.rapidapi.com/clan', options);
        const res = await response.json();
        const data = Object.values(res[0]);

        document.querySelector('.clans').classList.remove('hidden');
        renderClan(data);
    } catch (err) {
        renderError(err.message)
    }
}

const getClanMembersAsync = async function (clan) {
    try {
        const response = await fetch(`https://naruto-database.p.rapidapi.com/clan?name=${clan}`, options);
        const res = await response.json();
        currentClan = res;
        if (res.length === 0) throw new Error(`${clan} Clan not found`);

        const data = res.map(r => {
            if (r['1. Name']) return r['1. Name']
            else return r['1.  Name']
        });
        renderClanMember(data);
    } catch (err) {
        renderError(err.message);
    }
}

getAllClanAsync();

containerClan.addEventListener('click', function (e) {
    containerError.classList.add('hidden');
    mainClanMember.classList.add('hidden');
    containerMemberDetail.classList.add('hidden');
    containerMemberDetail.innerHTML = '';
    containerClanMember.innerHTML = '';

    members = [];

    if (!e.target.classList.contains('clan_name')) return;

    clanLoader.classList.remove('hidden');

    getClanMembersAsync(e.target.dataset.clan);
});

containerClanMember.addEventListener('click', function (e) {

    containerError.classList.add('hidden');

    if (!e.target.classList.contains('clan_member')) return;
    const index = e.target.dataset.member;

    if (members.includes(index)) return;

    members.push(index);
    renderMemberDetail(currentClan[index])
});



/*
//// Using fetch and then 
const getJSON = function (url, errMessage = 'Something went wrong!') {

    return fetch(url, options)
        .then(response => {
            if (!response.ok) throw new Error(errMessage);
            return response.json();
        })
        .catch(err => renderError(err.message))
        .finally(() => console.log('fetch data done'))
}

const getData = function () {
    containerError.classList.add('hidden');

    getJSON('https://naruto-database.p.rapidapi.com/clan')
        .then(res => {
            const data = Object.values(res[0]);
            document.querySelector('.clans').classList.remove('hidden')
            renderClan(data);
        })
        
}

const getClanMem = function (clan) {
    getJSON(`https://naruto-database.p.rapidapi.com/clan?name=${clan}`)
        .then((res) => {
            currentClan = res;
            if (res.length === 0) throw new Error(`${clan} Clan not found`);

            const data = res.map(r => {
                if (r['1. Name']) return r['1. Name']
                else return r['1.  Name']
            });
            renderClanMember(data);
        })
}

getData();



////create image using fetch and then
 
// createImage(`http://narutoql.s3.amazonaws.com/${value.split(' ')[0]}.jpg`)
//     .then((res) => memberImg.append(res))
//     .catch(err => {
//         createImage('./image.jpg')
//             .then((res) => memberImg.append(res))
//     })

*/
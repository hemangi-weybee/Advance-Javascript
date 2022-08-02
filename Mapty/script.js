'use strict';

// Application Architecture
const form = document.querySelector('.form');
const containerEntries = document.querySelector('.entries');
const inputType = document.querySelector('.form__input--type');
const inputPlace = document.querySelector('.form__input--place');
const inputPrice = document.querySelector('.form__input--price');
const inputRating = document.querySelector('.form__input--rating');
const inputItems = document.querySelector('.form__input--items');
const inputMessage = document.querySelector('.form__input--message');
const btnDelete = document.querySelector('.btn__delete');
const allEntries = document.querySelector('.all__entries');
const selectSort = document.querySelector('.sort__entries');

class Entry {
    type;
    date = new Date();
    id = (Date.now() + '').slice(-10);
    clicks = 0;

    constructor(place, coords, price, rating) {
        this.place = place;
        this.coords = coords; //[lat, lng]
        this.price = price; //in RS.
        this.rating = rating;
    }

    _setDescription() {
        // prettier-ignore
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        this.description = `${this.type === 'food' ? '🍽' : '📍'} ${this.place}`
        this.dateDesc = `${months[this.date.getMonth()]} ${this.date.getDate()}`
    }

    click() {
        this.clicks++;
    }

    setMarker(marker){
        this.marker = marker;
    }
}

class Food extends Entry {
    type = 'food';
    constructor(place, coords, price, rating, items) {
        super(place, coords, price, rating);
        this.items = items;
        this.calcTotal();
        this._setDescription();
    }

    calcTotal() {
        this.total = this.price * this.items;
        return this.total;
    }

    setMarker(marker){
        this.marker = marker;
        return this.marker;
    }

}

class Other extends Entry {
    type = 'other';

    constructor(place, coords, price, rating, message) {
        super(place, coords, price, rating);
        this.message = message;
        this.calcTotal();
        this._setDescription();
    }

    calcTotal() {
        this.total = this.price;
        return this.total;
    }

    setMarker(marker){
        this.marker = marker;
        return this.marker;
    }
}

class App {
    #mapZoomLevel = 17;
    #map;
    #mapEvent;
    #entries = [];
    #selectedEntries = new Set();
    #markers = []

    constructor() {
        this._getPosition();

        //Get data from local storage
        this._getLocalStorage()
        //Attach Event Handlers
        form.addEventListener('submit', this._newEntry.bind(this))
        inputType.addEventListener('change', this._toogleField);
        containerEntries.addEventListener('click', this._moveToPopup.bind(this));
        containerEntries.addEventListener('click', this._selectEntry.bind(this));
        btnDelete.addEventListener('click', this._deleteEntry.bind(this));
        selectSort.addEventListener('change', this._sortEntries.bind(this));
    }

    _getPosition() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                this._loadMap.bind(this),
                function error() {
                    alert('Could not get your position');
                });
        }
    }

    _loadMap(position) {
        const { latitude } = position.coords;
        const { longitude } = position.coords;

        const coords = [latitude, longitude];

        this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

        /* Google Map */
        L.tileLayer('http://{s}.google.com/vt?lyrs=,m&x={x}&y={y}&z={z}', {
            maxZoom: 25,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
        }).addTo(this.#map);

        // L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        //     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        // }).addTo(this.#map);

        if(this.#entries) {
            this.#entries.forEach(entry => {
                this._renderEntryMarker(entry);
            });
        }

        this.#map.on('click', this._showForm.bind(this));

    }

    _showForm(mapE) {
        form.classList.remove('hidden');
        inputPlace.focus();
        this.#mapEvent = mapE;
    }

    _hideForm() {
        //Clear input fields
        inputPlace.value = inputPrice.value = inputRating.value = inputItems.value = inputMessage.value = '';

        form.style.display = 'none';
        form.classList.add('hidden');
        setTimeout(() => form.style.display = 'grid', 1000);
    }

    _toogleField() {
        inputMessage.closest('.form__row').classList.toggle('form__row--hidden');
        inputItems.closest('.form__row').classList.toggle('form__row--hidden');

        inputPlace.value = inputPrice.value = inputRating.value = inputItems.value = inputMessage.value = '';
    }

    _newEntry(e) {
        const validInputs = (...inputs) => inputs.every(i => Number.isFinite(i));
        const allPositive = (...inputs) => inputs.every(i => i > 0);

        e.preventDefault();

        //Get Data from the form
        const place = inputPlace.value.trim();
        const type = inputType.value;
        const price = +inputPrice.value;
        const rating = +inputRating.value;

        let entry;
        const { lat, lng } = this.#mapEvent.latlng;

        // If Entry is Food, Create Food Object
        if (type === 'food') {
            const items = +inputItems.value;

            // Check if Data is valid
            if (!validInputs(price, rating, items) || !allPositive(price, rating, items) || place === '')
                return alert("Inputs can't be empty and must be Positive Number ");

            entry = new Food(place, [lat, lng], price, rating, items);

        }

        // If Entry is Other, Create Other Object
        if (type === 'other') {
            const message = inputMessage.value.trim();

            if (!validInputs(price, rating) || place === '' || message === '')
                return alert("Inputs can't be empty and Price and Rating must be Positive Number");

            entry = new Other(place, [lat, lng], price, rating, message);
        }
        // Add new object to entry array
        this.#entries.push(entry);

        //Render the marker
        this._renderEntryMarker(entry);

        //Render Workout List
        this._renderEntry(entry);

        // Hide form + clear inputs
        this._hideForm();

        //Set Local Storage
        this._setLocalStorage();
    }

    _renderEntry(entry) {
        // this.#entries.forEach()
        const entryHTML = `
            <li class="entry entry--${entry.type}" data-id="${entry.id}">
            <div class="entry__control">
                <input class="chk__control" type="checkbox" name="chk"> 
                <button class="btn__edit"></button>
            </div>
            <div class="details">
                <div class="entry__title">
                    <h3>${entry.description}</h3>  
                    <h3>${entry.dateDesc}</h3>
                </div>
                <div class="entry__details">
                    <span class="entry__icon">💸</span>
                    <span class="entry__value">${entry.price}</span>
                    <span class="entry__unit">₨</span>
                </div>
                <div class="entry__details">
                    <span class="entry__icon">➕</span>
                    <span class="entry__value">${entry.total}</span>
                    <span class="entry__unit">₨</span>
                </div>
                <div class="entry__details">
                    <span class="entry__icon">⭐</span>
                    <span class="entry__value">${entry.rating}</span>
                    <span class="entry__unit">Points</span>
                </div>
                <div class="entry__details">
                    <span class="entry__icon"> ${entry.type === 'food' ? '📦' : '📑'} </span>
                    <span class="entry__value">${entry.type === 'food' ? entry.items : entry.message}</span>
                    <span class="entry__unit">${entry.type === 'food' ? 'Items' : ''}</span>
                </div>
            </div>
            </li>`;

        allEntries.insertAdjacentHTML('beforeend', entryHTML);
    }

    _renderEntryMarker(entry) {
        const foodIcon = L.icon({
            iconUrl: 'food.png',
            iconSize: [50],
            iconAnchor: [23,0],
            popupAnchor: [0,5],
        });

        const otherIcon = L.icon({
            iconUrl: 'other.png',
            iconSize: [40],
            iconAnchor: [20],
            popupAnchor: [0,5],
        });

        const marker = L.marker(entry.coords, {icon: entry.type === 'food' ? foodIcon : otherIcon})
            .addTo(this.#map)
            .bindPopup(L.popup({
                maxWidth: 250,
                minWidth: 100,
                autoClose: false,
                closeOnClick: false,
                className: `${entry.type}-popup`
            }))
            .setPopupContent(`${entry.description} on ${entry.dateDesc}`)
            .openPopup();


        this.#markers.push({id: entry.id, marker: marker})

    }

    _moveToPopup(e) {
        const entryEl = e.target.closest('.entry');

        if (!entryEl) return;

        const entry = this.#entries.find(e => e.id === entryEl.dataset.id)

        this.#map.setView(entry.coords, this.#mapZoomLevel, {
            animate: true,
            pan: {
                duration: 1
            }
        });

        //Public interface
        // entry.click();
    }

    _setLocalStorage() {
        localStorage.setItem('entries', JSON.stringify(this.#entries));
    }

    _getLocalStorage() {
        const data = JSON.parse(localStorage.getItem('entries'))

        if (!data) return;
        
        this.#entries = [];

        data.forEach(entry => {
            let e;
            if(entry.type === 'food') 
                e = new Food(entry.place, entry.coords, entry.price, entry.rating, entry.items)
            
            if(entry.type === 'other')
                e = new Other(entry.place, entry.coords, entry.price, entry.rating, entry.message)

            e.date = entry.date;
            e.dateDesc = entry.dateDesc;
            e.description = entry.description;
            e.id = entry.id

            this.#entries.push(e);
        });

        if(this.#entries){
            allEntries.innerHTML = '';
            this.#entries.forEach(entry => {
                this._renderEntry(entry);
            });
        }
    }

    // _getLocalStorage() {
    //     const data = JSON.parse(localStorage.getItem('entries'))

    //     if (!data) return;

    //     this.#entries = data;

    //     this.#entries.forEach(entry => {
    //         this._renderEntry(entry);
    //     });
    // }

    _selectEntry(e) {
        const entryEl = e.target.closest('.entry');
        if (!entryEl) return;
    
        if(entryEl.firstElementChild.firstElementChild.classList.contains('chk__control')){
            if(entryEl.firstElementChild.firstElementChild.checked)
                this.#selectedEntries.add(entryEl.dataset.id)

            if(!entryEl.firstElementChild.firstElementChild.checked){
                if(this.#selectedEntries.has(entryEl.dataset.id))
                    this.#selectedEntries.delete(entryEl.dataset.id)
            }
        }
    }

    _deleteEntry() {
        if(!this.#selectedEntries) return;

        this.#selectedEntries.forEach(id => {
            const markerIndex = this.#markers.findIndex(e => e.id === id);
            this.#markers[markerIndex].marker.remove();
            this.#markers.splice(markerIndex,1);
            const index = this.#entries.findIndex(e => e.id === id);
            this.#entries.splice(index,1);
        })
        
        if(this.#entries){
            allEntries.innerHTML = '';
            this.#entries.forEach(entry => {
                this._renderEntry(entry);
                this._renderEntryMarker(entry);
            });
        }

        this._setLocalStorage();
    }

    _sortEntries() {
        const opt = selectSort.options[selectSort.selectedIndex].value;
    
        let newTasks;
        switch (Number(opt)) {
            case 1: {
                newTasks = this.#entries.slice().sort((a, b) => a.place.toUpperCase().localeCompare(b.place.toUpperCase(), 'en', { numeric: true }));
                break;
            }
            case 2: {
                newTasks = this.#entries.slice().sort((a, b) => a.place.toUpperCase().localeCompare(b.place.toUpperCase(), 'en', { numeric: true })).reverse();
                break;
            }
            case 3: {
                newTasks = this.#entries.slice().sort((a, b) => a.price - b.price);
                break;
            }
            case 4: {
                newTasks = this.#entries.slice().sort((a, b) => a.rating - b.rating);
                break;
            }
            default: newTasks = this.#entries.slice();
        }

        if(newTasks){
            allEntries.innerHTML = '';
            newTasks.forEach(entry => {
                this._renderEntry(entry);
            });
        }
    };

    reset() {
        localStorage.removeItem('entries');
        location.reload();
    }

}

const app = new App();

'use strict' 

////selecting Elements

const modal = document.querySelector(`.modal`) 
const overlay = document.querySelector(`.overlay`) 
const btnCloseModal = document.querySelector(`.btn--close-modal`) 
const btnsOpenModal = document.querySelectorAll(`.btn--show-modal`) 
const header = document.querySelector(`.header`) 
const allSections = document.querySelectorAll(`.section`) 
const allButtons = document.getElementsByTagName(`button`) 
const btnScrollTo = document.querySelector(`.btn--scroll-to`)
const section1 = document.querySelector(`#section--1`)
const nav = document.querySelector(`.nav`)
const tabs = document.querySelectorAll(`.operations__tab`)
const tabsContainer = document.querySelector(`.operations__tab-container`)
const tabsContent = document.querySelectorAll(`.operations__content`)
const allSlides = document.querySelectorAll(`.slide`)
const slider = document.querySelector(`.slider`)
const dotsContainer = document.querySelector(`.dots`) 

///////////////////////////////////////
//// Modal window
const openModal = function (e) {
  e.preventDefault() 
  modal.classList.remove('hidden') 
  overlay.classList.remove('hidden') 
} 

const closeModal = function () {
  modal.classList.add('hidden') 
  overlay.classList.add('hidden') 
} 

btnsOpenModal.forEach(btn => btn.addEventListener('click', openModal)) 

btnCloseModal.addEventListener('click', closeModal) 
overlay.addEventListener('click', closeModal) 

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal() 
  }
}) 


//////////////////////////////////////
//// Page navigation

btnScrollTo.addEventListener('click', function(e){
  section1.scrollIntoView({behavior: 'smooth'})
})

///////////////////////
//// Delegation

document.querySelector('.nav__links').addEventListener('click', function (e) {
  e.preventDefault() 
  if(e.target.classList.contains('nav__link') && e.target.classList.contains('nav__link--btn') === false){
    const id = e.target.getAttribute('href') 
    console.log(id) 
    document.querySelector(id).scrollIntoView({behavior :'smooth'}) 
  }
})


////////////////////////////////
//// Tab component

tabsContainer.addEventListener('click', function(e){
  const clicked = e.target.closest('.operations__tab')

  //// Guard clause
  if(!clicked) return

  tabs.forEach(t => t.classList.remove('operations__tab--active'))
  clicked.classList.add('operations__tab--active')

  ////Activate content
  tabsContent.forEach(tc => tc.classList.remove('operations__content--active'))
  document.querySelector(`.operations__content--${clicked.dataset.tab}`).classList.add('operations__content--active')
})


///////////////////////////////////////
//// menu fade animation

const handleNavHover = function(e) {
  if(e.target.classList.contains('nav__link')){
    const link = e.target
    const siblings = link.closest('.nav').querySelectorAll('.nav__link')
    const logo = link.closest('.nav').querySelector('img')

    siblings.forEach(el => {
      if(el !== link) el.style.opacity = this
    })

    logo.style.opacity = this
  }
}

nav.addEventListener('mouseover', handleNavHover.bind(0.4))

nav.addEventListener('mouseout', handleNavHover.bind(1))

/////////////////////////////////////////////////////
//// sticky navigation : Intersection observer API

const stickyNav = function(entries) {
  const [entry] = entries
  // console.log(entry)

  if(!entry.isIntersecting)
    nav.classList.add('sticky')
  else  
    nav.classList.remove('sticky')
}

const headerOberserver = new IntersectionObserver(
  stickyNav, {
    root: null,
    threshold: 0,
    rootMargin: `-${nav.getBoundingClientRect().height}px`
  })

headerOberserver.observe(header)


////////////////////////////////////////////////
//// Reveal sections

const revealSection = function(entries, observer){
  const [entry] = entries

  if(!entry.isIntersecting) return
  
  entry.target.classList.remove('section--hidden')
  observer.unobserve(entry.target)
}

const sectionOberserver = new IntersectionObserver(
  revealSection, {
    root: null,
    threshold: 0.15
  }
)

allSections.forEach(function(section) {
  sectionOberserver.observe(section)
  section.classList.add('section--hidden')
})

///////////////////////////////////////////////////////
//// Lazy loading 

const imgSrc = document.querySelectorAll('img[data-src]')

const lazyLoadImg = function(entries, observer){
  const [entry] = entries

  // console.log(entry)
  if(!entry.isIntersecting) return
  entry.target.src = entry.target.dataset.src
  entry.target.classList.remove('lazy-img')

  ////////This seems like loading is taking too much time 
  // entry.target.addEventListener('load', function(){
  //   entry.target.classList.remove('lazy-img')
  // })

  observer.unobserve(entry.target)
}

const imgObserver = new IntersectionObserver(
  lazyLoadImg, {
    root: null,
    threshold: 0.6

    /////other way to observe img after it's half visible
    // threshold: 0,
    // rootMargin: '200px'
  }
)

imgSrc.forEach(i => imgObserver.observe(i))

///////////////////////////////////////////////////
///// Slider

const btnLeft = document.querySelector(`.slider__btn--left`)
const btnRight = document.querySelector(`.slider__btn--right`)

let curSlide = 0, maxSlide = allSlides.length - 1

const createDots = function() {
  allSlides.forEach((_,i) => 
    dotsContainer.insertAdjacentHTML('beforeend',
    `<button class="dots__dot" data-slide="${i}">`)
  )
}

const activateDot = function(slide) {
  document.querySelectorAll(`.dots__dot`).forEach((d)=> {
    d.classList.remove('dots__dot--active')
  })

  document.querySelector(`.dots__dot[data-slide="${slide}"]`).classList.add('dots__dot--active')
}

const goToSlide = function(slide){
  allSlides.forEach((s,i) => s.style.transform = `translateX(${(i - slide)*100}%)`)
  activateDot(slide)
}

const nextSlide = function() {
  curSlide === maxSlide ? curSlide = 0 :  curSlide++
  goToSlide(curSlide)
}

const prevSlide = function() {
  curSlide === 0 ? curSlide = maxSlide : curSlide --
  goToSlide(curSlide)
}

dotsContainer.addEventListener('click', function(e){
  if(e.target.classList.contains('dots__dot')) {
    goToSlide(e.target.dataset.slide)
  }
})

btnRight.addEventListener('click', nextSlide)
btnLeft.addEventListener('click', prevSlide)

document.addEventListener('keydown', function(e){
  if(e.key === 'ArrowLeft') prevSlide()
  if(e.key === 'ArrowRight') nextSlide()
})

createDots()
goToSlide(0)


/*

////////////////////////////////////////
//// Sticky navigation

const initialCoords = section1.getBoundingClientRect()
console.log(initialCoords)

window.addEventListener('scroll', function(){
  if (window.scrollY > initialCoords.top) 
    nav.classList.add('sticky')  
  else
    nav.classList.remove('sticky')
})

/////////////////////////////////////////
//// Page Navigation

// document.querySelectorAll('.nav__link').forEach( link => 
//   link.addEventListener('click', function (e) {
//     e.preventDefault() 
//     const id = this.getAttribute('href') 
//     // console.log(id) 

//     document.querySelector(id).scrollIntoView({behavior :'smooth'}) 
// }))

////////////////////////////////////
////inserting elements

const message = document.createElement('div') 
message.classList.add('cookie-message') 
// message.textContent = 'We use cookied for improved functionaliaty and anlytics' 
message.innerHTML = 
`We use cookied for improved functionaliaty and anlytics
<button class="btn btn--close-cookie"> Got it!` 


header.prepend(message) 
// header.append(message) 
// header.append(message.cloneNode(true)) 

// header.before(message) 
// header.after(message) 


//////////////////////////////////////////
//// Delete Element

document.querySelector('.btn--close-cookie').addEventListener('click', function(){
  message.remove() 
  // message.parentElement.removeChild(message) 
})

/////////////////////////////////////////
//// Styling

message.style.backgroundColor = '#37383d' 

message.style.width = '120%'
console.log(message.style.backgroundColor) 

message.style.height = Number.parseFloat(getComputedStyle(message).height, 10) + 40 + 'px' 
console.log(getComputedStyle(message).height) 

// document.documentElement.style.setProperty('--color-primary', 'orangered') 

/////////////////////////////////////////
//// Attribute

const logo = document.querySelector('.nav__logo')
console.log(logo.alt) 
console.log(logo.className) 
logo.alt = 'Beautiful logo' 
console.log(logo.alt) 

// non - standard
console.log(logo.getAttribute('designer')) 
logo.setAttribute('company', 'Bankist') 

console.log(logo.src) 
console.log(logo.getAttribute('src')) 


/////////////////////////////////////////
//// Data Attribute

console.log(logo.dataset.versionNumber) 

////////////////////////////////////////
//// Classes

logo.classList.add('c', 'j')
logo.classList.remove('c')
logo.classList.toggle('j')
console.log(logo.classList.contains('c')) 


////////////////////////////////////////
//// smooth scrolling

const btnScrollTo = document.querySelector('.btn--scroll-to')
const section1 = document.querySelector('#section--1')

btnScrollTo.addEventListener('click', function(e){
  // const s1coords = section1.getBoundingClientRect() 
  // console.log(s1coords) 

  // console.log(e.target.getBoundingClientRect()) 

  // console.log('window : ', window.pageXOffset, window.pageYOffset) 
  // console.log('document: ', document.documentElement.clientHeight, document.documentElement.clientWidth ) 

  // window.scrollTo({
  //   left: s1coords.left + window.pageXOffset, 
  //   top: s1coords.top + window.pageYOffset,
  //   behavior : 'smooth'
  // }) 

  section1.scrollIntoView({behavior: 'smooth'})
})


////////////////////////////////////////
//// Event Handler

const h1 = document.querySelector('h1')


const alertH1 = function (e) {
  console.log('add event listner') 
  
  // //eventshould call only once then use it like this
  // h1.removeEventListener('mouseenter', alertH1)
}

h1.addEventListener('mouseenter', alertH1)

setTimeout(() => h1.removeEventListener('mouseenter', alertH1), 5000)

// h1.onmouseleave = function () {
//   console.log('mouse leave') 
// } 



////////////////////////////////////////////
//// Event Bubbling

const randomInt = (min,max) => Math.floor(Math.random() * (max - min + 1 ) + min) 

const randomColor = () => `rgb(${randomInt(0,255)}, ${randomInt(0,255)}, ${randomInt(0,255)})` 

console.log(randomColor()) 

document.querySelector('.nav__link').addEventListener('click', function (e) {
  this.style.backgroundColor = randomColor() 
  // console.log(e.currentTarget === this) 

  //it will stop bubbling
  // e.stopPropagation()
})

document.querySelector('.nav__links').addEventListener('click', function (e) {
  this.style.backgroundColor = randomColor() 
  // console.log(e.currentTarget) 
})

document.querySelector('.nav').addEventListener('click', function (e) {
  this.style.backgroundColor = randomColor() 
  // console.log(e.currentTarget) 
}, true)


// console.clear()

const h1 = document.querySelector('h1')

///////////////////////////////////
//// Going Downwards: child

console.log(h1.childNodes) 
console.log(h1.children)   //works for only direct children

console.log(h1.firstElementChild.style.color = 'white') 
console.log(h1.lastElementChild.style.color = 'orangered') 


///////////////////////////////
//// going upward: parent

console.log(h1.parentNode) 
console.log(h1.parentElement) 

console.log(h1.closest('.header')) 
console.log(h1.closest('h1')) 

h1.closest('.header').style.background = 'var(--gradient-secondary)' 
h1.closest('h1').style.background = 'var(--gradient-primary)' 

////////////////////////////////
//// going side: sibling

console.log(h1.previousSibling) 
console.log(h1.nextSibling) 

console.log(h1.previousElementSibling) 
console.log(h1.nextElementSibling) 

console.log(h1.parentElement.children) 
[...h1.parentElement.children].forEach(function (el) {
  if(el !== h1) el.style.transform = 'scale(0.5)'
})

/////////////////////////////////////////////////////
//// sticky navigation : Intersection observer API

// const obsCallback = function(entries, observer) {
//   entries.forEach(entry => {
//     console.log(entry)
//   })
// }

// const obsOptions = {
//   root: null,
//   threshold: [0, 0.2],
  
// }

// const oberserver = new IntersectionObserver(obsCallback, obsOptions)
// oberserver.observe(section1)

*/

////////////////////////////////////////////////////
///// DOM EVENTS

document.addEventListener('DOMContentLoaded', (e)=> console.log('DOMContentLoaded',e))

window.addEventListener('load', (e)=> console.log('fully loaded',e))

// window.addEventListener('beforeunload', function(e) {
//   e.preventDefault()
//   console.log('beforeunload', e)
//   e.returnValue = ''
// })
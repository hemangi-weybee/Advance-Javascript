'use strict';


//// Constructor

// const Person = function(firstName, birthYear){
//     this.firstName = firstName
//     this.birthYear = birthYear

//     ////Never do this way
//     // this.calcAge = function (){
//     //     console.log(2022-this.birthYear)
//     // }
// }

// const user1 = new Person('Hemangi', 2001)
// console.log(user1)

// const user2 = new Person('Nirmal', 2000)
// const user3 = new Person('Jonas', 1991)

// console.log(user2, user3)

// console.log(user1 instanceof Person)
// console.log(Person.prototype)

// Person.prototype.calcAge = function () {
//     return (2022-this.birthYear)
// }

// console.log(user1.firstName, user1.calcAge())
// console.log(user2.firstName, user2.calcAge())
// console.log(user3.firstName, user3.calcAge())

// console.log(user1.__proto__)
// console.log(user1.__proto__ === Person.prototype)
// console.log(Person.__proto__ === Person.prototype)

// Person.prototype.species = 'Homo Sapiens'
// console.log(user1.species, user2.species)

// console.log(user1.hasOwnProperty('firstName'))
// console.log(user1.hasOwnProperty('species'))

// //person.prototype
// console.log(user1.__proto__)

// //Person.__proto__
// console.log(user1.__proto__.__proto__)

// //Object.__proto__
// console.log(user1.__proto__.__proto__.__proto__)

// console.dir(Person.prototype.constructor)

// const arr = [1,2,3,4,1,5,2,3]

// Array.prototype.unique = function() {
//     return [...new Set(this)]
// }

// console.log(arr.unique())

// const h1 = document.querySelector(`h1`)
// console.dir(h1)

/////////////////////////////////////////////////////
//// ES6 Classes

class PersonCl {

    static count = 0

    constructor(fullName, birthYear) {
        this.fullName = fullName
        this.birthYear = birthYear
        PersonCl.count++
    }    

    /////////// Instance Methods
    //// set property that already exists 
    set fullName(name) {
        if(name.includes(' ')) this._fullName = name
        else alert(`${name} is not full name`)
    }

    get fullName() {
        return this._fullName
    }

    //// Method will be added to .prototype property
    calcAge() {
        return 2022-this.birthYear
    }

    get age(){
        return 2022-this.birthYear
    }

    /////////// Static methods 
    static countUser() {
        return this.count
    }

    demo() {
        return PersonCl.count
    }
}

PersonCl.prototype.greet = function() {
    return `Hello ! ${this.fullName}`
}

const jessica = new PersonCl('Jessica Davis', 1996)
console.log(jessica)
console.log(jessica.greet())
console.log(jessica.calcAge())
console.log(jessica.age)
console.log(jessica.__proto__ === PersonCl.prototype)

const jes = new PersonCl('Jes Davis', 1996)
console.log(PersonCl.countUser())

console.log(jessica.demo())

const account = {
    owner: 'Jonas',
    movements: [50,500,40,300,120],

    get latest() {
        return this.movements.slice(-1).pop()
    },

    set latest(mov) {
        this.movements.push(mov)
    }
}

console.log(account)
console.log(account.latest)
account.latest = 10
console.log(account.latest)



// const PersonProto = {
//     calcAge() {
//         return 2022-this.birthYear
//     },

//     init(name, birthYear) {
//         this.name = name
//         this.birthYear = birthYear
//     }
// }

// const steve = Object.create(PersonProto)
// console.log(steve)
// steve.name = 'steve'
// steve.birthYear = 2002
// console.log(steve.calcAge())
// console.log(steve.__proto__)

// const sarah = Object.create(PersonProto)
// sarah.init('Sarah', 2004)
// console.log(sarah.calcAge())

///////////////////////////////////////////////
//// Inheritance between classes or Delegation 


const Person = function(firstName, birthYear){
    this.firstName = firstName
    this.birthYear = birthYear
}

Person.prototype.calcAge = function () {
    return (2022-this.birthYear)
}

const Student = function (firstName, birthYear, course) {
    Person.call(this, firstName, birthYear)
    this.course = course
}
Student.prototype = Object.create(Person.prototype)

Student.prototype.introduce = function() {
    return `Myself ${this.firstName}. I'm studying ${this.course}`
}

const mike = new Student('mike', 2001 ,'CE')
console.log(mike.__proto__)
console.log(mike.__proto__.__proto__)
console.log(mike.__proto__.__proto__.__proto__)
console.log(mike.__proto__.__proto__.__proto__.__proto__)

Student.prototype.constructor = Student

console.log(Student.prototype.constructor)
console.log(mike.introduce())
console.log(mike.calcAge())

/////////////////////////////////////////
//// Inheritance using ES6 classes


class StudentCl extends PersonCl {
    constructor(fullName, birthYear, course) {
        super(fullName, birthYear)
        this.course = course
    }
    
    introduce () {
        return `Myself ${this.fullName}. I'm studying ${this.course}`
    }
}

console.log(PersonCl.countUser())

const martha = new StudentCl ('Martha Davis', 2000, 'CE')
console.log(martha)
console.log(martha.calcAge())
console.log(martha.introduce())
console.log(StudentCl.countUser())

///////////////////////////////////////////////
//// Inheritance using Object.create() 

const PersonProto = {
    calcAge() {
        return 2022-this.birthYear
    },

    init(firstName, birthYear) {
        this.firstName = firstName
        this.birthYear = birthYear
    }
}

const StudentProto = Object.create(PersonProto)

StudentProto.init = function(firstName, birthYear, course) {
    this.firstName = firstName
    this.birthYear = birthYear
    this.course = course
}

StudentProto.introduce = function() {
    return `Myself ${this.firstName}. I'm studying ${this.course}`
}

const jane = Object.create(StudentProto)
jane.init('Jane', 2000, 'CE')
console.log(jane.calcAge())
console.log(jane.introduce())

/////////////////////////////////////////////////////
//// Bankist example


class Account {

    //// 1) public fields (Instances)
    locale = navigator.language
    
    //// 2) Private fields
    #movements = []
    #pin
    
    constructor(owner, currency, pin ) {
        this.owner = owner
        this.currency = currency
        this.#pin = pin

        ////Protected property
        // this.locale = navigator.language
        // this._movements = []

        console.log(`Thanks for opening an account, ${this.owner}`)
    }

    //// 3) Private Methods
    #approveLoan(amount){
        const balance = this.#movements.reduce((acc,curr) => curr + acc, 0)
        if(balance > amount) return true  
        else return false
    }

    //// 4) Public Methods

    getMovements() {
        return this.#movements
    }

    deposite(amount) {
        this.#movements.push(amount)
        return this
    }

    withdrawl(amount) {
        this.deposite(-amount)
        return this
    }

    requestLoan(amount){
        if(this.#approveLoan(amount)) 
            console.log(`Loan approved of amount : ${amount} ${this.currency}`)
        else
            console.log(`Sorry! Loan didn't approve`) 

        return this
    }
}

const acc1 = new Account('Jonas', 'EUR', 1111)

acc1.deposite(500)
acc1.withdrawl(100)
console.log(acc1)

console.log(acc1.getMovements())
console.log(acc1.requestLoan(1000))

console.log(acc1.deposite(1000).deposite(400).withdrawl(300).requestLoan(1000).getMovements()) 
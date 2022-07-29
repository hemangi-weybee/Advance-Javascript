'use strict'

/* Challenge 1 */

const Car = function (make, speed) {
    this.make = make
    this.speed = speed
}

Car.prototype.accelerate = function () {
    this.speed += 10
    return `${this.make} : ${this.speed} km/h`
}


Car.prototype.brake = function () {
    this.speed -= 5
    return `${this.make} : ${this.speed} km/h`
}

const car1 = new Car('BMW', 120)
const car2 = new Car('Mercedes', 95)

console.log(car1)
console.log(car2)

console.log(car1.accelerate())
console.log(car1.accelerate())
console.log(car1.brake())
console.log(car1.accelerate())


console.log(car2.accelerate())
console.log(car2.brake())
console.log(car2.brake())
console.log(car2.brake())



/* Coding Challenge 2 */

class CarCl {
    constructor(make, speed) {
        this.make = make
        this.speed = speed
    }

    accelerate() {
        this.speed += 10
        return `${this.make} : ${this.speed} km/h`
    }

    brake() {
        this.speed -= 5
        return `${this.make} : ${this.speed} km/h`
    }

    get speedUS() {
        return this.speed / 1.6
    }

    set speedUS(speed) {
        this.speed = speed * 1.6
    }
}


const ford = new CarCl('Ford', 120)
console.log(ford)
console.log(`${ford.speedUS} mi/h`)
console.log(ford.accelerate())
console.log(ford.brake())
console.log(ford.accelerate())
console.log(`${ford.speed} km/h`)
ford.speedUS = 75
console.log(`${ford.speed} km/h`)




/* Coding Challenge 3 */

const CarEV = function (make, speed, currentBattery) {
    Car.call(this, make, speed)
    this.currentBattery = currentBattery
}

CarEV.prototype = Object.create(Car.prototype)

CarEV.prototype.accelerate = function () {
    this.speed += 20
    this.currentBattery -= 1
    return `${this.make} going at ${this.speed} km/h, with charge of ${this.currentBattery}%`
}

CarEV.prototype.chargeBattery = function (currentBattery) {
    this.currentBattery = currentBattery
}

const tesla = new CarEV('Tesla', 120, 23);
console.log(tesla)
console.log(tesla.accelerate())
console.log(tesla.brake())
tesla.chargeBattery(90)
console.log(tesla.currentBattery)


/* Coding Challenge 4 */

class CarEVCl extends CarCl {
    #currentBattery

    constructor(make, speed, currentBattery) {
        super(make, speed)
        this.#currentBattery = currentBattery
    }

    accelerate() {
        this.speed += 20
        this.#currentBattery--
        console.log(`${this.make} going at ${this.speed} km/h, with charge of ${this.#currentBattery}%`)
        return this
    }

    brake() {
        this.speed -= 5
        console.log(`${this.make} going at ${this.speed} km/h, with charge of ${this.#currentBattery}%`)
        return this
    }

    getChargeBattery() {
        return this.#currentBattery
    }

    chargeBattery(currentBattery) {
        this.#currentBattery = currentBattery
        return this
    }
}

const rivian = new CarEVCl('Rivian', 120, 23)
console.log(rivian)

rivian.accelerate()
    .accelerate()
    .brake()
    .accelerate()
    .chargeBattery(50)
    .accelerate()

console.log(rivian.speedUS)
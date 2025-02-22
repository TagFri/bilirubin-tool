import {Lab} from "./lab.js";
import {myChart, updateChildGraph, updateTransfusionLimit} from "./graph.js"
import {timeDate, validateInputGroup} from "./validation.js"
import {updateAdvice} from "./advice.js";
import {updateCount} from "./index.js";

export {child, saveChild}

let child = null

class Child {
    constructor (birthWeight, date, time, gestationWeek) {
        this.birthWeight = birthWeight
        this.date = date
        this.time = time
        this.gestationWeek = gestationWeek
        this.timeDate = timeDate(this.date, this.time)
    }

    getLightLimit() {
            if (this.birthWeight < 1000) {
                return {
                    "label": "under 1000g",
                    "data": {1: 100, 4: 150, 10: 150},
                    "slope": (150 - 100) / (4 - 1)
                }
            } else if (this.birthWeight < 1500) {
                return {
                    "label": "under 1500g",
                    "data": {1: 125, 4: 200, 10: 200},
                    "slope": (200 - 125) / (4 - 1)
                }
            } else if (this.birthWeight < 2500) {
                return {
                    "label": "under 2500g",
                    "data": {1: 150, 4: 250, 10: 250},
                    "slope": (250 - 150) / (4 - 1)
                }
            } else if (this.birthWeight >= 2500 && this.gestationWeek < 37) {
                return {
                    "label": "over 2500g + GA <37",
                    "data": {1: 150, 3: 300, 10: 300},
                    "slope": (300 - 150) / (3 - 1)
                }
            } else if (this.birthWeight >= 2500 && this.gestationWeek >= 37) {
                return {
                    "label": "over 2500g + GA >=37",
                    "data": {1: 175, 3: 350, 10: 350},
                    "slope": (350 - 175) / (3 - 1)
                }
            } else {
                console.log("ERROR: No lightlimit found")
            }
        }
}

function saveChild() {
    let validation = validateInputGroup(".child-input")
    let validatedInputs = validation[0]
    let errorCounter = validation[1]

    //Check if child as whole is valid
    if (errorCounter == 0) {
        //Create child object
        child = new Child(
            validatedInputs[0], // birth.weight
            validatedInputs[1], // date
            validatedInputs[2], // time
            validatedInputs[3]) // Gestasional Week
        //Show complete icon on box
        document.getElementById("complete-icon").classList.remove("hidden")
        //Remove opacity on labs + graph
        toggleOpacity(false)
        //Create child graph
        updateChildGraph()
        //updateCount("addedChild")
        //Focus on lab-date
        document.getElementById("lab-date").focus()
        //If not valid = remove complete icon, turn on opacity, auto-focus on error input and remove graph
    } else {
        document.getElementById("complete-icon").classList.add("hidden") //Remove complete icon on box
        toggleOpacity(true) // Add opacity and disable lab inputs
        //todo focus on error-input
        //todo remove graphs
    }
    if (Lab.getNumberOfLabs() > 0) {
        updateAdvice()
    }
    if (myChart.data.datasets[3].data != []) {
        updateTransfusionLimit()
    }
}

//TOGGLE OPACITY
function toggleOpacity(boolean) {
    //True = enable opacity. False = disable opacity
    //Toggle inputs disabled
    const labInputs = [
        document.getElementById("lab-date"),
        document.getElementById("lab-time"),
        document.getElementById("bilirubin-value"),
        document.getElementById("add-lab")]
    for (const input of labInputs) {
        boolean? input.disabled = true : input.disabled = false
    }
    //Toggle container opacity
    if (boolean) {
        document.getElementById("lab-container").classList.add("opacity-container")
        document.getElementById("graph-container").classList.add("opacity-container")
        document.getElementById("advice-container").classList.add("opacity-container")
        document.getElementById("journal-container").classList.add("opacity-container")
    } else {
        document.getElementById("lab-container").classList.remove("opacity-container")
        document.getElementById("graph-container").classList.remove("opacity-container")
        if (Lab.getNumberOfLabs() > 0) {
            document.getElementById("advice-container").classList.remove("opacity-container")
            document.getElementById("journal-container").classList.remove("opacity-container")
        }
    }
}
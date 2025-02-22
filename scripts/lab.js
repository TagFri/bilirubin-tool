import {updateLabGraph, updateChildLightLimit, updateTransfusionLimit} from "./graph.js";
import {child} from "./child.js";
import {validateInputGroup, timeDate, errorMessages} from "./validation.js";
import {updateAdvice} from "./advice.js";
import {absolute2relativeDate, msToDay, updateCount, updateYaxis} from "./index.js";

export {Lab, saveLab}

//Labs for export
class Lab {
    static labs = []
    static extrapolationTime = null
    static getNumberOfLabs() {
        return this.labs.length
    }
    static getLabSlope() {
        if (this.getNumberOfLabs()>= 2) {
            let lab1 = this.labs[this.getNumberOfLabs() - 2]
            let lab2 = this.labs[this.getNumberOfLabs() - 1]
            // Slope = delta Y / delta X
            let slope = (lab2.bilirubin - lab1.bilirubin) / (msToDay(lab2.timeDate - lab1.timeDate))
            return slope
        } else {
            console.log("ERROR: Not enough labs to calculate slope")
        }
    }
    static getRelativeDate() {
        return absolute2relativeDate(timeDate)
    }
    constructor(bilirubin, time, date, year) {
        this.bilirubin = bilirubin
        this.time = time
        this.date = date
        this.timeDate = new Date(year, date[1] - 1, date[0], time[0], time[1], 0, 0)
        Lab.labs.push(this)
    }}

function saveLab() {
    //Validation function and variables
    let validation = validateInputGroup(".lab-input")
    let validatedMonth = validation[0][0][1]
    //console.log(`Validated month: ${validatedMonth}`)
    let validatedDay = validation[0][0][0]
    //console.log(`Validated day: ${validatedDay}`)
    let validatedHour = validation[0][1][0]
    //console.log(`Validated hour: ${validatedHour}`)
    let validatedMinute = validation[0][1][1]
    //console.log(`Validated minute: ${validatedMinute}`)
    let validatedBilirubin = validation[0][2]
    //console.log(`Validated bilirubin: ${validatedBilirubin}`)
    let errorCounter = validation[1]
    //Check if lab is complete
    if (errorCounter == 0) {
        let birthminute = child.timeDate.getMinutes()
        let birthhour = child.timeDate.getHours()
        let birthDay = child.timeDate.getDate()
        let birthMonth = child.timeDate.getMonth() + 1
        let birthYear = child.timeDate.getFullYear()
        let year = null
        if ((birthMonth + validatedMonth) % 12 <= 4 && birthMonth > validatedMonth) {
            year = birthYear +1
        } else {
            year = birthYear
        }
        //Calculate timedate variable
        let timeDate = new Date(year, validatedMonth - 1, validatedDay, validatedHour, validatedMinute, 0, 0)
        //Check that lab is taken after child is born
        if (timeDate < child.timeDate) {
            errorMessages("early-lab", false)
        } else {
            //Save lab in labs
            let lab = new Lab(
                //Bilirubin
                validatedBilirubin,
                //Date
                [validatedHour, validatedMinute],
                //Time
                [validatedDay, validatedMonth],
                year
                )
            //updateCount("addedLab")
            console.log("SAVED LAB")
            //Add lab object to lab collection
            Lab.labs = Lab.labs.sort((a, b) => a.timeDate - b.timeDate)
            //Sort collection on time taken
            //Remove error message, clear inputs, display labs and focus on lab date.
            errorMessages("early-lab", true)
            clearLabinput()
            displayLabs();
            updateLabGraph()
            updateChildLightLimit()
            updateTransfusionLimit()
            updateYaxis()
            updateAdvice()
            document.getElementById("advice-container").classList.remove("opacity-container")
            document.getElementById("journal-container").classList.remove("opacity-container")
            //extrapolationGraphing()
            document.getElementById("lab-date").focus()
        }
        //Lab is incomplete
    } else {
        //todo focus on error-input
    }
}

function clearLabinput() {
    //Clear input fields
    document.getElementById("bilirubin-value").value = ""
    document.getElementById("lab-date").value = ""
    document.getElementById("lab-time").value = ""
}

function displayLabs() {
    //REMOVE OLD LABS
    const labList = document.getElementById("lab-list")
    labList.innerHTML = ""
    //READD LABS
    for (const lab of Lab.labs) {
        ////Create each lab as LI
        const li = document.createElement("li")
        li.id = lab.timeDate
        li.classList.add("individual-lab")
        const button = document.createElement("button")
        button.classList.add("remove-lab")
        button.addEventListener("click", function (event) {
            removeLab(event.target)
        })
        const image = document.createElement("img")
        image.src = "./assets/icons/remove.svg"
        image.classList.add("individual-lab-remove")
        image.alt = "delete-icon"
        //Lab value
        const labValueElement = document.createElement('p')
        labValueElement.classList.add("semi-bold")
        labValueElement.innerHTML = lab.bilirubin
        //Lab date
        const labDateElement = document.createElement('p')
        labDateElement.innerHTML = lab.date[0].toString().padStart(2, "0") + "/" + lab.date[1].toString().padStart(2, "0")
        //Lab time
        const labTimeElement = document.createElement('p')
        labTimeElement.innerHTML = lab.time[0].toString().padStart(2, "0") + ":" + lab.time[1].toString().padStart(2, "0")

        //Append elements to each other
        button.appendChild(image)
        li.appendChild(button)
        li.appendChild(labValueElement)
        li.appendChild(labDateElement)
        li.appendChild(labTimeElement)
        labList.appendChild(li)
    }

}

function removeLab(targetButton) {
    //updateCount("removedLabs")
    //Remove from Labs array
    for (let i = 0; i < Lab.labs.length; i++) {
        //
        if (Lab.labs[i].timeDate == targetButton.parentElement.parentElement.id) {
            Lab.labs.splice(i, 1)
            break
        }
    }
    //Update HTML
    displayLabs()
    //Update Graph
    updateLabGraph()
    //Update transfusion graph
    updateTransfusionLimit()
    //update y-axis
    updateYaxis()
    //updateAdvice
    updateAdvice()
    if (Lab.getNumberOfLabs() == 0) {
        document.getElementById("advice-container").classList.add("opacity-container")
        document.getElementById("journal-container").classList.add("opacity-container")
    }
}
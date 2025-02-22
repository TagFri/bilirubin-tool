import {child} from "./child.js";
import {Lab} from "./lab.js"
export {validateInputGroup, timeDate, errorMessages, inputToInteger, inputValidation}

function validateInputGroup(classSelector) {
    let errorCounter = 0;
    let inputs = document.querySelectorAll(classSelector)
    let validatedInputs = []
    //Loop through all inputs
    for (const input of inputs) {
        //Get value and ID
        let inputID = input.id
        let inputValue = inputToInteger(input.value);
        //VALIDATION OF INPUT.
        if (inputValidation(inputID, inputValue)) {
            //Remove error message
            errorMessages(inputID, true)
            //Add validated input
            validatedInputs.push(inputValue)
        } else {
            //Add error message + error counter
            errorMessages(inputID, false)
            errorCounter +=1;
        }
    }
    return [validatedInputs, errorCounter]
}


//CREATE TIMEDATE FROM LOCAL DATE + TIME
function timeDate(date, time) {
    //Create current time
    const currentTime = new Date()
    //Set actural time as current year + date info
    let actualtime = new Date(currentTime.getFullYear(),date[1] - 1, date[0], time[0], time[1])
    //If date info + current year is in the future, subtract one year from the year
    if (actualtime > currentTime) {
        actualtime = new Date(actualtime.setFullYear(actualtime.getFullYear() -1))
    }
    return actualtime


}

//CONVERT INPUT TO INTEGERS
function inputToInteger(input) {
    //Format values: remove masking and split minutes/hours & months/days
    let integerOutput = null
    if (/[gud]/.test(input)) {
        integerOutput = parseInt(input.substring(0, input.length - 1))
    } else if ((/µmol\/L/).test(input)) {
        integerOutput = parseInt(input.substring(0, input.length - 6))
    } else if (/[:/]/.test(input)) {
        let ddhh = parseInt(input.substring(0, 2)) // days or hours
        let mmmm = parseInt(input.substring(3, 5)) // months or minutes
        integerOutput = [ddhh, mmmm]
    }
    return (integerOutput)
}

//VALIDATE INPUTS
function inputValidation(htmlID, intValue) {
    //If time/date, remove id before (eg. birth-time -> time)
    let validationID = htmlID
    if (validationID.includes("time") || validationID.includes("date")) {
        validationID = validationID.substring(validationID.indexOf("-") + 1)
    }
    let validation = null
    //Valid input ranges for each HTML ID
    const validationCriteria = {
        "birth-weight": [500, 7500],
        "date": [[1, 31], [1, 12]],
        "time": [[0, 23], [0, 59]],
        "gestation-week": [22, 45],
        "bilirubin-value": [0, 1000],
    }
    //Validate time/date input
    let sorting = validationID.includes("time") ? "time" : "date";
    if (validationID.includes("time") || validationID.includes("date")) {
        (intValue != null
            && intValue[0] >= validationCriteria[sorting][0][0]
            && intValue[0] <= validationCriteria[sorting][0][1]
            && intValue[1] >= validationCriteria[sorting][1][0]
            && intValue[1] <= validationCriteria[sorting][1][1])
            ? validation = true : validation = false;
    }
    //Validates all other inputs (gram/weeks/days/mikromol)
    else {
        (intValue != null
            && intValue >= validationCriteria[validationID][0]
            && intValue <= validationCriteria[validationID][1]
        ) ? validation = true : validation = false;
    }
    return (validation)
}

//ADD ERROR MESSAGE
function errorMessages(id, valid) {
    //Add class dependent on valid input or not (true/false)
    let addCss = valid ? "no-error-message" : "error-message"
    let removeCss = valid ? "error-message" : "no-error-message"
    //Target element
    let errorId = id + "-error"
    document.getElementById(errorId).classList.add(addCss)
    document.getElementById(errorId).classList.remove(removeCss)
}
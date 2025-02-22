//Import functions
import {masking} from './masking.js';
import {initiateGraph, myChart, getTransfusionLimit} from './graph.js';
import {child, saveChild} from './child.js';
import {Lab, saveLab} from './lab.js';
import {copyContent} from './journal.js';
//Export general functions
export {msToDay, relativeDate2absoluteDate, absolute2relativeDate, currentLightLimitFromLastLab, printLabOverview, currentTransfusionLimitFromLastLab,absoluteDateToPrintFormat, updateYaxis, updateCount}

masking();
initiateGraph()

///* STATISTICS *///
let apiURL = "https://i70hzn59ha.execute-api.us-east-1.amazonaws.com/startUp/gultBarnStatistics"
let apiKey = "egFZwylnMe1Sk5PBAr31Y724ppi5NMJ6aJ3vl6g9"
    //todo change to enviormental variable

async function updateCount(clickID) {
    try {
        let response = await fetch(apiURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                //Sends the api key
                "x-api-key": apiKey
            },
            body: JSON.stringify({buttonID: clickID})
        });
        let result = await response.json();

        console.log(result);
    } catch (error) {
        console.error(error);
    }
};

// Attach event listeners to buttons instead of using onclick in HTML
//document.getElementById("journal-copy").addEventListener("click", () => updateCount("copiedJournals"));
//document.getElementById("feedback-button").addEventListener("click", () => updateCount("feedbackGiven"));

///* ADJUST GRAPH RATIO DEPENDING ON WINDOW *///
window.addEventListener("resize", function() {
        let widthBrowser = document.documentElement.clientWidth
        if (widthBrowser < 600) {
            myChart.options.aspectRatio = 1;
        } else if (widthBrowser >= 600) {
            myChart.options.aspectRatio = 2.2;
        }
});

///* EVENT LISTENERES *////
//Save child input info
document.getElementById("add-child").addEventListener("click", saveChild)
//Save lab input info
document.getElementById("add-lab").addEventListener("click", saveLab)
//Copy journal note to clipboard + show confirmation
document.getElementById("journal-copy").addEventListener("click", function() {
        copyContent();
        document.getElementById("journal-container").style.animation = "animatedBackground 0.4s ease-in-out";
        document.getElementById("myTooltip").style.visibility = "visible";
        document.getElementById("myTooltip").style.opacity = 1;
        setTimeout(function(){
            document.getElementById("myTooltip").style.visibility = "hidden";
            document.getElementById("myTooltip").style.opacity = 0;
            document.getElementById("journal-container").style.animation = "";
        }, 750);
    }
)
//Change journal icon if mouseocer
document.getElementById("journal-copy").addEventListener("mouseover", function () {
    document.getElementById("journal-container").style.backgroundImage = "url('./assets/icons/journal_yellow.svg')"
    document.getElementById("journal-container").style.animation = "animatedBackground 0.4s ease-in-out";
    setTimeout(function() {
        document.getElementById("journal-container").style.animation = "";
    },400
    )
})
document.getElementById("journal-copy").addEventListener("mouseout", function () {
    document.getElementById("journal-container").style.backgroundImage = "url('./assets/icons/journal_grey.svg')"
    document.getElementById("journal-container").style.animation = "";
})

//Fill flag on feedback on mouseover
document.getElementById("feedback-button").addEventListener("mouseover", function () {
    document.getElementById("feedback-image").src = "./assets/icons/flag_filled.svg"
})
document.getElementById("feedback-button").addEventListener("mouseout", function () {
    document.getElementById("feedback-image").src = "./assets/icons/flag.svg"
})

//Warning before leaving site
//window.onbeforeunload = function() {
//    return "All data vil bli slettet, vil du fortsatt fortsette?";
//};

//GENERAL FUNCTIONS
function msToDay(millisecounds) {
    return millisecounds / (1000 * 60 * 60 * 24)
}

function relativeDate2absoluteDate(realtiveDate) {
    let date = new Date(child.timeDate.getTime() + (realtiveDate * 24 * 60 * 60 * 1000));
    return date;
}

function absolute2relativeDate(absoluteDate) {
    let date = (new Date(absoluteDate.getTime()) - new Date(child.timeDate.getTime())) / (1000 * 60 * 60 * 24);
    return date;
}

function currentLightLimitFromLastLab() {
    //Get light limit assigned by child values
    let lightLimitRelative = child.getLightLimit().data
    let lightLimitAbsolute = JSON.stringify(lightLimitRelative)
    lightLimitAbsolute = JSON.parse(lightLimitAbsolute)
    let lightLimitSlope = child.getLightLimit().slope
    //Make current light limit in absolute dates
    for (const [key, value] of Object.entries(lightLimitAbsolute)) {
        let date = relativeDate2absoluteDate(key)
        lightLimitAbsolute[date] = value
        delete lightLimitAbsolute[key]
    }
    //Check if last lab is in slope or in the
    let lastLab = Lab.labs[Lab.labs.length - 1]
    let lightTimes = Object.keys(lightLimitAbsolute)
    //Convert
    lightTimes = lightTimes.map(d => new Date(d))

    if (lastLab.timeDate < lightTimes[1] && lastLab.timeDate >= new Date(child.timeDate.getTime() + 1000*60*60*24)) {
        let timeInSlope = (lastLab.timeDate - lightTimes[0])/(1000*60*60*24)
        //Start of light limit + time in slope * slope - bilirubin verdi
        return (child.getLightLimit().data[1] + (lightLimitSlope * timeInSlope) - lastLab.bilirubin)
    } else if ((lastLab.timeDate-child.timeDate) / (1000*60*60*24) >= (lightTimes[1]-child.timeDate) / (1000*60*60*24)) {
        if (lightLimitRelative.hasOwnProperty(3)) {
            return (lightLimitRelative[3] - lastLab.bilirubin);
        } else if (lightLimitRelative.hasOwnProperty(4)) {
            return (lightLimitRelative[4] - lastLab.bilirubin);
        } else {
            return null;
        }
    } else {
        console.log("LAST LAB IS NOT UNDER LIGHT LIMIT")
    }

}

function currentTransfusionLimitFromLastLab() {
    console.log("CURRENT TRANSFUSSION LIMIT CALLED")
    let lastLab = Lab.labs[Lab.labs.length - 1]
    let lastLabDate = absolute2relativeDate(lastLab.timeDate)
    // todo -> beregn antall knekk også avstand
    let transfusionLimit = getTransfusionLimit()
    let transfusionsKeys = []
    for (const coordinate of transfusionLimit) {
        let transfusionKey = coordinate.x
        if (lastLabDate == transfusionKey) {
            console.log("DISTANCE TO TRANSFUSION GRAPH:")
            console.log(coordinate.y - lastLab.bilirubin)
            return (coordinate.y - lastLab.bilirubin)
        }
        transfusionsKeys.push(transfusionKey)
    }
    let transfusionKeyUpstream = transfusionsKeys.find((day) => day > lastLabDate)
    let transfusionKeyDownstream = transfusionsKeys.filter((day) => day < lastLabDate)
    transfusionKeyDownstream = transfusionKeyDownstream[transfusionKeyDownstream.length - 1]
    let slopeCoordinates = []
    for (const coordinates of transfusionLimit) {
        if (transfusionKeyUpstream == coordinates.x) {
            slopeCoordinates.push(coordinates)
        } else if (transfusionKeyDownstream == coordinates.x) {
            slopeCoordinates.push(coordinates)
        }
    }
    let slope = (slopeCoordinates[1].y - slopeCoordinates[0].y) / (slopeCoordinates[1].x - slopeCoordinates[0].x)
    let currentTransfusionLimit = slope * (lastLabDate - transfusionKeyDownstream) + slopeCoordinates[0].y
    console.log("DISTANCE TO TRANSFUSION GRAPH:")
    console.log(currentTransfusionLimit - lastLab.bilirubin)
    return (currentTransfusionLimit - lastLab.bilirubin)
}

function printLabOverview() {
    let labOverview = "";
    for (const lab of Lab.labs) {
        let labDate = new Date(lab.timeDate)
        let relativeDate = Math.round(absolute2relativeDate(labDate)*100)/100;
        labOverview += `Dag: ${relativeDate}: ${lab.bilirubin} µmol/L\n`;
    }
    return labOverview
}

function absoluteDateToPrintFormat(date) {
    let minutes = date.getMinutes().toString().padStart(2, "0")
    let hours = date.getHours().toString().padStart(2, "0")
    let dato = date.getDate().toString().padStart(2, "0")
    let month = (date.getMonth()+1).toString().padStart(2, "0")
    return `${dato}/${month} kl. ${hours}:${minutes}`
}

function updateYaxis() {
    console.log("UPDATE Y-AXIS CALLED")
    //adjust Y-axis to always be 50 over light-limit / labs / transfustion:
    let maxYValue = 0

    //Find highest lab
    if (Lab.labs.length > 0) {
        for (const lab of Lab.labs) {
            if (lab.bilirubin > maxYValue) {
                maxYValue = lab.bilirubin
            }
        }
    }
    //Find highest point on light limit
    for (const [key, value] of Object.entries(child.getLightLimit().data)) {
        if (value > maxYValue) {
            maxYValue = value
        }
    }
    //Find highest point on transfusion limit
    if (myChart.data.datasets[3].data.length > 0) {
        for (const [key, value] of Object.entries(getTransfusionLimit())) {
            if (value.y > maxYValue) {
                maxYValue = value.y
            }
        }
    }
    console.log(`Max Y-value: ${maxYValue}, current max Y-value: ${myChart.options.scales.y.max}`)
    if (maxYValue > myChart.options.scales.y.max-50 || maxYValue < myChart.options.scales.y.max-50) {
        myChart.options.scales.y.max = Math.round((maxYValue+50)/50) * 50
        myChart.update()
    } else {
        console.log("Graph Y-value is already higher than current max Y-value")
    }
}
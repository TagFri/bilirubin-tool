import {absolute2relativeDate, relativeDate2absoluteDate, currentLightLimitFromLastLab} from "./index.js";
export {initiateGraph, updateChildGraph, updateLabGraph, myChart, updateChildLightLimit, updateTransfusionLimit, lightCrossingPoint, getTransfusionLimit}
import {child} from "./child.js"
import {Lab} from "./lab.js"

const yellowStrong =    'rgb(245, 162, 1)'
const yellowMedium =    'rgb(251, 193, 105)'
const yellowLight =     'rgb(255, 226, 177)'
const yellowLighter =   'rgb(255, 250, 242)'
const black =           'rgb(11, 30, 51)'
const grey =            'rgb(195, 199, 203)'
const red =             'rgb(251, 65, 65)'
const lightRed =               'rgb(255, 232, 233)'

let myChart = null;
let chartParameters = {
    "y-limit": null, //max y-value
    "x-limit": null, //max x-value
    "light-slope": null //light-graph slope
}
let startAspect = (document.documentElement.clientWidth >= 600)?2.2:1;
function initiateGraph() {
    const ctx = document.getElementById('graph');
    ctx.innerHTML = "";
    //Chart font size
    Chart.defaults.font.size = 14;
    Chart.defaults.font.family = "Poppins"
    //todo Include change on resize window
    //Chart font family
    Chart.defaults.font.family = 'Poppins';
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            //Dates (0 = birthdate, each consequently +1day until 10(14?) days of age)
            //One dataset = one line
            datasets: [
                {//DATASET 0 -> CHILD LIGHT LIMIT
                    data: [],
                    //Line properties
                    spanGaps: true,     //Make line between data
                    tension: 0,
                    borderColor: black, //Line color
                    borderWidth: 3.5,   //Line thickness
                    pointRadius: 0,     //Datapoint radis. 0 = not show
                    showLine: true,     //Show line on scatter plot
                    fill: false,        //Remove fill under graph
                    order: 4,
                },
                {//DATASET 1 -> LAB VALUES
                    data: [],
                    spanGaps: true,
                    tension: 0,
                    borderColor: yellowStrong,
                    backgroundColor: yellowStrong,
                    borderWidth: 3.5,
                    pointRadius: 8,
                    showLine: true,
                    fill: false,
                    order: 1,
                },
                {//DATASETT 2 -> EXTRAPOLATION OF LAB VALUES
                    data: [],
                    spanGaps: true,
                    tension: 0,
                    borderDash: [5, 5],
                    borderColor: yellowMedium,
                    backgroundColor: yellowMedium,
                    borderWidth: 3.5,
                    pointRadius: 8,
                    showLine: true,
                    fill: false,
                    order: 2,
                },
                {//DATASETT 3 -> Transfusion
                    label: "Transfusjonsgrense",
                    data: [],
                    //Line properties
                    spanGaps: true,     //Make line between data
                    tension: 0,
                    borderColor: lightRed,//Line color
                    backgroundColor: lightRed,
                    borderWidth: 3.5,   //Line thickness
                    pointRadius: 0,     //Datapoint radis. 0 = not show
                    showLine: true,     //Show line on scatter plot
                    fill: false,        //Remove fill under graph
                    order: 3,
                }
            ],
        },
        options: {
            responsive: true,
            aspectRatio: startAspect,
            parsing: {
                xAxisKey: 'x',
                yAxisKey: 'y'
            },
            //Turn on/off animation on initilizing
            animation: true,
            plugins: {
                title: {
                  display: true,
                },
                legend: {
                    //Turn on/off top-description for each graph
                    display: false,
                    //todo Filter labels til kun transfusjon
                    labels: {
                        usePointStyle: true,
                        boxWidth: 10,
                        padding: 10,
                        font: {
                            weight: 'normal'
                        }
                    }
                },
                tooltip: {
                    //Turn on/off hover box on each datapoint
                    enabled: true,
                    callbacks: {
                        title: function(context) {
                            return ""
                        },
                        label: function(context) {
                            //X verdi -> Dato
                            return prettyDateFromX(context.parsed.x) + " - Bilirubin: " + context.parsed.y + " mg/dl"
                        }
                    }
                },
            },
            scales: {
                x: {
                    type: 'linear',
                    suggestedMin: 0,
                    suggestedMax: 10,
                    ticks: {
                        stepSize: 2,
                        callback: function(value, index, values) {
                            return "Dag " + value;
                        }
                    },
                    grid: {
                        display: false,
                    },
                    //X-axis linewidth
                    border: {
                        width: 2,
                    }
                },
                y: {
                    //Starter Y-akse på 0
                    beginAtZero: true,
                    min: 0,
                    suggestedMax: 200,
                    //Markering hvert 50 på y-akse
                    ticks: {
                        stepSize: 50
                    },
                    grid: {
                        display: false,
                    },
                    //X-axis linewidth
                    border: {
                        width: 2,
                    }
                }
            }
        },
    });
}

function updateChildGraph() {
    if (child != null) {
        let lightInfo = child.getLightLimit()
        document.getElementById("graph-label").innerHTML = "Lysgrense for barn " + lightInfo["label"]
        //Oppdater child label graf
        //myChart.options.plugins.title.text = "Lysgrense for barn " + lightInfo["label"]
        myChart.data.datasets[0].data = lightInfo.data
        console.log("TEST Y-UPDATE")
        console.log(myChart.data.datasets[0].data[3])
        if (myChart.data.datasets[3].data[3] > lightInfo.data[10]) {
            myChart.options.scales.y.max = myChart.data.datasets[0].data[3] + 50
        } else {
            myChart.options.scales.y.max = lightInfo.data[10] + 50
        }
        chartParameters["light-slope"] = lightInfo.slope
        myChart.update()
        if (myChart.data.datasets[1].data.length > 0) {
            updateLabGraph()
        }
        console.log("Child graph updated")
    } else {
        console.log("Child not established (from upadteChildGraph) - no graph updated")
    }
}

function updateChildLightLimit() {
    console.log("UPDATE CHILD LIGHT LIMIT CALLED")
    console.log(myChart.data.datasets[3].data)
    console.log(myChart.data.datasets[3].data["3"])
    console.log(child.getLightLimit().data[10])
    if (myChart.data.datasets[3].data[2] > child.getLightLimit().data[10]) {
        myChart.options.scales.y.max = myChart.data.datasets[0].data[2] + 50
    } else {
        myChart.options.scales.y.max = child.getLightLimit().data[10] + 50
    }
    let labDate = absolute2relativeDate(new Date(Lab.labs[Lab.getNumberOfLabs()-1].timeDate))
    //If lab is after 10 days
    if (labDate >= 8) {
        //Create new point in light graph that matche lab objects
        myChart.data.datasets[0].data[labDate+4] = (Object.values(myChart.data.datasets[0].data)[2])
    }
    myChart.update()
}

function updateLabGraph() {
    //Loop through all labs taken
    let data = []
    let maxBilli = null
    for (const lab of Lab.labs) {
        //Get relative X-value
        let timeDifference = (new Date(lab.timeDate).getTime() - new Date(child.timeDate).getTime()) / (1000 * 60 * 60 * 24)
        //Add lab to graph
        data.push({x: timeDifference,y: lab.bilirubin})
        let lightKeys = Object.keys(child.getLightLimit().data)
        lightKeys.forEach(key => {
            if ((key != 1 && key != 3 && key != 4) && (timeDifference > key)) {
                //TODO ADD DATAPOINT TO LIGHT GRAPH
            }
        })
    }
    //Adjust Y-axis if bilirubin value is above the lightlimit
    myChart.data.datasets[1].data = data
    console.log("Lab graph updated")
    if (Lab.labs.length >= 2) {
        extrapolationGraphing()
    } else {
        myChart.data.datasets[2].data = []
    }
    myChart.update()
}
function roundToNearest(nearest, number) {return  ; }

function extrapolationGraphing() {
    //Get last lab
    let lastLab = Lab.labs[Lab.labs.length-1]
    //Get when graph will cross the light limit
    let lightCross = lightCrossingPoint()
    //Get number of dates since birthdate of last lab
    let lastLabRelativeDate = (new Date(lastLab.timeDate).getTime() - new Date(child.timeDate).getTime()) / (1000 * 60 * 60 * 24)
    //Check that there will be a light crossing + crossing is after last lab (eliminate negative slopes of extrapolation backwards in time)
    if (lightCross != null && lightCross.x > lastLabRelativeDate) {
        let data = []
        data.push({x: ((new Date(lastLab.timeDate).getTime() - new Date(child.timeDate).getTime()) / (1000 * 60 * 60 * 24)), y: lastLab.bilirubin})
        data.push(lightCross)
        myChart.data.datasets[2].data = data
    } else {
        myChart.data.datasets[2].data = []
    }
    myChart.update()
}

function labSlopeCalculator() {
    //From last two lab points:
    let diffX = (Lab.labs[Lab.labs.length -1].timeDate.getTime()-Lab.labs[Lab.labs.length -2].timeDate.getTime()) / (1000 * 60 * 60 * 24)
    let diffY = (Lab.labs[Lab.labs.length -1].bilirubin - Lab.labs[Lab.labs.length -2].bilirubin)
    return(diffY / diffX)
}

function lightCrossingPoint() {
    /*last lab date < lightPlatauDate && lab slope > lightslope*/
    //Parameters
    let lastLabDate = new Date(Lab.labs[Lab.labs.length - 1].timeDate.getTime())
    let lastLabRelativeDate = (lastLabDate - new Date(child.timeDate)) / (1000 * 60 * 60 * 24)
    let lastLabBilirubin = Lab.labs[Lab.labs.length - 1].bilirubin
    let lightBreak = (Object.keys(child.getLightLimit().data).includes('3')) ? 3 : 4;
    let lightPlatauDate = new Date(child.timeDate.getTime() + (1000 * 60 * 60 * 24 * lightBreak))
    let labSlope = labSlopeCalculator()
    let lightSlope = child.getLightLimit().slope
    // Lab tatt før platå AND lab går fortere opp enn lys AND SISTE BILI VERDI + (TID TIL PLATÅ * LABSLOPE) < LYSGRENSE
    if ((lastLabDate < lightPlatauDate) && (labSlope > lightSlope) && (lastLabBilirubin + ((lightBreak - lastLabRelativeDate)* labSlope) > child.getLightLimit().data[10])) {
        console.log("EXTRAPOLATING IN SLOPE")
        //Calculate crossing at light-slope
        let diffY = (child.getLightLimit().data[1] + (lightSlope * (lastLabRelativeDate - 1)) - lastLabBilirubin)
        let timeToCrossing = diffY / (labSlope - lightSlope)
        let xValue = lastLabRelativeDate + timeToCrossing
        let yValue = child.getLightLimit().data[1] + ((xValue - 1) * lightSlope)
        return ({x: xValue, y: yValue})
    } else if (labSlope > 0) {
        //Calculate crossing at platau
        console.log("EXTRAPOLATING TO PLATAU")
        let diffY = child.getLightLimit().data[10] - lastLabBilirubin
        let timeToCrossing = diffY / labSlope
        let xValue = lastLabRelativeDate + timeToCrossing
        let yValue = child.getLightLimit().data[10]
        if (xValue < (lastLabRelativeDate+14) && lastLabBilirubin < child.getLightLimit().data[10]) {
            console.log("UNDER 14 DAYS AND UNDER LIGHT LIMIT")
            return ({x: xValue, y: yValue})
        } else {
            console.log("No extrapolation is justified")
            return null
        }
    } else {
        console.log("No extrapolation is justified")
        return null
    }
}

function prettyDateFromX(x) {
    let date = relativeDate2absoluteDate(x)
    let minutes = date.getMinutes()
    if (minutes < 10) {minutes = "0" + minutes} else {minutes = minutes}
    let hours = date.getHours()
    if (hours < 10) {hours = "0" + hours} else {hours = hours}
    let days = date.getDate()
    if (days < 10) {days = "0" + days} else {days = days}
    let months = date.getMonth() + 1
    if (months < 10) {months = "0" + months} else {months = months}
    let years = date.getFullYear()
    years = years.toString().slice(-2)
    return (days + "/" + months + "-" + years + " kl." + hours + ":" + minutes)
}

function getTransfusionLimit() {
    if (Lab.getNumberOfLabs() == 0) {
        return []
    }
    let transfusionLimit = null
    console.log("GETTING TRANSFUSION LIMIT CALLED")
    let lastLabDay = absolute2relativeDate(Lab.labs[Lab.getNumberOfLabs()-1].timeDate)
    lastLabDay = Math.floor(lastLabDay +4)
    if (lastLabDay < 10) {lastLabDay = 10}
    if (child.birthWeight <= 1000) {
        transfusionLimit = [{x: 1, y:175}, {x: 2, y:200}, {x: 3, y:250}, {x:lastLabDay, y: 250}]
    } else if (child.birthWeight <= 1500) {
        transfusionLimit = [{x: 1, y:200}, {x: 3, y:250}, {x:lastLabDay, y: 250}]
    } else if (child.birthWeight <= 2500) {
        transfusionLimit = [{x: 1, y:250}, {x: 3, y:350}, {x:lastLabDay, y: 350}]
    } else {
        transfusionLimit = [{x: 0, y: 200}, {x: 3, y:400}, {x:lastLabDay, y:400}]
    }
    return transfusionLimit
}

function updateTransfusionLimit() {
    console.log("UPDATE TRANSFUSION LIMIT CALLED")
    if (Lab.getNumberOfLabs() > 0 ) {
        //Above light limit or first day:
        if (currentLightLimitFromLastLab() < 0 || absolute2relativeDate(Lab.labs[Lab.getNumberOfLabs()-1].timeDate) < 1) {
            console.log("ABOVE LIGHT LIMIT OR FIRST DAY")
            //Transfusion limits in graph
            myChart.data.datasets[3].data = getTransfusionLimit()
            myChart.update()
        } else {
            console.log("UNDER LIGHT LIMIT")
        }
    }
    console.log("-> -> TRANSFUSJON LIMIT NOT UPDATED - NO LABS")
    }

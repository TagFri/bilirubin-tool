import {child} from "./child.js"
import {Lab} from "./lab.js"
import {myChart, lightCrossingPoint, getTransfusionLimit} from "./graph.js"
import {
    relativeDate2absoluteDate,
    absolute2relativeDate,
    currentLightLimitFromLastLab,
    printLabOverview,
    absoluteDateToPrintFormat,
    currentTransfusionLimitFromLastLab
} from "./index.js";
export {updateAdvice}

function getAdvice() {
    console.log("GETADVICE CALLED")
    console.log(Lab.getNumberOfLabs())
    //Lab values
    let lastBilirubinValue
    let secoundLastBilirubinValue
    let lastBilirubinDate
    let lastBilirubinDate14
    let bilirubinSlope
    if (Lab.getNumberOfLabs() >= 1) {
        lastBilirubinValue = Lab.labs[Lab.getNumberOfLabs() - 1].bilirubin;
        lastBilirubinDate = Lab.labs[Lab.getNumberOfLabs() - 1].timeDate;
        lastBilirubinDate14 = new Date(lastBilirubinDate).setDate(lastBilirubinDate.getDate() + 14);
        bilirubinSlope = Lab.getLabSlope();
    }
    if (Lab.getNumberOfLabs() >= 2) {
        secoundLastBilirubinValue = Lab.labs[Lab.getNumberOfLabs() - 2].bilirubin;
    }

    //Lightlimits
    let lightlimitStart = child.getLightLimit().data[1];
    let lightlimit = child.getLightLimit().data[10];
    let lightSlope = child.getLightLimit().slope;

    //Childinfo
    let gestastionWeek = child.gestationWeek;
    let birthDate = child.timeDate;

    //Extrapolationinfo
    let newLabDate = null
    if (myChart.data.datasets[2].data.length > 0) {
        newLabDate = relativeDate2absoluteDate(myChart.data.datasets[2].data[1].x)
    } else newLabDate = false

    //Day info
    let day = null
    let crossingFormatted = null
    if (Lab.getNumberOfLabs() > 1 && lightCrossingPoint() != null) {
        console.log("LIGHT CROSSING POINT CALLED")
        console.log(lightCrossingPoint())
        let crossing = relativeDate2absoluteDate(lightCrossingPoint().x)
        switch (crossing.getDay()) {
            case 0:
                day = "søn"
                break
            case 1:
                day = "man"
                break
            case 2:
                day = "tir"
                break
            case 3:
                day = "ons"
                break
            case 4:
                day = "tor"
                break
            case 5:
                day = "fre"
                break
            case 6:
                day = "lør"
                break
        }
        crossingFormatted = absoluteDateToPrintFormat(crossing)
    }

// Lab values
    console.log("secoundLastBilirubinValue:", secoundLastBilirubinValue);
    console.log("lastBilirubinValue:", lastBilirubinValue);
    console.log("bilirubinSlope:", bilirubinSlope);

// Lightlimits
    console.log("lightlimit:", lightlimit);
    console.log("lightSlope:", lightSlope);

// Childinfo
    console.log("gestastionWeek:", gestastionWeek);
    console.log("birthDate:", birthDate);

// Extrapolationinfo
    console.log("newLabDate:", newLabDate);
    console.log("day:", day);
    console.log("crossingFormatted:", crossingFormatted);

    class Advice {
        constructor(advice, title, description, icon, color="var(--color-yellow-lighter)") {
            this.advice = advice
            this.title = title
            this.description = description
            this.icon = icon
            this.color = color
        }
    }
    let url="assets/icons/advice/"
    const noAdvice = new Advice(
        "noAdvice",
        "Ingen råd fra pediatriveilederen",
        "Bilirubinverdien er lavere enn 50 µM under lysgrensa. Pediatriveilederen gir ingen konkrete råd ved ett enkelt målepunkt. Anvend klinisk skjønn, med en helhetlig vurdering av barnets klinikk og historikk.",
        url + "no_advice.svg",
        "var(--color-grey-light)"
    );
    const noFollowUp = new Advice(
        "noFollowUp",
        "Ingen oppfølging nødvendig",
        `Trendlinjen for de to siste målepunktene er ${(bilirubinSlope>=0?"svært avflatet":"synkende")}. Blodprøvekontroll er ikke nødvendig.<br><br>Foreldre bes å ta kontakt med helsestasjonen dersom de mener barnet får økende ikterus eller om ikterus vedvarer 3 uker etter siste kontakt, eller om barnet virker slapt eller sykt.`,
        url + "no_follow_up.svg"
    );
    let bloodsampleDescription = ``
    if (Lab.getNumberOfLabs() == 1) {
        bloodsampleDescription += `Bilirubinverdien er < 50 µM under lysgrensen. Barnet bør følges opp med en ny blodprøve for å kontrollere bilirubinnivåene.\n\nEr barnet sykt (sepsis, acidose, asfyksi) bør oppstart av lysbehandling vurderes.`
    } else if (secoundLastBilirubinValue >=280 && lastBilirubinValue >= 280) {
        bloodsampleDescription += `Målingene er fortsatt høye, og trendlinjen for de to siste målepunktene er ${(bilirubinSlope < 0)?'svakt synkende':'svakt stigende'}. Barnet bør følges opp med en ny blodprøve for å kontrollere bilirubinnivåene.<br><br>Kliniske symptomer som slapphet, irritabel, brekninger, hypoglykemi, acidose o.l. krever grundigere utredning. Se <a class="link" href="https://www.helsebiblioteket.no/innhold/retningslinjer/pediatri/nyfodtmedisin-veiledende-prosedyrer-fra-norsk-barnelegeforening/8-gulsott-og-hemolytisk-sykdom/8.5-ikterus-oppfolging-etter-utskriving#:~:text=Vedvarende%20hyperbilirubinemi%3A" target="_blank">pediatriveilederen</a> for videre diagnostiske vurderinger.`
    } else if (bilirubinSlope > 0) {
        bloodsampleDescription += `Trendlinjen for de to siste målepunktene er stigende. Barnet bør følges opp med en ny blodprøve for å kontrollere bilirubinnivåene.<br><span class="semi-bold">Krysningstidspunkt: ${day} ${crossingFormatted}</span><br>Kliniske symptomer som slapphet, irritabel, brekninger, hypoglykemi, acidose o.l. krever grundigere utredning. Se <a class="link" href="https://www.helsebiblioteket.no/innhold/retningslinjer/pediatri/nyfodtmedisin-veiledende-prosedyrer-fra-norsk-barnelegeforening/8-gulsott-og-hemolytisk-sykdom/8.5-ikterus-oppfolging-etter-utskriving#:~:text=Vedvarende%20hyperbilirubinemi%3A" target="_blank">pediatriveilederen</a> for videre diagnostiske vurderinger.`
    } else {
        bloodsampleDescription += `Målingene er fortsatt høye, og trendlinjen for de to siste målepunktene er ${(bilirubinSlope < 0)?'svakt synkende':'svakt stigende'}. Barnet bør følges opp med en ny blodprøve for å kontrollere bilirubinnivåene.<br><br>Kliniske symptomer som slapphet, irritabel, brekninger, hypoglykemi, acidose o.l. krever grundigere utredning. Se <a class="link" href="https://www.helsebiblioteket.no/innhold/retningslinjer/pediatri/nyfodtmedisin-veiledende-prosedyrer-fra-norsk-barnelegeforening/8-gulsott-og-hemolytisk-sykdom/8.5-ikterus-oppfolging-etter-utskriving#:~:text=Vedvarende%20hyperbilirubinemi%3A" target="_blank">pediatriveilederen</a> for videre diagnostiske vurderinger.`
    }
    if (lastBilirubinValue >= lightlimit-50) {bloodsampleDescription += `<br><br><span class="semi-bold">OBS!</span> Siste bilirubinverdi er mindre enn 50 µM fra lysgrensen. Er barnet sykt (sepsis, acidose, asfyksi) bør oppstart av lysbehandling vurderes.`}
    if (bilirubinSlope > 100) {bloodsampleDescription += `<br><br><span class="semi-bold">OBS!</span> Trendlinjen for de to siste målepunktene stiger med mer enn ≥ 100 µM per døgn. Grundigere utredning av årsak til ikterus anbefales.`}

    const bloodSample = new Advice(
        "bloodSample",
        "Blodprøvekontroll anbefales",
        bloodsampleDescription,
        url + "bloodtest.svg"
    );
    const lightTherapy = new Advice(
        "lightTherapy",
        "Lysbehandling anbefales",
        `Barnet har bilirubinnivåer som overskrider lysgrensen. Lysbehandling er anbefalt. Behandlingen bør startes snarest mulig.<br><span class=semi-cold">Varighet</span>: Det anbefales 12–24 timers lysbehandling. Varighet kan individualiseres ut i fra hvor høye TSB-verdier var ved start lysbehandling, og i henhold til lokale rutiner.<br><br>Se <a class="link" href="https://www.helsebiblioteket.no/innhold/retningslinjer/pediatri/nyfodtmedisin-veiledende-prosedyrer-fra-norsk-barnelegeforening/8-gulsott-og-hemolytisk-sykdom/8.1-tidlig-ikterus-forste-710-dager#:~:text=Behandling%20og%20oppf%C3%B8lging" target="_blank">pediatriveilederen</a> for videre info.`,
        url + "phototherapy.svg"
    );
    const prolongedIcterus = new Advice(
        "prolongedIcterus",
        `Prolongert ikterus - videre utredning anbefales`,
        `Barn eldre enn 14 dager med synlig ikterus skal alltid utredes med total og konjugert bilirubin – uavhengig av vektoppgang og farge på avføring/urin. Et barn med konjugert bilirubin >17 mikromol/L skal følges opp videre.\n\nVurder også: Hb, hvite, trombocytter, retikulocytter, ALAT, GT, TSH, FT4 og blodtype mor/barn, DAT av barnet (hvis ikke kjent tidligere).<br><br>Se <a class="link" href="https://www.helsebiblioteket.no/innhold/retningslinjer/pediatri/nyfodtmedisin-veiledende-prosedyrer-fra-norsk-barnelegeforening/8-gulsott-og-hemolytisk-sykdom/8.4-prolongert-ikterus-mistenkt-kolestase-1014-dagers-alder" target="_blank">pediatriveilederen</a> for videre utredning.`,
        url + "prolonged_icterus.svg"
    );
    const earlyIcterus = new Advice(
        "earlyIcterus",
        "Ikterus første levedøgn  - videre utredning anbefales",
        `Synlig gulsott som oppstår innen 1 døgns alder regnes alltid som patologisk. Videre utredning med blodprøver anbefales som angitt i <a class="link" href="https://www.helsebiblioteket.no/innhold/retningslinjer/pediatri/nyfodtmedisin-veiledende-prosedyrer-fra-norsk-barnelegeforening/8-gulsott-og-hemolytisk-sykdom/8.1-tidlig-ikterus-forste-710-dager#:~:text=Synlig%20gulsott%20innen%201%20d%C3%B8gns%20alder%20(alltid%20patologisk!)" target="_blank">pediatriveilederen</a>, vurder lysbehandling evt. transfusjon/IVIG ved svært høye verdier.`,
        url + "early_onset_icterus.svg"
    );
    const deactivated = new Advice(
        "deactivated",
        "Faglig råd",
        "<br><br><br>",
        url + "outcome_box_inactive.svg"

    )

    let transfusionDescription = `Barnet har svært høye bilirubinverdier, erfaren kliniker (bakvakt pediater) bør kontaktes for å vurdering av  utskiftningstransfusjon. Se <a class="link" href="https://www.helsebiblioteket.no/innhold/retningslinjer/pediatri/nyfodtmedisin-veiledende-prosedyrer-fra-norsk-barnelegeforening/8-gulsott-og-hemolytisk-sykdom/8.3-utskiftingstransfusjon#-helsebiblioteket-innhold-retningslinjer-pediatri-nyfodtmedisin-veiledende-prosedyrer-fra-norsk-barnelegeforening-8-gulsott-og-hemolytisk-sykdom-83-utskiftingstransfusjon:~:text=og%20hemolytisk%20sykdom-,8.%203%20Utskiftingstransfusjon,-Sist%20faglig%20oppdatert" target="_blank">pediatriveilederen</a> for detaljert informasjon.`
    if (lastBilirubinValue >= gestastionWeek * 10) {
        transfusionDescription += `<br><br><span class="semi-bold">OBS!</span> Bilirubin er mer enn 10 x gestasjonsuke`
    }
    if (bilirubinSlope > 240) {
        transfusionDescription += `<br><br><span class="semi-bold">OBS!</span> Bilirubin stiger mer enn 10 µmol/time.`
    }

    const transfusion = new Advice(
        "transfusion",
        "Utskiftningstransfusjon bør vurderes",
        transfusionDescription,
        url + "transfusion.svg",
        "var(--color-light-red)"
    );
    const error = new Advice(
        "error",
        "Wopsi! Noe har skjedd...",
        "Beregninger har feilet, pc'en klikka eller verden går rett og slett under. Vanskelig å vite om du ikke sender oss en mail. Trykk på \"Gi tilbakemelding\" under så skal vi se på det så fort vi klarer!",
        url + "error.svg",
        "var(--color-grey-light)"
    )
    let advices = [noFollowUp, bloodSample, lightTherapy, prolongedIcterus, earlyIcterus, transfusion, noAdvice, error, deactivated]
    if (Lab.getNumberOfLabs() == 0) {
        return(advices[advices.indexOf(deactivated)])
    }
    console.log("GETADVICE CALLED")
    console.log(currentLightLimitFromLastLab())
    console.log((Lab.getNumberOfLabs() == 1))
    console.log("LAST LAB");
    console.log(absolute2relativeDate(lastBilirubinDate))
    console.log(getTransfusionLimit())

    /* ADVICE ALGORITHEM; */
    if (lastBilirubinValue >= gestastionWeek * 10
        ||bilirubinSlope > 240) {
        console.log("ADVICE: transfusion-advice")
        currentTransfusionLimitFromLastLab()
        return (advices[advices.indexOf(transfusion)])
    }
//EARLY ICTERUS
    else if (absolute2relativeDate(lastBilirubinDate) < 1) {
        console.log("ADVICE: early-icterus")
        return(advices[advices.indexOf(earlyIcterus)])
    }
//TRANSFUSJON NEEEDED
    else if (lastBilirubinValue >= gestastionWeek * 10
        ||bilirubinSlope > 240
        ||currentTransfusionLimitFromLastLab() <= 0) {
        console.log("ADVICE: transfusion-advice")
        currentTransfusionLimitFromLastLab()
        return (advices[advices.indexOf(transfusion)])
    }
//LIGHT THERAPY NEEDED
    else if (((lastBilirubinValue >= lightlimit) && ((absolute2relativeDate(lastBilirubinDate)) >= (Object.keys(child.getLightLimit().data).includes('3') ? 3 : 4))) || (lastBilirubinValue >=   (lightlimitStart + (lightSlope * (absolute2relativeDate(lastBilirubinDate)-1))) &&  (absolute2relativeDate(lastBilirubinDate) < Object.keys(child.getLightLimit().data).includes('3') ? 3 : 4))) {
        console.log("ADVICE: lighttherapy-advice")
        return(advices[advices.indexOf(lightTherapy)])
    }
//LATE ICTERUS
    else if (absolute2relativeDate(lastBilirubinDate)>14) {
        console.log("ADVICE: prolonged-icterus")
        return(advices[advices.indexOf(prolongedIcterus)])
    }
//BLOOD SAMPLE FOLLOW UP
        //Positive light curve and extrapolation is within 14 days
    else if ((bilirubinSlope > 0 && newLabDate && newLabDate < lastBilirubinDate14)
        // OR Single lab that's 50 from light limit
        || ((Lab.getNumberOfLabs() == 1) && (currentLightLimitFromLastLab() <= 50))
        //OR bilirubin value is above 280 with a slope thats decreasing less than 20/day
        || (!(lastBilirubinValue <=280 && bilirubinSlope <= -20)) && bilirubinSlope != undefined) {
        console.log("ADVICE: bloodsample-advice")
        console.log((bilirubinSlope > 0 && newLabDate && newLabDate < lastBilirubinDate14))
        console.log((Lab.getNumberOfLabs() == 1) && (currentLightLimitFromLastLab() <= 50))
        console.log(!(lastBilirubinValue <=280 && bilirubinSlope <= -20))
        console.log(lastBilirubinValue)
        console.log(bilirubinSlope)
        return(advices[advices.indexOf(bloodSample)])
    }
//NO FOLLOW UP NEEDED
        //newLabDate == False -> if extrapolation is calculated above 14 days
    else if ((bilirubinSlope <= 0 || !newLabDate)
        && Lab.getNumberOfLabs() > 1
        && (lastBilirubinValue <=280 && bilirubinSlope <= -20)) {
        console.log("ADVICE: no-follow-up")
        return(advices[advices.indexOf(noFollowUp)])
//NO ADVICE IN GUIDELINES
    } else if ((Lab.getNumberOfLabs() == 1) && (currentLightLimitFromLastLab() > 50)) {
        console.log("ADVICE: no-advice")
        return(advices[advices.indexOf(noAdvice)])
    } else if (Lab.getNumberOfLabs() == 0) {
        return(advices[advices.indexOf(deactivated)])
    }
//Error handling
    else {
        return(advices[advices.indexOf(error)])
    }
}

function updateAdvice() {
    //Get advice icon
    const adviceElement = getAdvice()
    //Create email template:
    let href = "mailto:hei@sablateknisk.no?subject=Gult barn&body="
    href += "%0A%0A%0A%0A"
    href += "AUTOGENERERT RAPPORT:%0A"
    href += document.getElementById("tech-version").innerText+ "%0A"
    href += document.getElementById("clinical-version").innerText + "%0A%0A"
    href += "Råd: " + adviceElement.title + "%0A"
    href += "Beskrivelse: " + adviceElement.description + "%0A%0A"
    href += "BARNETS INFO:%0A"
    let barnetsVekt = null;
    let gestation = null;
    if (child.birthWeight < 1000) { barnetsVekt = "<1000gram" }
    else if (child.birthWeight < 1500) { barnetsVekt = "1000-1499gram" }
    else if (child.birthWeight < 2500) { barnetsVekt = "1500-2500gram" }
    else if (child.birthWeight > 2500) { barnetsVekt = "2500-3500gram" }
    if (child.gestationWeek < 37) {gestation = "<37uker"}
    else if (child.gestationWeek >= 37) {gestation = ">=37uker"}
    href += "Vekt:%09%09%09" + barnetsVekt + "%0A";
    //href += "Fødselsdato:%09%09" + child.date[0] + "/" + child.date[1] + " kl: " + child.time[0] + ":" + child.time[1] + "%0A"
    href += "Fødselsdato:%09%09" + "Fjernet gr. personvern%0A%0A";
    href += "Gestasjonsalder:%09" + gestation + "%0A%0A"
    href += "BILIRUBIN PRØVER:%0A"
    href += printLabOverview().replace(/\n/g, '%0A')
    document.getElementById("feedback-button").children[1].href = href
    //Update advice title
    document.getElementById("advice-title").innerHTML = adviceElement.title
    //Update advice description
    document.getElementById("advice-paragraph").innerHTML = adviceElement.description
    //Update advice icon
    document.getElementById("advice-container").style.backgroundImage = `url('${adviceElement.icon}')`;
    //Upadte background color
    document.getElementById("advice-container").style.backgroundColor = `${adviceElement.color}`;
    //Show feedback button
    document.getElementById("feedback-button").classList.remove("hidden")

}
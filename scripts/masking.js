export {masking};

//INPUT MASKING
function masking() {
    Inputmask("999[9]g").mask("birth-weight")
    Inputmask("99/99").mask("birth-date")
    Inputmask("99:99").mask("birth-time")
    Inputmask("99/99").mask("lab-date")
    Inputmask("99:99").mask("lab-time")
    Inputmask("99u").mask("gestation-week")
    Inputmask("9d").mask("gestation-day")
    Inputmask("99[9] µmol/L").mask("bilirubin-value")
};
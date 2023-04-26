import "./style.css";

// ---------------- Timesheet Manipulation -----------

function addMaintenanceRow() {}

function getMaintenanceRow() {}

function getNewFeaturesRow() {}

// ---------------------- USER INPUTS -----------------

function getMaintenanceElement() {
    return document.getElementById("maintenance-checkbox") as HTMLInputElement;
}

function getMaintenanceValue() {
    return parseInt(getMaintenanceElement().value);
}

function validateUserInput() {
    const value = getMaintenanceValue();

    markInputField(value);
}

function markInputField(value: number) {
    getMaintenanceElement();
}

(document.getElementById("generateBtn") as HTMLButtonElement).onclick = (e) => {
    e.preventDefault();
    validateUserInput();
};
(document.getElementById("generateBtn") as HTMLButtonElement).onkeyup = (e) => {
    validateUserInput();
};

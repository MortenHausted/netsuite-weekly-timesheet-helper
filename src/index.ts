import "./style.css";
import "./bootstrap.min.css";

interface RowObject {
    currentProjectRows: HTMLDivElement[];
    currentTimeRows: HTMLDivElement[];
}

(function () {
    let maintenanceHours = 0;
    let findTableTimeout = 0;
    const AJOUR_PROJECT = "PROJ075079 Eg Danmark A/S : IPP Ongoing Ajour";
    const AJOUR_PROJECT_MAINTENANCE = "Ajour Build (Sub) : Maintenance (Project Task)";
    const AJOUR_PROJECT_FEATURES = "Ajour Build (Sub) : New features and functionalities (Project Task)";

    function sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    function logger(text: any) {
        //for chrome console filtering
        console.log({ test: text });
    }

    // ---------------- Timesheet Manipulation -----------

    async function addMaintenanceRow(obj: RowObject) {
        const hoursArr = splitMaintenanceHours();
        if(!maintenanceHours) return;
        const length = obj.currentProjectRows.length;
        const maintenanceRow = obj.currentProjectRows[length - 1];
        const timeRow = obj.currentTimeRows[length - 1];
        const firstCell = maintenanceRow.firstChild as HTMLDivElement;
        const secondCell = maintenanceRow.childNodes[1] as HTMLDivElement;
        firstCell.click();
        (document.activeElement as HTMLInputElement).value = AJOUR_PROJECT;
        await sleep(50);
        (document.activeElement as HTMLInputElement).dispatchEvent(new Event("input", { bubbles: true }));
        await sleep(1500);

        secondCell.click();
        (document.activeElement as HTMLInputElement).value = AJOUR_PROJECT_MAINTENANCE;
        await sleep(50);
        (document.activeElement as HTMLInputElement).dispatchEvent(new Event("input", { bubbles: true }));
        await sleep(1500);

        for (let i = 0; i < hoursArr.length; i++) {
            if (hoursArr[i]) {
                const timeCell = timeRow.childNodes[i] as HTMLDivElement;
                timeCell.click();
                (document.activeElement as HTMLInputElement).value = hoursArr[i].toString();
                await sleep(50);
                (document.activeElement as HTMLInputElement).dispatchEvent(new Event("input", { bubbles: true }));
                await sleep(1000);
            }
        }
        if(hoursArr[0]) (timeRow.childNodes[5] as HTMLDivElement).click();
    }

    async function addNewFeaturesRow(obj: RowObject) {
        const hoursArr = splitMaintenanceHours();
        const featuresRow = obj.currentProjectRows[0];
        const timeRow = obj.currentTimeRows[0];
        const firstCell = featuresRow.firstChild as HTMLDivElement;
        const secondCell = featuresRow.childNodes[1] as HTMLDivElement;
        firstCell.click();
        if ((document.activeElement as HTMLInputElement).value) {
            return;
        }
        (document.activeElement as HTMLInputElement).value = AJOUR_PROJECT;
        await sleep(50);
        (document.activeElement as HTMLInputElement).dispatchEvent(new Event("input", { bubbles: true }));
        await sleep(1500);

        secondCell.click();
        (document.activeElement as HTMLInputElement).value = AJOUR_PROJECT_FEATURES;
        await sleep(50);
        (document.activeElement as HTMLInputElement).dispatchEvent(new Event("input", { bubbles: true }));
        await sleep(1500);

        for (let i = 0; i < hoursArr.length; i++) {
            const time = i === 4 ? 7 - hoursArr[i] : 7.5 - hoursArr[i];
            const timeCell = timeRow.childNodes[i] as HTMLDivElement;
            timeCell.click();
            (document.activeElement as HTMLInputElement).value = time.toString();
            await sleep(50);
            (document.activeElement as HTMLInputElement).dispatchEvent(new Event("input", { bubbles: true }));
            await sleep(1000);
        }
    }

    async function enableNewRow(obj: RowObject) {
        return new Promise(async (resolve) => {
            const row = obj.currentProjectRows[0];
            const firstCell = row.firstChild as HTMLDivElement;
            firstCell.click();
            const element = document.querySelector(".n-w-gridview__action-bar div div div div") as HTMLDivElement;
            element.click();
            await sleep(1500);
            resolve(null);
        });
    }

    function getTableRows() {
        try {
            let gridContainer: HTMLDivElement;
            const gridViewContainers = document.getElementsByClassName("n-w-gridview__content");
            if (gridViewContainers.length > 0) gridContainer = gridViewContainers[0] as HTMLDivElement;
            else {
                setTimeout(() => {
                    if (findTableTimeout === 10) {
                        alert("Cannot find table");
                        location.reload();
                    }
                    findTableTimeout++;
                    generateResult();
                }, 200);
                return;
            }
            const currentRows = gridContainer.querySelectorAll(
                '.n-w-datagrid__body-row[data-widget="GridRowSegment"]'
            ) as NodeListOf<HTMLDivElement>;
            const currentProjectRows: HTMLDivElement[] = [];
            const currentTimeRows: HTMLDivElement[] = [];
            const totalRows = currentRows.length / 2;
            currentRows.forEach((element, key) => {
                if (key < totalRows) currentProjectRows.push(element);
                else currentTimeRows.push(element);
            });

            return { currentProjectRows, currentTimeRows };
        } catch (error) {}
    }

    async function generateResult() {
        let rowObject = getTableRows();
        if (rowObject.currentProjectRows.length === 0) {
            alert("Click the edit button");
            return;
        }
        await addNewFeaturesRow(rowObject);
        await enableNewRow(rowObject);
        rowObject = getTableRows();
        await addMaintenanceRow(rowObject);
        await sleep(1000);
        const saveButtons = document.querySelectorAll('[data-hierarchy="primary"]') as NodeListOf<HTMLDivElement>;
        if (saveButtons.length > 0) saveButtons[1].click();
    }

    // ---------------------- USER INPUTS -----------------

    function getInfoElement() {
        return document.getElementById("info") as HTMLInputElement;
    }

    function getMaintenanceInputElement() {
        return document.getElementById("maintenance-checkbox") as HTMLInputElement;
    }

    function getMaintenanceValue() {
        return parseInt(getMaintenanceInputElement().value);
    }

    function validateUserInput() {
        const value = getMaintenanceValue();

        return markInputField(value);
    }

    function splitMaintenanceHours() {
        let iterator = parseInt(maintenanceHours.toString());
        const arr = [0, 0, 0, 0, 0];
        for (let i = 0; i < arr.length; i++) {
            if (iterator > 0 && iterator <= 4) {
                arr[i] = iterator;
                iterator -= iterator;
            } else if (iterator > 4) {
                arr[i] = 4;
                iterator -= 4;
            } else break;
        }
        return arr;
    }

    function markInputField(value: number) {
        maintenanceHours = value || 0;
        if (value <= 37) {
            showError("", true);
            return true;
        } else if (value > 37) {
            showError("Are you sure that you are a maintenance machine? Maintaining above 37 hours not allowed! 💩");
            return false;
        }
    }

    function showError(msg?: string, removeClass?: boolean) {
        const element = getInfoElement();
        if (!element.classList.contains("error") && msg) element.classList.add("error");

        if (msg) element.innerText = msg;
        else element.innerText = "";

        if (removeClass) element.classList.remove("error");
    }

    function generatePopUp() {
        const divApp = document.createElement("div");
        divApp.id = "app-timesheet-helper";

        const header = document.createElement("h2");
        header.className = "text-center";
        header.innerText = "Weekly Timesheet Helper";
        divApp.append(header);
        // ----------------------------------------------

        const divTextContainer = document.createElement("div");
        divTextContainer.className = "text-center";

        const strong = document.createElement("strong");
        strong.innerText = "Maintenance Hours:";
        divTextContainer.append(strong);

        const inputNumber = document.createElement("input");
        inputNumber.id = "maintenance-checkbox";
        inputNumber.type = "number";
        inputNumber.min = "0";
        inputNumber.max = "37";
        inputNumber.onkeyup = () => validateUserInput();
        divTextContainer.append(inputNumber);

        const br = document.createElement("br");
        divTextContainer.append(br);

        const span = document.createElement("span");
        span.id = "info";
        divTextContainer.append(span);

        divApp.append(divTextContainer);

        // ----------------------------------------------
        const btn = document.createElement("button");
        btn.id = "generateBtn";
        btn.innerText = "Generate Timesheet";
        btn.onclick = (e) => {
            e.preventDefault();
            if (validateUserInput()) {
                generateResult();
            }
        };
        divApp.append(btn);

        return divApp;
    }

    if (location.href.includes("app.netsuite.com/app/accounting/transactions/time/weeklytime")) document.body.append(generatePopUp());
})();

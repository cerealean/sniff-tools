interface Window {
    sniffTools: SniffTools
}
interface SniffTools {
    initialized: boolean;
}
((bodyElement: HTMLBodyElement) => {
    const constants = {
        namespace: 'sniff_extra_tooling_'
    };
    interface FilterOptions {
        ageMax?: number;
    }
    class Profile {
        age?: number;
        element?: HTMLDivElement;
    }
    function isNumber(val: any) {
        return !isNaN(val);
    }
    function hideElements(...elements: HTMLElement[]) {
        elements.forEach(el => {
            if (el?.style) {
                el.style.display = 'none';
            }
        });
    }
    function showElements(...elements: HTMLElement[]) {
        elements.forEach(el => {
            if (el?.style) {
                el.style.display = 'initial';
            }
        });
    }
    function makeElementDraggable(elmnt: HTMLElement) {
        var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        const headerElement = document.getElementById(elmnt.id + "header");
        if (headerElement) {
            // if present, the header is where you move the DIV from:
            headerElement.onmousedown = dragMouseDown;
        } else {
            // otherwise, move the DIV from anywhere inside the DIV:
            elmnt.onmousedown = dragMouseDown;
        }

        function dragMouseDown(e: MouseEvent) {
            e = e || window.event;
            e.preventDefault();
            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        }

        function elementDrag(e: MouseEvent) {
            e = e || window.event;
            e.preventDefault();
            // calculate the new cursor position:
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // set the element's new position:
            elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
            elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            // stop moving when mouse button is released:
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }
    function tryGetAgeFromTitleString(titleString?: string) {
        if (!titleString) {
            return undefined;
        }
        const firstValue = titleString.split(',')[0].replace(',', "").trim();
        return isNumber(firstValue) ? +firstValue : undefined;
    }
    function getProfiles() {
        const parentElements: HTMLDivElement[] = Array.from(bodyElement.querySelectorAll('div.mapboxgl-marker.mapboxgl-marker-anchor-center').values()) as HTMLDivElement[];
        const profiles = parentElements.filter(pe => pe.querySelectorAll('div.title-tag').length <= 1).map(parentElement => {
            const newProfile = new Profile();
            const titleData = (parentElement.querySelector('div.title-tag') as HTMLElement)?.innerText || undefined;
            newProfile.age = tryGetAgeFromTitleString(titleData);
            newProfile.element = parentElement;

            return newProfile;
        });

        return profiles;
    }
    function filterUnwantedProfiles(filterOptions: FilterOptions) {
        let profiles = getProfiles();
        const profilesToHide: Profile[] = [];
        if (filterOptions.ageMax) {
            const profilesAboveAgeMax = profiles.filter(p => p.age === undefined || p.age >= filterOptions.ageMax!);
            profilesToHide.push(...profilesAboveAgeMax);
            profiles = profiles.filter(p => !profilesAboveAgeMax.includes(p));
        }
        console.log('result', profiles, profilesToHide);
        showElements(...profiles.map(p => p.element!));
        hideElements(...profilesToHide.map(p => p.element!));
    }

    function setupUI() {
        const outerDiv = setupOuterDiv();
        addOuterDivHeader(outerDiv);
        bodyElement.appendChild(outerDiv);

        function setupOuterDiv() {
            const outerDiv = document.createElement('div');
            outerDiv.id = constants.namespace + 'outer_div';
            outerDiv.style.backgroundColor = 'white';
            outerDiv.style.border = '1px solid black';
            outerDiv.style.position = 'absolute';
            outerDiv.style.zIndex = '99';
            outerDiv.style.minWidth = '150px';
            outerDiv.style.minHeight = '125px';

            return outerDiv;
        }
        function addOuterDivHeader(outerDivElmt: HTMLDivElement) {
            const headerElement = document.createElement('div');
            headerElement.id = outerDiv.id + 'header';
            headerElement.style.textAlign = 'center';
            headerElement.style.fontWeight = 'bold';
            headerElement.style.borderBottom = '1px solid black';
            headerElement.innerText = 'Sniff Tools';
            headerElement.style.cursor = 'grab';
            headerElement.onfocus = () => {
                headerElement.style.cursor = 'grabbing';
            };
            headerElement.onblur = () => {
                headerElement.style.cursor = 'initial';
            };
            outerDivElmt.appendChild(headerElement);
        }
    }

    function clearUI() {
        const outerDiv: HTMLDivElement = (bodyElement as any).getElementById(constants.namespace + 'outer_div');
        if (outerDiv) {
            outerDiv.remove();
        }
    }

    if (window.sniffTools?.initialized) {
        clearUI();
    }
    setupUI();
    window.sniffTools = {
        initialized: true
    };

    // const maxAge = +prompt('What is the max age?');
    // filterUnwantedProfiles({ ageMax: maxAge });
})(document.body as HTMLBodyElement);
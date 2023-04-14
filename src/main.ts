interface Window {
    sniffTools: SniffTools
}
interface SniffTools {
    initialized: boolean;
}
((bodyElement: HTMLBodyElement) => {
    class Constants {
        static readonly namespace = 'sniff_extra_tooling_';
        static readonly outerDivId = this.namespace + 'outer_div';
        static readonly outerDivHeaderId = this.outerDivId + '_header';
        static readonly statsDivId = this.namespace + 'stats';
        static readonly maxAgeInput = this.namespace + 'max_age_input';
        static readonly minAgeInput = this.namespace + 'min_age_input';
    }
    interface FilterOptions {
        ageMax?: number;
        ageMin?: number;
    }
    class Profile {
        age?: number;
        element?: HTMLDivElement;
    }
    interface CurrentValues {
        profilesHidden?: number;
        profilesShown?: number;
        maxAge?: number;
        minAge?: number;
    };
    const currentValues: CurrentValues = {};
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
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        const headerElement = document.getElementById(Constants.outerDivHeaderId);
        if (!headerElement) {
            return;
        }

        headerElement.onmousedown = dragMouseDown;

        function dragMouseDown(e: MouseEvent) {
            e = e || window.event;
            e.preventDefault();
            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            headerElement!.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            headerElement!.onmousemove = elementDrag;
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
            headerElement!.onmouseup = null;
            headerElement!.onmousemove = null;
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
        if (filterOptions.ageMin) {
            const profilesUnderMinAge = profiles.filter(p => p.age === undefined || p.age < filterOptions.ageMin!);
            profilesToHide.push(...profilesUnderMinAge);
            profiles = profiles.filter(p => !profilesUnderMinAge.includes(p));
        }
        currentValues.profilesShown = profiles.length;
        currentValues.profilesHidden = profilesToHide.length;
        showElements(...profiles.map(p => p.element!));
        hideElements(...profilesToHide.map(p => p.element!));
    }
    function updateStats() {
        const statsDiv = bodyElement.querySelector(`#${Constants.statsDivId}`) as HTMLDivElement | undefined;
        if(statsDiv) {
            statsDiv.innerHTML = `<strong>Profiles Shown</strong>:&nbsp;${currentValues.profilesShown},&nbsp;<strong>Profiles Hidden</strong>:&nbsp;${currentValues.profilesHidden}`;
        }
    }
    function filterButtonClicked() {
        filterUnwantedProfiles({
            ageMax: currentValues.maxAge,
            ageMin: currentValues.minAge
        });
        updateStats();
    }
    function setupUI() {
        const outerDiv = setupOuterDiv();

        addOuterDivHeader(outerDiv);
        addStatsDiv(outerDiv);
        addFilterOptions(outerDiv);

        bodyElement.appendChild(outerDiv);
        makeElementDraggable(outerDiv);

        function addStatsDiv(outerDivElmt: HTMLDivElement) {
            const statsDiv = document.createElement('div');
            statsDiv.id = Constants.statsDivId;
            statsDiv.title = 'Profiles shown or hidden from the latest filter. Only updates when clicking the "Filter Profiles" button.';
            outerDivElmt.appendChild(statsDiv);
        }

        function setupOuterDiv() {
            const outerDiv = document.createElement('div');
            outerDiv.id = Constants.outerDivId;
            outerDiv.style.backgroundColor = 'white';
            outerDiv.style.border = '1px solid black';
            outerDiv.style.position = 'absolute';
            outerDiv.style.zIndex = '99';
            outerDiv.style.minWidth = '18vw';
            outerDiv.style.minHeight = '16vh';
            outerDiv.style.resize = 'both';

            return outerDiv;
        }
        function addOuterDivHeader(outerDivElmt: HTMLDivElement) {
            const headerElement = document.createElement('div');
            headerElement.id = Constants.outerDivHeaderId;
            headerElement.style.textAlign = 'center';
            headerElement.style.fontWeight = 'bolder';
            headerElement.style.borderBottom = '1px solid black';
            headerElement.innerHTML = '<h2>Sniff Tools</h2>';
            headerElement.style.cursor = 'move';
            headerElement.onblur = () => {
                headerElement.style.cursor = 'initial';
            };
            outerDivElmt.appendChild(headerElement);
        }
        function addFilterOptions(outerDivElmt: HTMLDivElement) {
            const filterWrapper = document.createElement('div');
            filterWrapper.style.width = '100%';
            filterWrapper.style.height = '100%';
            filterWrapper.style.padding = '3px';
            const { maxAgeLabel, maxAgeInput } = setupMaxAgeFilterElements();
            const { minAgeLabel, minAgeInput } = setupMinAgeFilterElements();
            const filterButton = setupFilterButton();
            filterWrapper.appendChild(maxAgeLabel);
            filterWrapper.appendChild(maxAgeInput);
            filterWrapper.appendChild(createBreakElement());
            filterWrapper.appendChild(minAgeLabel);
            filterWrapper.appendChild(minAgeInput);
            filterWrapper.appendChild(createBreakElement());
            filterWrapper.appendChild(filterButton);
            filterWrapper.appendChild(createBreakElement());

            outerDivElmt.appendChild(filterWrapper);

            function setupFilterButton() {
                const filterButton = document.createElement('button');
                filterButton.style.borderRadius = '2px';
                filterButton.style.backgroundColor = 'grey';
                filterButton.style.transitionDuration = '0.4s';
                filterButton.onmouseover = () => {
                    filterButton.style.backgroundColor = 'white';
                    filterButton.style.border = '2px solid black';
                };
                filterButton.onmouseleave = () => {
                    filterButton.style.backgroundColor = 'grey';
                    filterButton.style.border = 'none';
                };
                filterButton.innerText = 'Filter Profiles';
                filterButton.onclick = (ev) => {
                    ev.preventDefault();
                    filterButtonClicked();
                };
                return filterButton;
            }

            function setupMaxAgeFilterElements() {
                const maxAgeInput = document.createElement('input');
                maxAgeInput.type = 'number';
                maxAgeInput.max = '120';
                maxAgeInput.min = '18';
                maxAgeInput.required = false;
                maxAgeInput.id = Constants.maxAgeInput;
                maxAgeInput.title = 'The maximum age someone can be before being filtered out. Note: will also filter out anyone who does not have an age listed.';
                maxAgeInput.placeholder = 'Max Age e.g. 55';
                maxAgeInput.style.border = '1px solid black';
                maxAgeInput.style.margin = '1px 3px 2px 3px';
                maxAgeInput.oninput = () => currentValues.maxAge = maxAgeInput.valueAsNumber;
                const maxAgeLabel = document.createElement('label');
                maxAgeLabel.htmlFor = maxAgeInput.id;
                maxAgeLabel.innerHTML = '<h3>Max Age</h3>';
                return { maxAgeLabel, maxAgeInput };
            }
            function setupMinAgeFilterElements() {
                const minAgeInput = document.createElement('input');
                minAgeInput.type = 'number';
                minAgeInput.max = '120';
                minAgeInput.min = '18';
                minAgeInput.required = false;
                minAgeInput.id = Constants.minAgeInput;
                minAgeInput.title = 'The minimum age someone can be before being filtered out. Note: will also filter out anyone who does not have an age listed.';
                minAgeInput.placeholder = 'Min Age e.g. 20';
                minAgeInput.style.border = '1px solid black';
                minAgeInput.style.margin = '1px 3px 2px 3px';
                minAgeInput.oninput = () => currentValues.minAge = minAgeInput.valueAsNumber;
                const minAgeLabel = document.createElement('label');
                minAgeLabel.htmlFor = minAgeInput.id;
                minAgeLabel.innerHTML = '<h3>Min Age</h3>';
                return { minAgeLabel, minAgeInput };
            }
        }
        function createBreakElement(): HTMLBRElement {
            return document.createElement('br');
        }
    }

    function clearUI() {
        const outerDiv = bodyElement.querySelector(`#${Constants.outerDivId}`);
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
})(document.body as HTMLBodyElement);

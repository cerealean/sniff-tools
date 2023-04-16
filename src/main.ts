interface Window {
    sniffTools: {
        initialized: boolean
    }
}
((bodyElement: HTMLBodyElement) => {
    interface FilterOptions {
        ageMax?: number;
        ageMin?: number;
        sizeMin?: number;
    }
    interface CurrentValues {
        size?: number;
        profilesHidden?: number;
        profilesShown?: number;
        maxAge?: number;
        minAge?: number;
    }
    type DeepPartial<T> = T extends object ? {
        [P in keyof T]?: DeepPartial<T[P]>;
    } : T;
    type ElementCreationGeneralFunctionProperties<T extends keyof HTMLElementTagNameMap> = Partial<Pick<HTMLElementTagNameMap[T], 'onblur' | 'onmouseover' | 'onmouseleave' | 'onclick'>>;
    type ElementCreationBaseOptions<T extends keyof HTMLElementTagNameMap> = DeepPartial<Pick<HTMLElementTagNameMap[T], 'id' | 'title' | 'innerHTML' | 'innerText' | 'style'>>;
    type ElementCreationInputOptions = Partial<Pick<HTMLInputElement, 'type' | 'max' | 'min' | 'required' | 'placeholder' | 'oninput'>>;
    type GeneralNonFunctionProperties<T extends keyof HTMLElementTagNameMap> = HTMLElementTagNameMap[T] extends HTMLInputElement
        ? ElementCreationInputOptions & ElementCreationBaseOptions<T>
        : HTMLElementTagNameMap[T] extends HTMLLabelElement
        ? DeepPartial<Pick<HTMLLabelElement, 'htmlFor'>> & ElementCreationBaseOptions<T>
        : ElementCreationBaseOptions<T>;
    type ElementCreationOptions<T extends keyof HTMLElementTagNameMap> = GeneralNonFunctionProperties<T> & ElementCreationGeneralFunctionProperties<T>;
    class Constants {
        static readonly namespace = 'sniff_extra_tooling_';
        static readonly outerDivId = this.namespace + 'outer_div';
        static readonly outerDivHeaderId = this.outerDivId + '_header';
        static readonly statsDivId = this.namespace + 'stats';
        static readonly filterWrapperDivId = this.namespace + 'filter_wrapper';
        static readonly maxAgeInput = this.namespace + 'max_age_input';
        static readonly minAgeInput = this.namespace + 'min_age_input';
        static readonly minSizeInput = this.namespace + 'min_size_input';
        static readonly bodyTypes = ['fit', 'slim', 'muscular', 'average', 'stocky', 'chubby', 'large'];
    }
    class Profile {
        age?: number;
        height?: string;
        size?: number;
        bodyType?: string;
        element?: HTMLDivElement;
    }
    let currentValues: CurrentValues = {};
    function isNumber(val: any) {
        return !isNaN(val);
    }
    function styleElement(elmt: HTMLElement, styleOptions: DeepPartial<CSSStyleDeclaration>) {
        const style = elmt.style as any;
        for (const [key, value] of Object.entries(styleOptions)) {
            style[key] = value;
        }
    }
    function createElement<T extends keyof HTMLElementTagNameMap>(tag: T, options?: ElementCreationOptions<T>): HTMLElementTagNameMap[T] {
        const newElement = document.createElement(tag);
        if (options) {
            if (options.id) newElement.id = options.id;
            if (options.title) newElement.title = options.title;
            if (options.innerHTML) newElement.innerHTML = options.innerHTML;
            if (options.innerText) newElement.innerText = options.innerText;
            if (newElement instanceof HTMLInputElement) {
                const castOptions = options as ElementCreationOptions<'input'>;
                if (castOptions.type) newElement.type = castOptions.type;
                if (castOptions.max) newElement.max = castOptions.max;
                if (castOptions.min) newElement.min = castOptions.min;
                if (castOptions.required) newElement.required = castOptions.required;
                if (castOptions.placeholder) newElement.placeholder = castOptions.placeholder;
                if (castOptions.oninput) newElement.oninput = castOptions.oninput;
            }
            if (newElement instanceof HTMLLabelElement) {
                const castOptions = options as ElementCreationOptions<'label'>;
                if (castOptions.htmlFor) newElement.htmlFor = castOptions.htmlFor;
            }
            if (options.onblur) newElement.onblur = options.onblur;
            if (options.onmouseleave) newElement.onmouseleave = options.onmouseleave;
            if (options.onmouseover) newElement.onmouseover = options.onmouseover;
            if (options.onclick) newElement.onclick = options.onclick;
            if (options.style) styleElement(newElement, options.style);
        }
        return newElement;
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
    function appendChildren(parent: HTMLElement, ...children: HTMLElement[]) {
        children.forEach(elmt => parent.appendChild(elmt));
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
    function parseTitleString(titleString?: string) {
        if (!titleString) return { age: undefined, height: undefined, dickSize: undefined, bodyType: undefined };

        const strParts = titleString.split(',').map(s => s.trim());

        return {
            age: strParts.find(sp => isNumber(sp)),
            height: strParts.find(sp => sp.includes("'") && sp.includes('"')),
            size: strParts.find(sp => sp.includes('"') && !sp.includes("'"))?.replace(/[^0-9\.]+/g, ''),
            bodyType: strParts.find(sp => Constants.bodyTypes.includes(sp.toLowerCase()))
        };
    }
    function getProfiles() {
        const parentElements: HTMLDivElement[] = Array.from(bodyElement.querySelectorAll('div.mapboxgl-marker.mapboxgl-marker-anchor-center').values()) as HTMLDivElement[];
        const profiles = parentElements.filter(pe => pe.querySelectorAll('div.title-tag').length <= 1).map(parentElement => {
            const newProfile = new Profile();
            const titleData = (parentElement.querySelector('div.title-tag') as HTMLElement)?.innerText || undefined;
            const { age, height, size, bodyType } = parseTitleString(titleData);
            newProfile.age = age ? +age : undefined;
            newProfile.height = height;
            newProfile.size = size ? Number(size) : undefined;
            newProfile.bodyType = bodyType;
            newProfile.element = parentElement;

            return newProfile;
        });
        console.log(profiles);

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
        if (filterOptions.sizeMin) {
            const profilesToFilter = profiles.filter(p => p.size === undefined || p.size < filterOptions.sizeMin!);
            profilesToHide.push(...profilesToFilter);
            profiles = profiles.filter(p => !profilesToFilter.includes(p));
        }
        currentValues.profilesShown = profiles.length;
        currentValues.profilesHidden = profilesToHide.length;
        showElements(...profiles.map(p => p.element!));
        hideElements(...profilesToHide.map(p => p.element!));
    }
    function updateStats() {
        const statsDiv = bodyElement.querySelector(`#${Constants.statsDivId}`) as HTMLDivElement | undefined;
        if (statsDiv) {
            statsDiv.innerHTML = `<strong>Profiles Shown</strong>:&nbsp;${currentValues.profilesShown},&nbsp;<strong>Profiles Hidden</strong>:&nbsp;${currentValues.profilesHidden}`;
        }
    }
    function filterButtonClicked() {
        filterUnwantedProfiles({
            ageMax: currentValues.maxAge,
            ageMin: currentValues.minAge,
            sizeMin: currentValues.size
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
            const statsDiv = createElement('div', { 
                id: Constants.statsDivId, 
                title: 'Profiles shown or hidden from the latest filter. Only updates when clicking the "Filter Profiles" button.',
                style: {
                    width: '100%',
                    textAlign: 'center'
                } 
            });
            outerDivElmt.appendChild(statsDiv);
        }
        function setupOuterDiv() {
            const outerDiv = createElement('div', {
                id: Constants.outerDivId,
                style: {
                    backgroundColor: 'white',
                    border: '3px solid black',
                    position: 'absolute',
                    zIndex: '99',
                    minWidth: '30vw',
                    resize: 'both',
                    overflow: 'hidden',
                    padding: '3px'
                }
            });

            return outerDiv;
        }
        function addOuterDivHeader(outerDivElmt: HTMLDivElement) {
            const headerElement = createElement('div', {
                id: Constants.outerDivHeaderId,
                innerHTML: '<h2>Sniff Tools</h2>',
                style: {
                    textAlign: 'center',
                    fontWeight: 'bolder',
                    borderBottom: '1px solid black',
                    cursor: 'move'
                },
                onblur: () => {
                    headerElement.style.cursor = 'initial';
                }
            });
            headerElement.appendChild(
                createElement('small', {
                    innerText: '[Minimize Filters]',
                    onclick: (ev) => {
                        const target = ev.target as HTMLElement;
                        const filterOptionsWrapper = outerDivElmt.querySelector(`#${Constants.filterWrapperDivId}`) as HTMLDivElement;
                        const isHidden = filterOptionsWrapper.style.display === 'none';
                        if(isHidden) {
                            showElements(filterOptionsWrapper);
                            target.innerText = '[Minimize Filters]';
                        } else {
                            hideElements(filterOptionsWrapper);
                            target.innerText = '[Show Filters]';
                        }
                    },
                    style: {
                        cursor: 'pointer'
                    }
                })
            );
            outerDivElmt.appendChild(headerElement);
        }
        function addFilterOptions(outerDivElmt: HTMLDivElement) {
            const filterWrapper = createElement('div', {
                style: { width: '100%', height: '100%', padding: '5px' },
                id: Constants.filterWrapperDivId
            });
            const { maxAgeLabel, maxAgeInput } = setupMaxAgeFilterElements();
            const { minAgeLabel, minAgeInput } = setupMinAgeFilterElements();
            const { minSizeLabel, minSizeInput } = setupMinSizeFilterElements();
            const filterButton = setupFilterButton();
            const resetButton = setupResetButton();
            appendChildren(
                filterWrapper,
                maxAgeLabel,
                maxAgeInput,
                createBreakElement(),
                minAgeLabel,
                minAgeInput,
                createBreakElement(),
                minSizeLabel,
                minSizeInput,
                createBreakElement(),
                createElement('hr'),
                createBreakElement(),
                filterButton,
                createElement('span', { innerHTML: '&nbsp;&nbsp;&nbsp;' }),
                resetButton,
                createBreakElement()
            );
            outerDivElmt.appendChild(filterWrapper);

            function setupMaxAgeFilterElements() {
                const maxAgeInput = createElement('input', {
                    type: 'number',
                    max: '120',
                    min: '18',
                    required: false,
                    id: Constants.maxAgeInput,
                    title: 'The maximum age someone can be before being filtered out. Note: will also filter out anyone who does not have an age listed.',
                    placeholder: 'Max Age e.g. 55',
                    oninput: (ev) => currentValues.maxAge = (ev.target as HTMLInputElement).valueAsNumber,
                    style: {
                        border: '1px solid black',
                        margin: '1px 3px 2px 3px',
                        padding: '2px'
                    }
                });
                const maxAgeLabel = createElement('label', {
                    htmlFor: maxAgeInput.id,
                    innerHTML: '<h3>Max Age</h3>'
                });
                return { maxAgeLabel, maxAgeInput };
            }
            function setupMinAgeFilterElements() {
                const minAgeInput = createElement('input', {
                    type: 'number',
                    max: '120',
                    min: '18',
                    required: false,
                    id: Constants.minAgeInput,
                    title: 'The minimum age someone can be before being filtered out. Note: will also filter out anyone who does not have an age listed.',
                    placeholder: 'Min Age e.g. 20',
                    oninput: (ev) => currentValues.minAge = (ev.target as HTMLInputElement).valueAsNumber,
                    style: {
                        border: '1px solid black',
                        margin: '1px 3px 2px 3px'
                    }
                });
                const minAgeLabel = createElement('label', {
                    htmlFor: minAgeInput.id,
                    innerHTML: '<h3>Min Age</h3>'
                });

                return { minAgeLabel, minAgeInput };
            }
            function setupMinSizeFilterElements() {
                const minSizeInput = createElement('input', {
                    type: 'number',
                    max: '20',
                    min: '0',
                    required: false,
                    id: Constants.minSizeInput,
                    placeholder: 'Min Size e.g. 5',
                    oninput: (ev) => currentValues.size = (ev.target as HTMLInputElement).valueAsNumber,
                    style: {
                        border: '1px solid black',
                        margin: '1px 3px 2px 3px'
                    }
                });
                const minSizeLabel = createElement('label', {
                    htmlFor: minSizeInput.id,
                    innerHTML: '<h3>Min Size</h3>'
                });

                return { minSizeLabel, minSizeInput };
            }
            function setupFilterButton() {
                return createElement('button', {
                    innerText: 'Filter Profiles',
                    style: {
                        borderRadius: '2px',
                        backgroundColor: 'grey',
                        transitionDuration: '0.4s'
                    },
                    onmouseover: (ev) => styleElement(
                        ev.target as HTMLButtonElement,
                        {
                            backgroundColor: 'white',
                            border: '2px solid black'
                        }
                    ),
                    onmouseleave: (ev) => styleElement(
                        ev.target as HTMLButtonElement,
                        {
                            backgroundColor: 'grey',
                            border: 'none'
                        }
                    ),
                    onclick: (ev) => {
                        ev.preventDefault();
                        filterButtonClicked();
                    }
                });
            }
            function setupResetButton() {
                return createElement('button', {
                    innerText: 'Reset Filters',
                    style: {
                        borderRadius: '2px',
                        backgroundColor: 'grey',
                        transitionDuration: '0.4s'
                    },
                    onmouseover: (ev) => styleElement(
                        ev.target as HTMLButtonElement,
                        {
                            backgroundColor: 'white',
                            border: '2px solid black'
                        }
                    ),
                    onmouseleave: (ev) => styleElement(
                        ev.target as HTMLButtonElement,
                        {
                            backgroundColor: 'grey',
                            border: 'none'
                        }
                    ),
                    onclick: (ev) => {
                        ev.preventDefault();
                        currentValues = {};
                        filterButtonClicked();
                    }
                });
            }
        }
        function createBreakElement(): HTMLBRElement {
            return createElement('br');
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

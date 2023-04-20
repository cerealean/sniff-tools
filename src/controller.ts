import { Constants } from "./constants";
import { CurrentValues } from "./interfaces/current-values";
import { FilterOptions } from "./interfaces/filter-options";
import { Profile } from "./models/profile";
import { DomUtility } from "./utilities/dom-utility";
import { TypeUtility } from "./utilities/type-utility";

export class Controller {
    private readonly domUtility: DomUtility;
    private readonly bodyElement: HTMLBodyElement;
    private currentValues: CurrentValues = {};
    private outerDiv!: HTMLDivElement;
    private currentFilterOptions?: FilterOptions;
    private observer?: MutationObserver;

    constructor(document: Document) {
        this.domUtility = new DomUtility(document);
        this.bodyElement = document.body as HTMLBodyElement;
    }

    public initialize() {
        this.setupUI();
        this.observer = new MutationObserver((mutations) => {
            const childrenChanges = mutations.find(mutation => mutation.type === "childList");
            if(childrenChanges && this.currentFilterOptions) {
                this.filterButtonClicked();
            }
        });
        const profilesContainer = this.bodyElement.querySelector(`.mapboxgl-canvas-container`);
        if (profilesContainer) {
            this.observer.observe(profilesContainer, { childList: true });
        }
    }

    public deInitialize() {
        this.observer?.disconnect();
        this.clearUI();
    }

    private setupUI() {
        this.outerDiv = this.setupOuterDiv();

        this.addOuterDivHeader();
        this.addStatsDiv();
        this.addFilterOptions();

        this.bodyElement.appendChild(this.outerDiv);
        this.domUtility.makeElementDraggable(this.outerDiv);
    }

    private clearUI() {
        const outerDiv = this.bodyElement.querySelector(`#${Constants.outerDivId}`);
        if (outerDiv) {
            outerDiv.remove();
        }
    }

    private setupOuterDiv() {
        const outerDiv = this.domUtility.createElement('div', {
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

    private addOuterDivHeader() {
        const headerElement = this.domUtility.createElement('div', {
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
            this.domUtility.createElement('small', {
                innerText: '[Minimize Filters]',
                onclick: (ev) => {
                    const target = ev.target as HTMLElement;
                    const filterOptionsWrapper = this.outerDiv.querySelector(`#${Constants.filterWrapperDivId}`) as HTMLDivElement;
                    const isHidden = filterOptionsWrapper.style.display === 'none';
                    if (isHidden) {
                        this.domUtility.showElements(filterOptionsWrapper);
                        target.innerText = '[Minimize Filters]';
                    } else {
                        this.domUtility.hideElements(filterOptionsWrapper);
                        target.innerText = '[Show Filters]';
                    }
                },
                style: {
                    cursor: 'pointer'
                }
            })
        );
        this.outerDiv.appendChild(headerElement);
    }

    private addStatsDiv() {
        const statsDiv = this.domUtility.createElement('div', {
            id: Constants.statsDivId,
            title: 'Profiles shown or hidden from the latest filter. Only updates when clicking the "Filter Profiles" button.',
            style: {
                width: '100%',
                textAlign: 'center'
            }
        });
        this.outerDiv.appendChild(statsDiv);
    }

    private addFilterOptions() {
        const filterWrapper = this.domUtility.createElement('div', {
            style: { width: '100%', height: '100%', padding: '5px' },
            id: Constants.filterWrapperDivId
        });
        const { maxAgeLabel, maxAgeInput } = this.setupMaxAgeFilterElements();
        const { minAgeLabel, minAgeInput } = this.setupMinAgeFilterElements();
        const { minSizeLabel, minSizeInput } = this.setupMinSizeFilterElements();
        const filterButton = this.setupFilterButton();
        const resetButton = this.setupResetButton();
        this.domUtility.appendChildren(
            filterWrapper,
            maxAgeLabel,
            maxAgeInput,
            this.createBreakElement(),
            minAgeLabel,
            minAgeInput,
            this.createBreakElement(),
            minSizeLabel,
            minSizeInput,
            this.createBreakElement(),
            this.domUtility.createElement('hr'),
            this.createBreakElement(),
            filterButton,
            this.domUtility.createElement('span', { innerHTML: '&nbsp;&nbsp;&nbsp;' }),
            resetButton,
            this.createBreakElement()
        );
        this.outerDiv.appendChild(filterWrapper);
    }

    private setupMaxAgeFilterElements() {
        const maxAgeInput = this.domUtility.createElement('input', {
            type: 'number',
            max: '120',
            min: '18',
            required: false,
            id: Constants.maxAgeInput,
            title: 'The maximum age someone can be before being filtered out. Note: will also filter out anyone who does not have an age listed.',
            placeholder: 'Max Age e.g. 55',
            oninput: (ev) => this.currentValues.maxAge = (ev.target as HTMLInputElement).valueAsNumber,
            style: {
                border: '1px solid black',
                margin: '1px 3px 2px 3px',
                padding: '2px',
                width: '80%'
            }
        });
        const maxAgeLabel = this.domUtility.createElement('label', {
            htmlFor: maxAgeInput.id,
            innerHTML: '<h3>Max Age</h3>'
        });
        return { maxAgeLabel, maxAgeInput };
    }

    private setupMinAgeFilterElements() {
        const minAgeInput = this.domUtility.createElement('input', {
            type: 'number',
            max: '120',
            min: '18',
            required: false,
            id: Constants.minAgeInput,
            title: 'The minimum age someone can be before being filtered out. Note: will also filter out anyone who does not have an age listed.',
            placeholder: 'Min Age e.g. 20',
            oninput: (ev) => this.currentValues.minAge = (ev.target as HTMLInputElement).valueAsNumber,
            style: {
                border: '1px solid black',
                margin: '1px 3px 2px 3px',
                width: '80%'
            }
        });
        const minAgeLabel = this.domUtility.createElement('label', {
            htmlFor: minAgeInput.id,
            innerHTML: '<h3>Min Age</h3>'
        });

        return { minAgeLabel, minAgeInput };
    }

    private setupMinSizeFilterElements() {
        const minSizeInput = this.domUtility.createElement('input', {
            type: 'number',
            max: '20',
            min: '0',
            required: false,
            id: Constants.minSizeInput,
            placeholder: 'Min Size e.g. 5',
            oninput: (ev) => this.currentValues.size = (ev.target as HTMLInputElement).valueAsNumber,
            style: {
                border: '1px solid black',
                margin: '1px 3px 2px 3px',
                width: '80%'
            }
        });
        const minSizeLabel = this.domUtility.createElement('label', {
            htmlFor: minSizeInput.id,
            innerHTML: '<h3>Min Size</h3>'
        });

        return { minSizeLabel, minSizeInput };
    }

    private setupFilterButton() {
        return this.domUtility.createElement('button', {
            innerText: 'Filter Profiles',
            style: {
                borderRadius: '2px',
                backgroundColor: 'grey',
                transitionDuration: '0.4s'
            },
            onmouseover: (ev) => this.domUtility.styleElement(
                ev.target as HTMLButtonElement,
                {
                    backgroundColor: 'white',
                    border: '2px solid black'
                }
            ),
            onmouseleave: (ev) => this.domUtility.styleElement(
                ev.target as HTMLButtonElement,
                {
                    backgroundColor: 'grey',
                    border: 'none'
                }
            ),
            onclick: (ev) => {
                ev.preventDefault();
                this.filterButtonClicked();
            }
        });
    }

    private setupResetButton() {
        return this.domUtility.createElement('button', {
            innerText: 'Reset Filters',
            style: {
                borderRadius: '2px',
                backgroundColor: 'grey',
                transitionDuration: '0.4s'
            },
            onmouseover: (ev) => this.domUtility.styleElement(
                ev.target as HTMLButtonElement,
                {
                    backgroundColor: 'white',
                    border: '2px solid black'
                }
            ),
            onmouseleave: (ev) => this.domUtility.styleElement(
                ev.target as HTMLButtonElement,
                {
                    backgroundColor: 'grey',
                    border: 'none'
                }
            ),
            onclick: (ev) => {
                ev.preventDefault();
                this.currentValues = {};
                this.filterButtonClicked();
            }
        });
    }

    private filterButtonClicked() {
        this.filterUnwantedProfiles({
            ageMax: this.currentValues.maxAge,
            ageMin: this.currentValues.minAge,
            sizeMin: this.currentValues.size
        });
        this.updateStats();
    }

    private updateStats() {
        const statsDiv = this.bodyElement.querySelector(`#${Constants.statsDivId}`) as HTMLDivElement | undefined;
        if (statsDiv) {
            statsDiv.innerHTML = `<strong>Profiles Shown</strong>:&nbsp;${this.currentValues.profilesShown},&nbsp;<strong>Profiles Hidden</strong>:&nbsp;${this.currentValues.profilesHidden}`;
        }
    }

    private getProfiles() {
        const parentElements: HTMLDivElement[] = Array.from(this.bodyElement.querySelectorAll('div.mapboxgl-marker.mapboxgl-marker-anchor-center').values()) as HTMLDivElement[];
        const profiles = parentElements.filter(pe => pe.querySelectorAll('div.title-tag').length <= 1).map(parentElement => {
            const newProfile = new Profile();
            const titleData = (parentElement.querySelector('div.title-tag') as HTMLElement)?.innerText || undefined;
            const { age, height, size, bodyType } = this.parseTitleString(titleData);
            newProfile.age = age ? +age : undefined;
            newProfile.height = height;
            newProfile.size = size ? Number(size) : undefined;
            newProfile.bodyType = bodyType;
            newProfile.element = parentElement;

            return newProfile;
        });

        return profiles;
    }

    private parseTitleString(titleString?: string) {
        if (!titleString) return { age: undefined, height: undefined, size: undefined, bodyType: undefined };

        const strParts = titleString.split(',').map(s => s.trim());

        return {
            age: strParts.find(sp => TypeUtility.isNumber(sp)),
            height: strParts.find(sp => sp.includes("'") && sp.includes('"')),
            size: strParts.find(sp => sp.includes('"') && !sp.includes("'"))?.replace(/[^0-9\.]+/g, ''),
            bodyType: strParts.find(sp => Constants.bodyTypes.includes(sp.toLowerCase()))
        };
    }

    private filterUnwantedProfiles(filterOptions: FilterOptions) {
        this.currentFilterOptions = filterOptions;
        let profiles = this.getProfiles();
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
        this.currentValues.profilesShown = profiles.length;
        this.currentValues.profilesHidden = profilesToHide.length;
        this.domUtility.showElements(...profiles.map(p => p.element!));
        this.domUtility.hideElements(...profilesToHide.map(p => p.element!));
    }

    private createBreakElement(): HTMLBRElement {
        return this.domUtility.createElement('br');
    }
}

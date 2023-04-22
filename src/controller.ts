import { BodyTypeConstants, ElementIdConstants, StyleConstants } from "./constants";
import { CurrentValues } from "./interfaces/current-values";
import { FilterOptions } from "./interfaces/filter-options";
import { Profile } from "./models/profile";
import { DomUtility } from "./utilities/dom-utility";
import { TypeUtility } from "./utilities/type-utility";

export class Controller {
    private readonly domUtility: DomUtility;
    private readonly bodyElement: HTMLBodyElement;
    private currentValues: CurrentValues = {};
    private outerDiv?: HTMLDivElement;
    private currentFilterOptions?: FilterOptions;
    private profilesObserver?: MutationObserver;
    private menuObserver?: MutationObserver;
    private chatControlsObserver?: MutationObserver;

    constructor(document: Document) {
        this.domUtility = new DomUtility(document);
        this.bodyElement = document.body as HTMLBodyElement;
    }

    public initialize() {
        this.setupUI();
        this.setupProfilesObserver();
        this.setupMenuObserver();
        this.chatControlsObserver = new MutationObserver((mutations) => {
            const childChanges = mutations.find(mutation => mutation.type === "childList");
            console.log('changes', childChanges);
            if (childChanges?.addedNodes?.length) {
                const target = (this.bodyElement.querySelector('.list-controls') as HTMLTableCellElement | undefined);
                if (target) {
                    const button = target.querySelectorAll('button')[1];
                    button.addEventListener('pointerup', () => {
                        setTimeout(() => {
                            console.log('appending');
                            target.appendChild(this.domUtility.createElement('button', {
                                className: 'ng-star-inserted',
                                innerText: 'Select All',
                                id: ElementIdConstants.selectAllConversationsButtonId,
                                onclick: () => {
                                    const chatHolderTableRows = Array.from(this.bodyElement.querySelectorAll('.chatholder>tr.chatholder-row-item>td.chat-avatar').values()) as HTMLTableRowElement[];
                                    console.log(chatHolderTableRows);
                                    if (chatHolderTableRows?.length) {
                                        chatHolderTableRows.forEach(chat => chat.dispatchEvent(new MouseEvent('click', { bubbles: true })));
                                    }
                                }
                            }));
                        });
                    });
                }
                // if (target && target.classList.contains('in-edit-mode')) {
                //     target.appendChild(this.domUtility.createElement('button', {
                //         className: 'ng-star-inserted',
                //         innerText: 'Select All',
                //         id: ElementIdConstants.selectAllConversationsButtonId,
                //         onclick: () => {
                //             const chatHolderTableRows = Array.from(this.bodyElement.querySelectorAll('#chatholder>tr.chatholder-row-item').values()) as HTMLTableRowElement[];
                //             console.log(chatHolderTableRows);
                //             if (chatHolderTableRows?.length) {
                //                 chatHolderTableRows.forEach(chat => chat.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true })));
                //             }
                //         }
                //     }));
                // } else {
                //     const selectAllButton = this.bodyElement.querySelector(`#${ElementIdConstants.selectAllConversationsButtonId}`);
                //     selectAllButton?.remove();
                // }
            }
        });
        const routerWrapper = this.bodyElement.querySelector('router-outlet')?.parentElement;
        this.chatControlsObserver.observe(routerWrapper!, {
            childList: true
        });
    }

    public deInitialize() {
        this.filterUnwantedProfiles({});
        this.profilesObserver?.disconnect();
        this.menuObserver?.disconnect();
        this.chatControlsObserver?.disconnect();
        this.clearUI();
    }

    private setupUI() {
        const styles = this.setupStyles();
        this.outerDiv = this.setupOuterDiv();
        this.outerDiv.appendChild(styles);

        this.addOuterDivHeader();
        this.addStatsDiv();
        this.addFiltersAndUtilities();

        this.bodyElement.appendChild(this.outerDiv);
        this.domUtility.makeElementDraggable(this.outerDiv);
        this.filterButtonClicked();
    }

    private clearUI() {
        const outerDiv = this.bodyElement.querySelector(`#${ElementIdConstants.outerDivId}`);
        if (outerDiv) {
            outerDiv.remove();
        }
        const menuOverlay = this.bodyElement.querySelector(`#${ElementIdConstants.menuOverlayId}`);
        if (menuOverlay) {
            menuOverlay.remove();
        }
    }

    private setupMenuObserver() {
        const menuObserver = new MutationObserver(mutations => {
            const childrenChanges = mutations.find(mutation => mutation.type === "childList");
            if (childrenChanges) {
                const addedFilterLayer = (Array.from(childrenChanges.addedNodes.values())
                    .find(x => (x as HTMLElement).querySelector('filter-layer-component')) as HTMLDivElement)
                    ?.querySelector('filter-layer-component')?.querySelector('div.list-item-group');
                if (addedFilterLayer && !this.bodyElement.querySelector(`#${ElementIdConstants.menuOverlayId}`)) {
                    const overlay = this.domUtility.createElement('div', {
                        style: {
                            width: '100%',
                            height: '100%',
                            cursor: 'not-allowed',
                            position: 'absolute',
                            top: '0',
                            left: '0',
                            backgroundColor: 'rgba(0,0,0,.5)'
                        },
                        onclick: (ev) => ev.preventDefault(),
                        title: 'Regular filters are disabled while using Sniff Tools to prevent errors',
                        id: ElementIdConstants.menuOverlayId
                    }, [
                        this.domUtility.createElement('div', {
                            style: {
                                borderBottom: '3px solid rgb(255, 0, 0)',
                                width: '100%',
                                transform: 'rotate(10deg)',
                                transformOrigin: 'left',
                                position: 'relative'
                            }
                        })
                    ]);
                    addedFilterLayer.appendChild(overlay);
                }
            }
        });
        const routerWrapper = this.bodyElement.querySelector('router-outlet')?.parentElement;
        if (routerWrapper) {
            menuObserver.observe(routerWrapper, {
                childList: true
            });
        }
    }

    private setupProfilesObserver() {
        this.profilesObserver = new MutationObserver((mutations) => {
            const childrenChanges = mutations.find(mutation => mutation.type === "childList");
            if (childrenChanges && this.currentFilterOptions) {
                this.filterButtonClicked();
            }
        });
        const profilesContainer = this.bodyElement.querySelector(`.mapboxgl-canvas-container`);
        if (profilesContainer) {
            this.profilesObserver.observe(profilesContainer, { childList: true });
        }
    }

    private setupStyles() {
        // const ctn = this.domUtility.createTextNode;
        const styles = this.domUtility.createElement('style', undefined, [
            this.domUtility.createTextNode(`#${ElementIdConstants.outerDivId} input{border-bottom:1px solid ${StyleConstants.BorderColor};flex:1;margin:.5em;backdrop-filter:brightness(0.75);flex:1;}`),
            this.domUtility.createTextNode(`#${ElementIdConstants.outerDivId} fieldset{display:flex;flex-direction:row;gap:2em;border:1px solid ${StyleConstants.BorderColor};vertical-align:middle;align-items:middle;}`),
            this.domUtility.createTextNode(`#${ElementIdConstants.outerDivId} fieldset>legend{font-size:12px;}`)
        ]);

        return styles;
    }

    private setupOuterDiv() {
        const outerDiv = this.domUtility.createElement('div', {
            id: ElementIdConstants.outerDivId,
            style: {
                backgroundColor: StyleConstants.BackgroundColor,
                color: StyleConstants.FontColor,
                border: `3px solid ${StyleConstants.BorderColor}`,
                position: 'absolute',
                zIndex: '99',
                width: '30vw',
                maxWidth: '600px',
                minWidth: '290px',
                resize: 'both',
                overflow: 'hidden'
            }
        });

        return outerDiv;
    }

    private addOuterDivHeader() {
        const headerElement = this.domUtility.createElement('div', {
            id: ElementIdConstants.outerDivHeaderId,
            innerHTML: '<h2>Sniff Tools</h2>',
            style: {
                textAlign: 'center',
                fontWeight: 'bolder',
                borderBottom: `1px solid ${StyleConstants.BorderColor}`,
                cursor: 'move'
            }
        }, [
            this.domUtility.createElement('small', {
                innerText: '[Minimize Filters]',
                onclick: (ev) => {
                    const target = ev.target as HTMLElement;
                    const filterOptionsWrapper = this.outerDiv!.querySelector(`#${ElementIdConstants.filterWrapperDivId}`) as HTMLDivElement;
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
            }),
            this.domUtility.createElement('button', {
                innerText: 'X',
                title: 'Close Filters (will restore all profiles)',
                style: {
                    position: 'absolute',
                    background: 'transparent',
                    fontWeight: 'bolder',
                    top: '2px',
                    right: '2px'
                },
                onclick: (ev) => {
                    ev.preventDefault();
                    this.deInitialize();
                }
            })
        ]);
        this.outerDiv!.appendChild(headerElement);
    }

    private addStatsDiv() {
        const statsDiv = this.domUtility.createElement('div', {
            id: ElementIdConstants.statsDivId,
            title: 'Profiles shown or hidden from the latest filter. Only updates when clicking the "Filter Profiles" button.',
            style: {
                width: '100%',
                textAlign: 'center'
            }
        });
        this.outerDiv!.appendChild(statsDiv);
    }

    private addFiltersAndUtilities() {
        const filterWrapper = this.domUtility.createElement('div', {
            style: { width: '100%', height: '100%', textAlign: 'center', alignItems: 'middle' },
            id: ElementIdConstants.filterWrapperDivId
        }, [
            this.createFieldsetWrapper('Age Filters', [this.setupMinAgeFilterElements(), this.setupMaxAgeFilterElements()]),
            this.createBreakElement(),
            this.createFieldsetWrapper('🍆 Filters', [this.setupMinSizeFilterElements(), this.setupMaxSizeFilterElements()]),
            this.createBreakElement(),
            this.domUtility.createElement('hr'),
            this.createBreakElement(),
            this.setupFilterButton(),
            this.domUtility.createElement('span', { innerHTML: '&nbsp;&nbsp;&nbsp;' }),
            this.setupResetButton(),
            this.createBreakElement()
        ]);
        this.outerDiv!.appendChild(filterWrapper);
    }

    private createFieldsetWrapper(fieldsetLegendText: string, fieldsetChildren: HTMLElement[] = []): HTMLFieldSetElement {
        return this.domUtility.createElement('fieldset', {
            style: {
                display: 'flex',
                flexDirection: 'row',
                gap: '2em',
                border: `1px solid ${StyleConstants.BorderColor}`,
                verticalAlign: 'middle',
                alignItems: 'middle'
            }
        }, [
            this.domUtility.createElement('legend', { innerText: fieldsetLegendText }),
            ...fieldsetChildren
        ]);
    }

    private setupMaxAgeFilterElements() {
        const maxAgeInput = this.domUtility.createElement('input', {
            type: 'number',
            max: '120',
            min: '18',
            required: false,
            id: ElementIdConstants.maxAgeInputId,
            title: 'The maximum age someone can be before being filtered out. Note: will also filter out anyone who does not have an age listed.',
            placeholder: 'Max Age e.g. 99',
            oninput: (ev) => this.currentValues.maxAge = (ev.target as HTMLInputElement).valueAsNumber,
            style: {
                flex: '1'
            }
        });
        return maxAgeInput;
    }

    private setupMinAgeFilterElements() {
        const minAgeInput = this.domUtility.createElement('input', {
            type: 'number',
            max: '120',
            min: '18',
            required: false,
            id: ElementIdConstants.minAgeInputId,
            title: 'The minimum age someone can be before being filtered out. Note: will also filter out anyone who does not have an age listed.',
            placeholder: 'Min Age e.g. 19',
            oninput: (ev) => this.currentValues.minAge = (ev.target as HTMLInputElement).valueAsNumber,
            style: {
                flex: '1'
            }
        });

        return minAgeInput;
    }

    private setupMaxSizeFilterElements() {
        const minSizeInput = this.domUtility.createElement('input', {
            type: 'number',
            max: '20',
            min: '0',
            id: ElementIdConstants.minSizeInputId,
            placeholder: 'Max Size e.g. 5',
            oninput: (ev) => this.currentValues.maxSize = (ev.target as HTMLInputElement).valueAsNumber
        });

        return minSizeInput;
    }

    private setupMinSizeFilterElements() {
        const minSizeInput = this.domUtility.createElement('input', {
            type: 'number',
            max: '20',
            min: '0',
            id: ElementIdConstants.minSizeInputId,
            placeholder: 'Min Size e.g. 5',
            oninput: (ev) => this.currentValues.minSize = (ev.target as HTMLInputElement).valueAsNumber
        });

        return minSizeInput;
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
            sizeMin: this.currentValues.minSize,
            sizeMax: this.currentValues.maxSize
        });
        this.updateStats();
    }

    private updateStats() {
        const statsDiv = this.bodyElement.querySelector(`#${ElementIdConstants.statsDivId}`) as HTMLDivElement | undefined;
        if (statsDiv) {
            statsDiv.innerHTML = `<strong>Profiles Shown</strong>:&nbsp;${this.currentValues.profilesShown},&nbsp;<strong>Profiles Hidden</strong>:&nbsp;${this.currentValues.profilesHidden}`;
        }
    }

    private getProfiles() {
        const parentElements: HTMLDivElement[] = Array.from(this.bodyElement.querySelectorAll('div.mapboxgl-marker.mapboxgl-marker-anchor-center').values()) as HTMLDivElement[];
        const profiles = parentElements.filter(pe => pe.querySelectorAll('div.title-tag').length <= 1).map(parentElement => {
            const titleData = (parentElement.querySelector('div.title-tag') as HTMLElement)?.innerText || undefined;
            const { age, height, size, bodyType } = this.parseTitleString(titleData);
            return new Profile(
                age ? +age : undefined,
                height,
                size ? Number(size) : undefined,
                bodyType,
                parentElement
            );
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
            bodyType: strParts.find(sp => (Object.values(BodyTypeConstants) as string[]).includes(sp.toLowerCase()))
        };
    }

    private filterUnwantedProfiles(filterOptions: FilterOptions) {
        this.currentFilterOptions = filterOptions;
        let profiles = this.getProfiles();
        const profilesToHide: Profile[] = [];
        if (filterOptions.ageMax) {
            const profilesToFilter = profiles.filter(p => p.age === undefined || p.age > filterOptions.ageMax!);
            profilesToHide.push(...profilesToFilter);
            profiles = profiles.filter(p => !profilesToFilter.includes(p));
        }
        if (filterOptions.ageMin) {
            const profilesToFilter = profiles.filter(p => p.age === undefined || p.age < filterOptions.ageMin!);
            profilesToHide.push(...profilesToFilter);
            profiles = profiles.filter(p => !profilesToFilter.includes(p));
        }
        if (filterOptions.sizeMax) {
            const profilesToFilter = profiles.filter(p => p.size === undefined || p.size > filterOptions.sizeMax!);
            profilesToHide.push(...profilesToFilter);
            profiles = profiles.filter(p => !profilesToFilter.includes(p));
        }
        if (filterOptions.sizeMin) {
            const profilesToFilter = profiles.filter(p => p.size === undefined || p.size < filterOptions.sizeMin!);
            profilesToHide.push(...profilesToFilter);
            profiles = profiles.filter(p => !profilesToFilter.includes(p));
        }
        this.currentValues.profilesShown = profiles.length;
        this.currentValues.profilesHidden = profilesToHide.length;
        profiles.forEach(p => this.domUtility.styleElement(p.element!, { animationDelay: '0', animationDuration: '0' }));
        this.domUtility.showElements(...profiles.map(p => p.element!));
        this.domUtility.hideElements(...profilesToHide.map(p => p.element!));
        profiles.forEach(p => this.domUtility.styleElement(p.element!, { animationDelay: 'initial', animationDuration: 'initial' }));
    }

    private createBreakElement(): HTMLBRElement {
        return this.domUtility.createElement('br');
    }
}

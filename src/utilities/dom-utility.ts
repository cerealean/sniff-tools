import { Constants } from "../constants";
import { DeepPartial } from "../types/deep-partial";
import { ElementCreationOptions } from '../types/element-creation-options';

export class DomUtility {
    constructor(private readonly document: Document) { }

    public styleElement(elmt: HTMLElement, styleOptions: DeepPartial<CSSStyleDeclaration>) {
        const style = elmt.style as any;
        for (const [key, value] of Object.entries(styleOptions)) {
            style[key] = value;
        }
    }

    public createElement<T extends keyof HTMLElementTagNameMap>(tag: T, options?: ElementCreationOptions<T>): HTMLElementTagNameMap[T] {
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
            if (options.style) this.styleElement(newElement, options.style);
        }
        return newElement;
    }
    public hideElements(...elements: HTMLElement[]) {
        elements.forEach(el => {
            if (el?.style) {
                el.style.display = 'none';
            }
        });
    }
    public showElements(...elements: HTMLElement[]) {
        elements.forEach(el => {
            if (el?.style) {
                el.style.display = 'initial';
            }
        });
    }
    public appendChildren(parent: HTMLElement, ...children: HTMLElement[]) {
        children.forEach(elmt => parent.appendChild(elmt));
    }
    public cloneElement<T extends HTMLElement>(elmt: T): T {
        return elmt.cloneNode() as T;
    }
    public makeElementDraggable(elmnt: HTMLElement) {
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
}
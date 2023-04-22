import { DeepPartial } from "./deep-partial";

type ElementCreationGeneralFunctionProperties<T extends keyof HTMLElementTagNameMap> = Partial<Pick<HTMLElementTagNameMap[T], 'onblur' | 'onmouseover' | 'onmouseleave' | 'onclick'>>;
type ElementCreationBaseOptions<T extends keyof HTMLElementTagNameMap> = DeepPartial<Pick<HTMLElementTagNameMap[T], 'id' | 'title' | 'innerHTML' | 'innerText' | 'style' | 'className'>>;
type ElementCreationInputOptions = Partial<Pick<HTMLInputElement, 'type' | 'max' | 'min' | 'required' | 'placeholder' | 'oninput'>>;
type GeneralNonFunctionProperties<T extends keyof HTMLElementTagNameMap> = HTMLElementTagNameMap[T] extends HTMLInputElement
    ? ElementCreationInputOptions & ElementCreationBaseOptions<T>
    : HTMLElementTagNameMap[T] extends HTMLLabelElement
    ? DeepPartial<Pick<HTMLLabelElement, 'htmlFor'>> & ElementCreationBaseOptions<T>
    : ElementCreationBaseOptions<T>;
export type ElementCreationOptions<T extends keyof HTMLElementTagNameMap> = GeneralNonFunctionProperties<T> & ElementCreationGeneralFunctionProperties<T>;

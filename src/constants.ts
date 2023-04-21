export class Constants {
    static readonly namespace = 'sniff_extra_tooling_';
    static readonly outerDivId = this.namespace + 'outer_div';
    static readonly outerDivHeaderId = this.outerDivId + '_header';
    static readonly statsDivId = this.namespace + 'stats';
    static readonly filterWrapperDivId = this.namespace + 'filter_wrapper';
    static readonly menuOverlayId = this.namespace + 'menu_overlay';
    static readonly maxAgeInput = this.namespace + 'max_age_input';
    static readonly minAgeInput = this.namespace + 'min_age_input';
    static readonly minSizeInput = this.namespace + 'min_size_input';
    static readonly bodyTypes = ['fit', 'slim', 'muscular', 'average', 'stocky', 'chubby', 'large'];
    static readonly styleConstants = {
        background: 'var(--cc-text)',
        font: 'var(--cc-bg)',
        border: 'var(--cc-bg)'
    };
}
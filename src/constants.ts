export const enum Application {
    namespace = 'sniff_extra_tooling_'
}

export const enum ElementIdConstants {
    outerDivId = Application.namespace + 'outer_div',
    outerDivHeaderId = ElementIdConstants.outerDivId + '_header',
    statsDivId = Application.namespace + 'stats',
    filterWrapperDivId = Application.namespace + 'filter_wrapper',
    menuOverlayId = Application.namespace + 'menu_overlay',
    maxAgeInputId = Application.namespace + 'max_age_input',
    minAgeInputId = Application.namespace + 'min_age_input',
    maxSizeInputId = Application.namespace + 'max_size_input',
    minSizeInputId = Application.namespace + 'min_size_input'
};

export const enum StyleConstants {
    BackgroundColor = 'var(--cc-text)',
    FontColor = 'var(--cc-bg)',
    BorderColor = 'var(--cc-bg)'
}

export enum BodyTypeConstants {
    Fit = 'fit',
    Slim = 'slim',
    Muscular = 'muscular',
    Average = 'average',
    Stocky = 'stocky',
    Chubby = 'chubby',
    Large = 'large'
}

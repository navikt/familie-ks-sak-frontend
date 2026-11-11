export interface IToast {
    alertType: AlertType;
    tekst: string;
}

export enum ToastTyper {
    FANT_IKKE_FAGSAK = 'FANT_IKKE_FAGSAK',
    MANGLER_TILGANG = 'MANGLER_TILGANG',
    ETTERBETALING_KORRIGERT = 'ETTERBETALING_KORRIGERT',
    BREVMOTTAKER_LAGRET = 'BREVMOTTAKER_LAGRET',
    BREVMOTTAKER_FJERNET = 'BREVMOTTAKER_FJERNET',
}

export enum AlertType {
    ERROR = 'error',
    WARNING = 'warning',
    ANNOUNCEMENT = 'announcement',
    SUCCESS = 'success',
}

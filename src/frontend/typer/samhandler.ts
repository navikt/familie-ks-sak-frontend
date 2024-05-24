interface ISamhandlerAdresse {
    adresselinjer: string[];
    postNr: string;
    postSted: string;
    adresseType: string;
}

export interface ISamhandlerInfo {
    orgNummer: string;
    tssEksternId: string;
    navn: string;
    adresser: ISamhandlerAdresse[];
}

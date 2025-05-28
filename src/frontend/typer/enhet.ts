import { erProd } from '../utils/miljø';

export const behandendeEnheter: IArbeidsfordelingsenhet[] = [
    { enhetId: '2103', enhetNavn: 'NAV Vikafossen' },
    { enhetId: '4806', enhetNavn: 'NAV Familie- og pensjonsytelser Drammen' },
    { enhetId: '4820', enhetNavn: 'NAV Familie- og pensjonsytelser Vadsø' },
    { enhetId: '4833', enhetNavn: 'NAV Familie- og pensjonsytelser Oslo 1' },
    { enhetId: '4842', enhetNavn: 'NAV Familie- og pensjonsytelser Stord' },
    { enhetId: '4817', enhetNavn: 'NAV Familie- og pensjonsytelser Steinkjer' },
    { enhetId: '4812', enhetNavn: 'NAV Familie- og pensjonsytelser Bergen' },
];

export const enhetsgrupper: Record<string, string> = {
    '2103': '60102d01-2521-40b4-97b9-e2d738f642c1',
    '4806': '0d746128-7cb0-431b-9420-885e7a75260f',
    '4820': '4a9058c7-daae-452a-9fea-23beaa0778ff',
    '4833': 'fde8342e-d9e6-4879-be17-a8f17cb9abfb',
    '4842': '4c0aff0d-78f9-4a4d-94d3-a31a28d75142',
    '4817': '8672ac10-31f5-44df-b4a2-16d5443847bc',
    '4812': '4bfcd9dc-0290-4562-b352-6c56861a2dad',
};

export interface IArbeidsfordelingsenhet {
    enhetId: string;
    enhetNavn: string;
}

export interface IRestEndreBehandlendeEnhet {
    enhetId: string;
    begrunnelse: string;
}

export const harTilgangTilEnhet = (
    enhet: string,
    grupper: string[],
    alltidTilgang: () => boolean = () => !erProd()
): boolean => {
    const enhetsgruppe: string | undefined = enhetsgrupper[enhet];

    if (!enhetsgruppe) return true;

    return alltidTilgang() ? true : grupper.includes(enhetsgruppe);
};

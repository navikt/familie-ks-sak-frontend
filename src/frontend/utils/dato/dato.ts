import {
    format,
    isValid,
    parseISO,
    startOfDay,
    startOfToday,
    isBefore,
    isAfter,
    isSameDay,
} from 'date-fns';

import type { FeltState } from '@navikt/familie-skjema';
import { feil, ok } from '@navikt/familie-skjema';

export type IsoDatoString = string; // Format YYYY-MM-DD (ISO)
export type IsoMånedString = string; // Format YYYY-MM (ISO)

export const hentDagensDato = () => startOfToday();

export const tidenesMorgen = new Date(1000, 1, 1);

export const tidenesEnde = new Date(3000, 1, 1);

export const datoForLovendringAugust24 = startOfDay(new Date(2024, 7, 1));

export const fødselsdatoGrenseLovendringFebruar2025 = startOfDay(new Date(2024, 0, 1));

export enum Datoformat {
    DATO = 'dd.MM.yyyy',
    DATO_FORKORTTET = 'dd.MM.yy',
    DATO_FORLENGET = 'PPP',
    DATO_FORLENGET_MED_TID = 'PPPp',
    ISO_MÅNED = 'yyyy-MM',
    ISO_DAG = 'yyyy-MM-dd',
    DATO_TID = 'dd.MM.yy HH:mm',
    DATO_TID_SEKUNDER = 'dd.MM.yy HH:mm:ss',
    TID = 'HH:mm',
    MÅNED = 'MM.yy',
    MÅNED_ÅR = 'MM.yyyy',
    MÅNED_ÅR_NAVN = 'MMMM yyyy',
    MÅNED_ÅR_KORTNAVN = 'MMM yyyy',
    MÅNED_NAVN = 'MMM',
}

interface DateTilFormatertStringProps {
    date?: Date;
    tilFormat: Datoformat;
    defaultString?: string;
}

export const dateTilFormatertString = ({
    date,
    tilFormat,
    defaultString = '',
}: DateTilFormatertStringProps): string => {
    return date && isValid(date) ? format(date, tilFormat) : defaultString;
};
export const dateTilIsoDatoString = (dato?: Date): IsoDatoString =>
    dateTilFormatertString({ date: dato, tilFormat: Datoformat.ISO_DAG, defaultString: '' });

export const dateTilIsoMånedÅrString = (dato?: Date): IsoDatoString =>
    dateTilFormatertString({ date: dato, tilFormat: Datoformat.ISO_MÅNED, defaultString: '' });

export const dateTilIsoDatoStringEllerUndefined = (dato?: Date): IsoDatoString | undefined =>
    dato && isValid(dato) ? format(dato, Datoformat.ISO_DAG) : undefined;

interface IsoStringTilFormatertStringProps {
    isoString: IsoDatoString | IsoMånedString | undefined;
    tilFormat: Datoformat;
    defaultString?: string;
}

export const isoStringTilFormatertString = ({
    isoString,
    tilFormat,
    defaultString = '',
}: IsoStringTilFormatertStringProps): string => {
    const dato = isoString ? parseISO(isoString) : undefined;
    return dateTilFormatertString({
        date: dato,
        tilFormat: tilFormat,
        defaultString: defaultString,
    });
};

export const isoStringTilDate = (isoDatoString: IsoDatoString | IsoMånedString): Date => {
    const dato = parseISO(isoDatoString);

    if (!isValid(dato)) {
        throw new Error(`Dato '${isoDatoString}' er ugyldig`);
    }

    return dato;
};

export const isoStringTilDateEllerUndefinedHvisUgyldigDato = (
    isoDatoString: IsoDatoString | IsoMånedString | undefined
): Date | undefined => {
    if (isoDatoString === undefined) return undefined;
    const dato = parseISO(isoDatoString);

    return isValid(dato) ? dato : undefined;
};

interface IsoStringTilDateProps {
    isoString: IsoDatoString | IsoMånedString | undefined;
    fallbackDate: Date;
}

export const isoStringTilDateMedFallback = ({ isoString, fallbackDate }: IsoStringTilDateProps) =>
    isoString ? isoStringTilDate(isoString) : fallbackDate;

export const validerGyldigDato = (felt: FeltState<Date | undefined>) =>
    felt.verdi && isValid(felt.verdi) ? ok(felt) : feil(felt, 'Du må velge en gyldig dato');

export const erIsoStringGyldig = (isoString?: IsoDatoString): boolean => {
    if (!isoString) return false;

    const dato = parseISO(isoString);
    return isValid(dato);
};

export const parseTilOgMedDato = (tom: IsoDatoString | undefined) =>
    isoStringTilDateMedFallback({
        isoString: tom,
        fallbackDate: tidenesEnde,
    });

export const parseFraOgMedDato = (fom: IsoDatoString | undefined) =>
    isoStringTilDateMedFallback({
        isoString: fom,
        fallbackDate: tidenesMorgen,
    });

/**
 * @returns true hvis dato1 er før eller samme dato som dato2
 */
export const erFørEllerSammeDato = (dato1: Date, dato2: Date) =>
    isBefore(dato1, dato2) || isSameDay(dato1, dato2);

/**
 * @returns true hvis dato1 er etter eller samme dato som dato2
 */
export const erEtterEllerSammeDato = (dato1: Date, dato2: Date) =>
    isAfter(dato1, dato2) || isSameDay(dato1, dato2);

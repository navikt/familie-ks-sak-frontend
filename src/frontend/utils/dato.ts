import { format, isValid, parseISO, startOfToday } from 'date-fns';

import type { FeltState } from '@navikt/familie-skjema';
import { feil, ok } from '@navikt/familie-skjema';

export type IsoDatoString = string; // Format YYYY-MM-DD (ISO)
export type IsoMånedString = string; // Format YYYY-MM (ISO)

export const dagensDato = startOfToday();

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

export const dateTilIsoDatoStringEllerUndefined = (dato?: Date): IsoDatoString | undefined =>
    dato && isValid(dato) ? format(dato, Datoformat.ISO_DAG) : undefined;

export const isoStringTilDate = (isoDatoString: IsoDatoString | IsoMånedString): Date => {
    const dato = parseISO(isoDatoString);

    if (!isValid(dato)) {
        throw new Error(`Dato '${isoDatoString}' er ugyldig`);
    }

    return dato;
};

export const validerGyldigDato = (felt: FeltState<Date | undefined>) =>
    felt.verdi && isValid(felt.verdi) ? ok(felt) : feil(felt, 'Du må velge en gyldig dato');

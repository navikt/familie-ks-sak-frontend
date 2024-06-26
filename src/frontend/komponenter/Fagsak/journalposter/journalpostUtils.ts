import { isAfter } from 'date-fns';

import type { SortState } from '@navikt/ds-react';
import { JournalpostDatotype } from '@navikt/familie-typer';
import type { IJournalpost, IJournalpostRelevantDato } from '@navikt/familie-typer';

import { isoStringTilDate } from '../../../utils/dato';

const sorterJournalposterStigende = (a: IJournalpost, b: IJournalpost) => {
    if (!a.datoMottatt) {
        return -1;
    }
    if (!b.datoMottatt) {
        return 1;
    }
    return isAfter(isoStringTilDate(a.datoMottatt), isoStringTilDate(b.datoMottatt)) ? 1 : -1;
};

const sorterJournalposterSynkende = (a: IJournalpost, b: IJournalpost) =>
    -1 * sorterJournalposterStigende(a, b);

export enum Sorteringsrekkefølge {
    STIGENDE,
    SYNKENDE,
    INGEN_SORTERING,
}

export const hentSorterteJournalposter = (
    journalposter: IJournalpost[],
    sortering: Sorteringsrekkefølge
) => {
    switch (sortering) {
        case Sorteringsrekkefølge.INGEN_SORTERING:
            return journalposter;
        case Sorteringsrekkefølge.STIGENDE:
            return [...journalposter].sort(sorterJournalposterStigende);
        case Sorteringsrekkefølge.SYNKENDE:
            return [...journalposter].sort(sorterJournalposterSynkende);
    }
};

const mapFagsystemkodeTilTekst = (kode: string | undefined) => {
    switch (kode) {
        case 'KONT':
            return 'NAV Kontantstøtte';
        case undefined:
            return '-';
        default:
            return kode;
    }
};

export const hentDatoRegistrertSendt = (
    relevanteDatoer: IJournalpostRelevantDato[],
    journalposttype: string
) => {
    return relevanteDatoer.find(dato => {
        if (journalposttype === 'I') {
            return dato.datotype === JournalpostDatotype.DATO_REGISTRERT;
        } else {
            return dato.datotype === JournalpostDatotype.DATO_JOURNALFOERT;
        }
    })?.dato;
};

export const hentSortState = (
    sortering: Sorteringsrekkefølge,
    sortKey: string
): SortState | undefined =>
    sortering === Sorteringsrekkefølge.INGEN_SORTERING
        ? undefined
        : {
              orderBy: sortKey,
              direction: sortering === Sorteringsrekkefølge.STIGENDE ? 'ascending' : 'descending',
          };

export const formaterFagsak = (fagsystemKode: string | undefined, fagsakId: string | undefined) => {
    const fagsystem = mapFagsystemkodeTilTekst(fagsystemKode);
    const saksid = fagsakId ?? '-';
    return fagsystem + ' | ' + saksid;
};

import { isAfter } from 'date-fns';

import type { SortState } from '@navikt/ds-react';
import type { IJournalpostRelevantDato } from '@navikt/familie-typer';
import { JournalpostDatotype } from '@navikt/familie-typer';

import type { ITilgangsstyrtJournalpost } from '../../../typer/journalpost';
import { isoStringTilDate } from '../../../utils/dato';

const sorterJournalposterStigende = (a: ITilgangsstyrtJournalpost, b: ITilgangsstyrtJournalpost) => {
    if (!a.journalpost.datoMottatt) {
        return -1;
    }
    if (!b.journalpost.datoMottatt) {
        return 1;
    }
    return isAfter(isoStringTilDate(a.journalpost.datoMottatt), isoStringTilDate(b.journalpost.datoMottatt)) ? 1 : -1;
};

const sorterJournalposterSynkende = (a: ITilgangsstyrtJournalpost, b: ITilgangsstyrtJournalpost) =>
    -1 * sorterJournalposterStigende(a, b);

export enum Sorteringsrekkefølge {
    STIGENDE,
    SYNKENDE,
    INGEN_SORTERING,
}

export const hentSorterteJournalposter = (
    tilgangsstyrtJournalpost: ITilgangsstyrtJournalpost[],
    sortering: Sorteringsrekkefølge
) => {
    switch (sortering) {
        case Sorteringsrekkefølge.INGEN_SORTERING:
            return tilgangsstyrtJournalpost;
        case Sorteringsrekkefølge.STIGENDE:
            return [...tilgangsstyrtJournalpost].sort(sorterJournalposterStigende);
        case Sorteringsrekkefølge.SYNKENDE:
            return [...tilgangsstyrtJournalpost].sort(sorterJournalposterSynkende);
    }
};

const mapFagsystemkodeTilTekst = (kode: string | undefined) => {
    switch (kode) {
        case 'KONT':
            return 'Nav Kontantstøtte';
        case undefined:
            return '-';
        default:
            return kode;
    }
};

export const hentDatoRegistrertSendt = (relevanteDatoer: IJournalpostRelevantDato[], journalposttype: string) => {
    return relevanteDatoer.find(dato => {
        if (journalposttype === 'I') {
            return dato.datotype === JournalpostDatotype.DATO_REGISTRERT;
        } else {
            return dato.datotype === JournalpostDatotype.DATO_JOURNALFOERT;
        }
    })?.dato;
};

export const hentSortState = (sortering: Sorteringsrekkefølge, sortKey: string): SortState | undefined =>
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

import {
    AvsenderMottakerIdType,
    type IDokumentInfo,
    type IJournalpost,
    JournalpostDatotype,
    Journalposttype,
    Journalstatus,
} from '@navikt/familie-typer';

import type { ITilgangsstyrtJournalpost } from '../../typer/journalpost';
import type { IDataForManuellJournalføring } from '../../typer/manuell-journalføring';
import { lagOppgave } from './oppgaveTestdata';
import { lagPerson } from './personTestdata';

export function lagDokumentInfo(dokumentInfo: Partial<IDokumentInfo> = {}): IDokumentInfo {
    return {
        dokumentInfoId: '1',
        tittel: 'Søknad om kontantstøtte',
        brevkode: 'NAV 34-00.08',
        logiskeVedlegg: [],
        ...dokumentInfo,
    };
}

export function lagJournalpost(journalpost: Partial<IJournalpost> = {}): IJournalpost {
    return {
        journalpostId: '1',
        journalposttype: Journalposttype.I,
        journalstatus: Journalstatus.MOTTATT,
        tittel: 'Søknad om kontantstøtte',
        datoMottatt: '2026-10-01T08:00:00',
        kanal: 'SKAN_IM',
        avsenderMottaker: {
            erLikBruker: true,
            id: '12345678910',
            navn: 'Søker Testersen',
            land: 'NO',
            type: AvsenderMottakerIdType.FNR,
        },
        dokumenter: [lagDokumentInfo()],
        relevanteDatoer: [{ dato: '2026-10-01T08:00:00', datotype: JournalpostDatotype.DATO_REGISTRERT }],
        ...journalpost,
    };
}

export function lagTilgangsstyrtJournalpost(
    journalpost: Partial<IJournalpost> = {},
    harTilgang = true
): ITilgangsstyrtJournalpost {
    return {
        journalpost: lagJournalpost(journalpost),
        journalpostTilgang: { harTilgang, begrunnelse: harTilgang ? '' : 'Dokumentet gjelder en annen bruker.' },
    };
}

export function lagDataForManuellJournalføring(
    data: Partial<IDataForManuellJournalføring> = {}
): IDataForManuellJournalføring {
    return {
        journalpost: lagJournalpost({ journalpostId: '1' }),
        oppgave: lagOppgave({
            id: '1',
            oppgavetype: 'JFR',
            journalpostId: '1',
            beskrivelse: 'Journalføring',
            tilordnetRessurs: 'A1',
        }),
        person: lagPerson({ personIdent: '12345678910', navn: 'Søker Testersen' }),
        minimalFagsak: undefined,
        ...data,
    };
}

export * as JournalpostTestdata from './journalpostTestdata';

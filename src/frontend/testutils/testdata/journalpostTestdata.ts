import { type IJournalpost, Journalposttype, Journalstatus } from '@navikt/familie-typer';

export function lagJournalpost(journalpost: Partial<IJournalpost> = {}): IJournalpost {
    return {
        journalpostId: '123',
        journalposttype: Journalposttype.I,
        journalstatus: Journalstatus.MOTTATT,
        kanal: 'SKAN_IM',
        dokumenter: [],
        relevanteDatoer: [],
        ...journalpost,
    };
}

export * as JournalpostTestdata from './journalpostTestdata';

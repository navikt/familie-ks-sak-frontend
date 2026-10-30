import type { IOppgave } from '@typer/oppgave';

export function lagOppgave(oppgave?: Partial<IOppgave>): IOppgave {
    return {
        id: '123',
        tildeltEnhetsnr: '4812',
        journalpostId: '987654321',
        saksreferanse: '1',
        aktoerId: '1234567890123',
        behandlingstema: 'ab0084',
        behandlingstype: 'ae0034',
        beskrivelse: 'Beskrivelse',
        fristFerdigstillelse: '2026-11-30',
        oppgavetype: 'BEH_SAK',
        opprettetTidspunkt: '2026-11-01T10:00:00',
        prioritet: 'NORM',
        status: 'OPPRETTET',
        ...oppgave,
    };
}

export * as OppgaveTestdata from './oppgaveTestdata';

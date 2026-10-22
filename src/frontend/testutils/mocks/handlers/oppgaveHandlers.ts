import { byggSuksessRessurs } from '@navikt/familie-typer';
import { HttpResponse, http } from 'msw';

import { JournalpostTestdata } from '../../testdata/journalpostTestdata';
import { OppgaveTestdata } from '../../testdata/oppgaveTestdata';

export const oppgaveHandlers = [
    http.post('/familie-ks-sak/api/oppgave/hent-oppgaver', () => {
        return HttpResponse.json(byggSuksessRessurs(OppgaveTestdata.lagHentOppgaveDto()));
    }),
    http.get<{ oppgaveId: string }>('/familie-ks-sak/api/oppgave/:oppgaveId', () => {
        return HttpResponse.json(byggSuksessRessurs(JournalpostTestdata.lagDataForManuellJournalføring()));
    }),
];

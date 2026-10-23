import { byggSuksessRessurs } from '@navikt/familie-typer';
import { HttpResponse, http } from 'msw';

import { lagBydel } from '../../testdata/barnehagebarnTestdata';

export const barnehagebarnHandlers = [
    http.get('/familie-ks-sak/api/barnehagebarn/bydeler', () => {
        return HttpResponse.json(
            byggSuksessRessurs([lagBydel(), lagBydel({ organisasjonsnummer: '971179686', navn: 'St. Hanshaugen' })])
        );
    }),
];

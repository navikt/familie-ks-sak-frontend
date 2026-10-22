import { byggSuksessRessurs } from '@navikt/familie-typer';
import { HttpResponse, http } from 'msw';

import { BarnehagebarnTestdata } from '../../testdata/barnehagebarnTestdata';

export const barnehagebarnHandlers = [
    http.get('/familie-ks-sak/api/barnehagebarn/barnehagekommuner', () => {
        return HttpResponse.json(byggSuksessRessurs(['Oslo', 'Bergen']));
    }),
    http.post('/familie-ks-sak/api/barnehagebarn/barnehagebarnliste', () => {
        return HttpResponse.json(byggSuksessRessurs(BarnehagebarnTestdata.lagBarnehagebarnResponse()));
    }),
];

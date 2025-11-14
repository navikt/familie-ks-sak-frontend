import { http, HttpResponse } from 'msw';

import { byggSuksessRessurs } from '@navikt/familie-typer';

import { alleTogglerAv } from '../../../typer/toggles';

export const featureToggleHandlers = [
    http.post('/familie-ks-sak/api/featuretoggles', () => {
        return HttpResponse.json(byggSuksessRessurs(alleTogglerAv()));
    }),
];

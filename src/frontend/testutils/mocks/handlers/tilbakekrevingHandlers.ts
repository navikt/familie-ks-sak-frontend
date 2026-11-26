import { byggSuksessRessurs } from '@navikt/familie-typer';
import { HttpResponse, http } from 'msw';

import { TilbakekrevingTestdata } from '../../testdata/tilbakekrevingTestdata';

export const tilbakekrevingHandlers = [
    http.get<{
        fagsakId: string;
    }>('/familie-ks-sak/api/tilbakekreving/fagsak/:fagsakId', () => {
        return HttpResponse.json(byggSuksessRessurs([TilbakekrevingTestdata.lagTilbakekrevingbehandling()]));
    }),
    http.get<{ behandlingId: string }>('/familie-ks-sak/api/tilbakekreving/behandling/:behandlingId', () => {
        return HttpResponse.json(byggSuksessRessurs(null));
    }),
];

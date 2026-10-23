import { byggSuksessRessurs } from '@navikt/familie-typer';
import { HttpResponse, http } from 'msw';

import { TilbakekrevingTestdata } from '../../testdata/tilbakekrevingTestdata';

export const tilbakekrevingHandlers = [
    http.get<{
        fagsakId: string;
    }>('/familie-ks-sak/api/tilbakekreving/fagsak/:fagsakId', () => {
        return HttpResponse.json(byggSuksessRessurs([TilbakekrevingTestdata.lagTilbakekrevingbehandling()]));
    }),
    // msw matcher mot URL-kodet sti, så æøå må kodes.
    http.get<{ fagsakId: string }>(
        encodeURI('/familie-ks-sak/api/fagsaker/:fagsakId/har-åpen-tilbakekrevingsbehandling'),
        () => {
            return HttpResponse.json(byggSuksessRessurs(false));
        }
    ),
];

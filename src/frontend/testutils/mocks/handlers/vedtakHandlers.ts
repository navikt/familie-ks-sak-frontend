import { byggSuksessRessurs } from '@navikt/familie-typer';
import type { IVedtaksperiodeMedBegrunnelser } from '@typer/vedtaksperiode';
import { HttpResponse, http } from 'msw';

import { VedtaksperiodeTestdata } from '../../testdata/vedtaksperiodeTestdata';

export const vedtakHandlers = [
    http.get<{ behandlingId: string }>(
        '/familie-ks-sak/api/vedtaksperioder/behandling/:behandlingId/hent-vedtaksperioder',
        () => {
            return HttpResponse.json(byggSuksessRessurs<IVedtaksperiodeMedBegrunnelser[]>([]));
        }
    ),
    http.get<{ vedtaksperiodeId: string }>(
        '/familie-ks-sak/api/vedtaksperioder/:vedtaksperiodeId/brevbegrunnelser',
        () => {
            return HttpResponse.json(byggSuksessRessurs<string[]>([]));
        }
    ),
    // msw matcher mot URL-kodet sti, så æøå må kodes.
    http.get(encodeURI('/familie-ks-sak/api/vilkårsvurdering/vilkaarsbegrunnelser'), () => {
        return HttpResponse.json(byggSuksessRessurs(VedtaksperiodeTestdata.lagAlleBegrunnelser()));
    }),
    http.get<{ behandlingId: string }>('/familie-ks-sak/api/sammensatt-kontrollsak/:behandlingId', () => {
        return HttpResponse.json(byggSuksessRessurs(null));
    }),
];

import { byggSuksessRessurs } from '@navikt/familie-typer';
import type { IRestFeilutbetaltValuta } from '@typer/eøs-feilutbetalt-valuta';
import type { IRestRefusjonEøs } from '@typer/refusjon-eøs';
import { BegrunnelseType } from '@typer/vedtak';
import type { IVedtaksperiodeMedBegrunnelser } from '@typer/vedtaksperiode';
import { HttpResponse, http } from 'msw';

export const vedtakHandlers = [
    http.get<{ behandlingId: string }>(
        '/familie-ks-sak/api/vedtaksperioder/behandling/:behandlingId/hent-vedtaksperioder',
        () => {
            return HttpResponse.json(byggSuksessRessurs<IVedtaksperiodeMedBegrunnelser[]>([]));
        }
    ),
    http.get('/familie-ks-sak/api/vilkårsvurdering/vilkaarsbegrunnelser', () => {
        return HttpResponse.json(
            byggSuksessRessurs(Object.fromEntries(Object.values(BegrunnelseType).map(type => [type, []])))
        );
    }),
    http.get<{ behandlingId: string }>('/familie-ks-sak/api/sammensatt-kontrollsak/:behandlingId', () => {
        return HttpResponse.json(byggSuksessRessurs(null));
    }),
    http.get<{ behandlingId: string }>('/familie-ks-sak/api/feilutbetalt-valuta/behandlinger/:behandlingId', () => {
        return HttpResponse.json(byggSuksessRessurs<IRestFeilutbetaltValuta[]>([]));
    }),
    http.get<{ behandlingId: string }>('/familie-ks-sak/api/refusjon-eøs/behandlinger/:behandlingId', () => {
        return HttpResponse.json(byggSuksessRessurs<IRestRefusjonEøs[]>([]));
    }),
];

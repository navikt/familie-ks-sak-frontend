import { type DefaultError, useQuery, type UseQueryOptions } from '@tanstack/react-query';

import { useHttp } from '@navikt/familie-http';

import { hentForhåndsvisBehandlingBrev } from '../api/hentForhåndsvisBehandlingBrev';
import type { IManueltBrevRequestPåBehandling } from '../typer/dokument';
import { opprettPdfBlob } from '../utils/blob';

type Parameters = Omit<
    UseQueryOptions<Blob, DefaultError, IManueltBrevRequestPåBehandling>,
    'queryKey' | 'queryFn' | 'gcTime'
> & {
    behandlingId: number | undefined;
    payload: IManueltBrevRequestPåBehandling;
    onSuccess?: (blob: Blob) => void;
    onError?: (error: Error) => void;
};

export const HentForhåndsvisbarBehandlingBrevPdfQueryKeyFactory = {
    forhåndsvisbarBehandlingBrevPdf: (
        behandlingId: number | undefined,
        payload: IManueltBrevRequestPåBehandling
    ) => ['forhaandsvisbar_behandling_brev_pdf', behandlingId, payload],
};

// TODO : Når BehandlingContext er refaktrer til å alltid inneholde en behandling burde denne hooken ikke godta at
//  behandlingId er "undefined". BehandlingId burde aldri være "undefined" når man tar i bruk denne hooken. Foreløpig
//  er det tillat som en workaround.
export function useHentForhåndsvisbarBehandlingBrevPdf({
    behandlingId,
    payload,
    onSuccess,
    onError,
    ...rest
}: Parameters) {
    const { request } = useHttp();
    return useQuery({
        queryKey:
            HentForhåndsvisbarBehandlingBrevPdfQueryKeyFactory.forhåndsvisbarBehandlingBrevPdf(
                behandlingId,
                payload
            ),
        queryFn: async () => {
            try {
                if (behandlingId === undefined) {
                    return Promise.reject(
                        new Error('Forhåndsvisning av brev krever en behandling ID.')
                    );
                }
                const bytes = await hentForhåndsvisBehandlingBrev(request, behandlingId, payload);
                const blob = opprettPdfBlob(bytes);
                onSuccess?.(blob);
                return Promise.resolve(blob);
            } catch (e) {
                const error = e instanceof Error ? e : Error('En ukjent feil oppstod.');
                onError?.(error);
                return Promise.reject(error);
            }
        },
        gcTime: 0, // Vi vil alltid generere et nytt brev
        ...rest,
    });
}

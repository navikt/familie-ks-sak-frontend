import { opprettTilbakekreving, type OpprettTilbakekrevingPayload } from '@api/opprettTilbakekreving';
import { type DefaultError, useMutation, type UseMutationOptions } from '@tanstack/react-query';
import type { IBehandling } from '@typer/behandling';

type OpprettTilbakekrevingParameters = OpprettTilbakekrevingPayload;

type Options = Omit<UseMutationOptions<IBehandling, DefaultError, OpprettTilbakekrevingParameters>, 'mutationFn'>;

export function useOpprettTilbakekreving(options?: Options) {
    return useMutation<IBehandling, Error, OpprettTilbakekrevingParameters>({
        mutationFn: ({ fagsakId }: OpprettTilbakekrevingParameters): Promise<IBehandling> =>
            opprettTilbakekreving({ fagsakId }),
        ...options,
    });
}

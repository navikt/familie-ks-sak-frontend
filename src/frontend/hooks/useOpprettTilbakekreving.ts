import { opprettTilbakekreving, type OpprettTilbakekrevingPayload } from '@api/opprettTilbakekreving';
import { type DefaultError, useMutation, type UseMutationOptions } from '@tanstack/react-query';
import type { IBehandling } from '@typer/behandling';

type Options = Omit<UseMutationOptions<IBehandling, DefaultError, OpprettTilbakekrevingPayload>, 'mutationFn'>;

export function useOpprettTilbakekreving(options?: Options) {
    return useMutation<IBehandling, Error, OpprettTilbakekrevingPayload>({
        mutationFn: ({ fagsakId }: OpprettTilbakekrevingPayload): Promise<IBehandling> =>
            opprettTilbakekreving({ fagsakId }),
        ...options,
    });
}

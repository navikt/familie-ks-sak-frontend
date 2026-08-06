import { opprettTilbakekreving, type OpprettTilbakekrevingPayload } from '@api/opprettTilbakekreving';
import { type DefaultError, useMutation, type UseMutationOptions } from '@tanstack/react-query';

type OpprettTilbakekrevingParameters = OpprettTilbakekrevingPayload;

type Options = Omit<UseMutationOptions<void, DefaultError, OpprettTilbakekrevingParameters>, 'mutationFn'>;

export function useOpprettTilbakekreving(options?: Options) {
    return useMutation<void, Error, OpprettTilbakekrevingParameters>({
        mutationFn: ({ fagsakId }: OpprettTilbakekrevingParameters): Promise<void> =>
            opprettTilbakekreving({ fagsakId }),
        ...options,
    });
}

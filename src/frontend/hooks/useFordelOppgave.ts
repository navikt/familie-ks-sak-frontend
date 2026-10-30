import { fordelOppgave } from '@api/fordelOppgave';
import { type DefaultError, type UseMutationOptions, useMutation } from '@tanstack/react-query';

export const FordelOppgaveMutationKeyFactory = {
    fordelOppgave: () => ['fordel_oppgave'],
};

interface Parameters {
    oppgaveId: string;
    saksbehandler: string;
}

type Options = Omit<UseMutationOptions<string, DefaultError, Parameters>, 'mutationFn'>;

export function useFordelOppgave(options?: Options) {
    return useMutation({
        mutationKey: FordelOppgaveMutationKeyFactory.fordelOppgave(),
        mutationFn: (parameters: Parameters) => {
            const { oppgaveId, saksbehandler } = parameters;
            return fordelOppgave(oppgaveId, saksbehandler);
        },
        ...options,
    });
}

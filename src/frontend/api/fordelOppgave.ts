import { apiClient } from '@api/client/apiClient';

export async function fordelOppgave(oppgaveId: string, saksbehandler: string): Promise<string> {
    return apiClient.post<void, string>({
        url: `/familie-ks-sak/api/oppgave/${oppgaveId}/fordel`,
        params: { saksbehandler },
    });
}

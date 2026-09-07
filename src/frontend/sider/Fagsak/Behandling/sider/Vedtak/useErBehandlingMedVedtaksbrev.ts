import { useBehandling } from '@hooks/useBehandling';
import { Behandlingstype, BehandlingÅrsak } from '@typer/behandling';

const BEHANDLINGSÅRSAKER_UTEN_VEDTAKSBREV = [BehandlingÅrsak.SATSENDRING, BehandlingÅrsak.IVERKSETTE_KA_VEDTAK];

const BEHANDLINGSTYPER_UTEN_VEDTAKSBREV = [Behandlingstype.TEKNISK_ENDRING];

export function useErBehandlingMedVedtaksbrev() {
    const behandling = useBehandling();

    const erBehandlingsårsakUtenBrevutsending = BEHANDLINGSÅRSAKER_UTEN_VEDTAKSBREV.includes(behandling.årsak);
    const erBehandlingstypeUtenBrevutsending = BEHANDLINGSTYPER_UTEN_VEDTAKSBREV.includes(behandling.type);

    return !erBehandlingsårsakUtenBrevutsending && !erBehandlingstypeUtenBrevutsending;
}

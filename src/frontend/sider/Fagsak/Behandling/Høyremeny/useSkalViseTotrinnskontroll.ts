import { useBehandling } from '@hooks/useBehandling';
import { useSaksbehandler } from '@hooks/useSaksbehandler';
import { BehandlerRolle, BehandlingStatus } from '@typer/behandling';

export function useSkalViseTotrinnskontroll() {
    const saksbehandler = useSaksbehandler();
    const behandling = useBehandling();

    const erBeslutter = saksbehandler.rolle === BehandlerRolle.BESLUTTER;
    const erPåFatterVedtak = behandling.status === BehandlingStatus.FATTER_VEDTAK;

    return erBeslutter && erPåFatterVedtak;
}

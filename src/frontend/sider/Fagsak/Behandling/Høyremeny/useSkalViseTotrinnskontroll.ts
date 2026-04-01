import { useSaksbehandler } from '../../../../hooks/useSaksbehandler';
import { BehandlerRolle, BehandlingStatus } from '../../../../typer/behandling';
import { useBehandlingContext } from '../context/BehandlingContext';

export function useSkalViseTotrinnskontroll() {
    const { behandling } = useBehandlingContext();

    const saksbehandler = useSaksbehandler();

    const erBeslutter = saksbehandler.rolle === BehandlerRolle.BESLUTTER;
    const erPåFatterVedtak = behandling.status === BehandlingStatus.FATTER_VEDTAK;

    return erBeslutter && erPåFatterVedtak;
}

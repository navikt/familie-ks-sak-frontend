import { useSaksbehandler } from '../../../../hooks/useSaksbehandler';
import { BehandlerRolle, BehandlingStatus } from '../../../../typer/behandling';
import { useBehandlingContext } from '../context/BehandlingContext';

export function useSkalViseTotrinnskontroll() {
    const { behandling } = useBehandlingContext();

    const saksbehandler = useSaksbehandler();

    const saksbehandlerrolle = saksbehandler.hentRolle();

    return BehandlerRolle.BESLUTTER === saksbehandlerrolle && behandling.status === BehandlingStatus.FATTER_VEDTAK;
}

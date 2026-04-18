import { useSaksbehandlerContext } from '../context/SaksbehandlerContext';
import { harSkrivetilgang, harSuperbrukerTilgang, utledBehandlerRolle } from '../typer/saksbehandler';

export function useSaksbehandler() {
    const { saksbehandler } = useSaksbehandlerContext();
    return {
        ...saksbehandler,
        rolle: utledBehandlerRolle(saksbehandler),
        harSuperbrukerTilgang: harSuperbrukerTilgang(saksbehandler),
        harSkrivetilgang: harSkrivetilgang(saksbehandler),
    };
}

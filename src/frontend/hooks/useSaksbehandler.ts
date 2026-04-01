import { useSaksbehandlerContext } from '../SaksbehandlerProvider';

export function useSaksbehandler() {
    const { saksbehandler } = useSaksbehandlerContext();
    return saksbehandler;
}

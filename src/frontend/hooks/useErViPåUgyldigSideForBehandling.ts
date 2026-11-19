import { finnSideForBehandlingssteg, finnSiderForBehandling } from '@sider/Fagsak/Behandling/sider/sider';
import { hentStegnummer, type IBehandling } from '@typer/behandling';
import { useLocation } from 'react-router';

export function useErViPåUgyldigSideForBehandling(behandling: IBehandling): boolean {
    const location = useLocation();

    const segmenter = location.pathname.split('/');
    const siderForBehandling = finnSiderForBehandling(behandling);

    const nåværendeSide = siderForBehandling.find(side => segmenter.includes(side.href));
    if (nåværendeSide === undefined) {
        // Ukjent side, eller en side som er skjult for denne behandlingen.
        return true;
    }

    const behandlingSide = finnSideForBehandlingssteg(behandling);
    if (behandlingSide === undefined) {
        // Steget har ingen synlig side (f.eks. REGISTRERE_PERSONGRUNNLAG), så ingen sider er gyldige.
        return true;
    }

    return hentStegnummer(nåværendeSide.steg) > hentStegnummer(behandlingSide.steg);
}

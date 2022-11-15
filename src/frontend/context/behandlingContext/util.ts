import { BehandlingStatus, BehandlingSteg, hentStegNummer } from '../../typer/behandling';

export const saksbehandlerHarKunLesevisning = (
    innloggetSaksbehandlerSkrivetilgang: boolean,
    saksbehandlerHarTilgangTilEnhet: boolean,
    steg: BehandlingSteg | undefined,
    status: BehandlingStatus | undefined,
    sjekkTilgangTilEnhet = true
) => {
    if (status === BehandlingStatus.AVSLUTTET) {
        return true;
    } else if (sjekkTilgangTilEnhet) {
        if (!saksbehandlerHarTilgangTilEnhet || !innloggetSaksbehandlerSkrivetilgang) {
            return true;
        }
    } else if (!innloggetSaksbehandlerSkrivetilgang) {
        return true;
    }
    if (steg && hentStegNummer(steg) < hentStegNummer(BehandlingSteg.VEDTAK)) {
        return false;
    } else {
        // Default til lesevisning dersom vi er usikre
        return true;
    }
};

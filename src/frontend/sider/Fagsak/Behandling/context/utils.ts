import { BehandlingStatus, BehandlingSteg, hentStegNummer } from '../../../../typer/behandling';

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
    return !(steg && hentStegNummer(steg) < hentStegNummer(BehandlingSteg.BESLUTTE_VEDTAK));
};

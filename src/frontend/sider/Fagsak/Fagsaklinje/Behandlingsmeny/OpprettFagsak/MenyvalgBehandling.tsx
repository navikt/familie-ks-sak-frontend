import type { IBehandling } from '../../../../../typer/behandling';
import { BehandlingStatus, Behandlingstype, BehandlingÅrsak } from '../../../../../typer/behandling';
import type { IMinimalFagsak } from '../../../../../typer/fagsak';
import { useBehandlingContext } from '../../../Behandling/context/BehandlingContext';
import { AInntekt } from '../AInntekt/AInntekt';
import EndreBehandlendeEnhet from '../EndreBehandlendeEnhet/EndreBehandlendeEnhet';
import EndreBehandlingstema from '../EndreBehandling/EndreBehandlingstema';
import { HenleggBehandling } from '../HenleggBehandling/HenleggBehandling';
import SettEllerOppdaterVenting from '../LeggBehandlingPåVent/SettEllerOppdaterVenting';
import TaBehandlingAvVent from '../LeggBehandlingPåVent/TaBehandlingAvVent';
import LeggTiLBarnPåBehandling from '../LeggTilBarnPåBehandling/LeggTilBarnPåBehandling';
import { LeggTilEllerFjernBrevmottakere } from '../LeggTilEllerFjernBrevmottakere/LeggTilEllerFjernBrevmottakere';

interface IProps {
    minimalFagsak: IMinimalFagsak;
    behandling: IBehandling;
}

const MenyvalgBehandling = ({ minimalFagsak, behandling }: IProps) => {
    const { vurderErLesevisning } = useBehandlingContext();

    const erLesevisning = vurderErLesevisning();

    return (
        <>
            <EndreBehandlendeEnhet />
            <EndreBehandlingstema />
            <HenleggBehandling />
            {!erLesevisning &&
                (behandling.årsak === BehandlingÅrsak.NYE_OPPLYSNINGER ||
                    behandling.årsak === BehandlingÅrsak.KLAGE ||
                    behandling.årsak === BehandlingÅrsak.IVERKSETTE_KA_VEDTAK ||
                    behandling.årsak === BehandlingÅrsak.KORREKSJON_VEDTAKSBREV) && (
                    <LeggTiLBarnPåBehandling behandling={behandling} />
                )}
            {behandling.status === BehandlingStatus.UTREDES && <SettEllerOppdaterVenting behandling={behandling} />}
            {behandling.behandlingPåVent && <TaBehandlingAvVent behandling={behandling} />}

            {(!erLesevisning || behandling.brevmottakere.length > 0) &&
                (behandling.type === Behandlingstype.FØRSTEGANGSBEHANDLING ||
                    behandling.type === Behandlingstype.REVURDERING) && (
                    <LeggTilEllerFjernBrevmottakere
                        erPåBehandling={true}
                        behandling={behandling}
                        erLesevisning={erLesevisning}
                    />
                )}

            <AInntekt minimalFagsak={minimalFagsak} />
        </>
    );
};

export default MenyvalgBehandling;

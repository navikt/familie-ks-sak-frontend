import React from 'react';

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
    åpenBehandling: IBehandling;
}

const MenyvalgBehandling = ({ minimalFagsak, åpenBehandling }: IProps) => {
    const { vurderErLesevisning } = useBehandlingContext();

    const erLesevisning = vurderErLesevisning();

    return (
        <>
            <EndreBehandlendeEnhet />
            <EndreBehandlingstema />
            <HenleggBehandling />
            {!erLesevisning &&
                (åpenBehandling.årsak === BehandlingÅrsak.NYE_OPPLYSNINGER ||
                    åpenBehandling.årsak === BehandlingÅrsak.KLAGE ||
                    åpenBehandling.årsak === BehandlingÅrsak.IVERKSETTE_KA_VEDTAK ||
                    åpenBehandling.årsak === BehandlingÅrsak.KORREKSJON_VEDTAKSBREV) && (
                    <LeggTiLBarnPåBehandling behandling={åpenBehandling} />
                )}
            {åpenBehandling.status === BehandlingStatus.UTREDES && (
                <SettEllerOppdaterVenting behandling={åpenBehandling} />
            )}
            {åpenBehandling.behandlingPåVent && <TaBehandlingAvVent behandling={åpenBehandling} />}

            {(!erLesevisning || åpenBehandling.brevmottakere.length > 0) &&
                (åpenBehandling.type === Behandlingstype.FØRSTEGANGSBEHANDLING ||
                    åpenBehandling.type === Behandlingstype.REVURDERING) && (
                    <LeggTilEllerFjernBrevmottakere
                        erPåBehandling={true}
                        behandling={åpenBehandling}
                        erLesevisning={erLesevisning}
                    />
                )}

            <AInntekt minimalFagsak={minimalFagsak} />
        </>
    );
};

export default MenyvalgBehandling;

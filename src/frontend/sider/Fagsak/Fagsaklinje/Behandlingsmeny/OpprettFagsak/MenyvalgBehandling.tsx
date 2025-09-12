import React from 'react';

import { useAppContext } from '../../../../../context/AppContext';
import {
    BehandlingStatus,
    Behandlingstype,
    BehandlingÅrsak,
    type IBehandling,
} from '../../../../../typer/behandling';
import type { IMinimalFagsak } from '../../../../../typer/fagsak';
import { ToggleNavn } from '../../../../../typer/toggles';
import { useBehandlingContext } from '../../../Behandling/context/BehandlingContext';
import { AInntekt } from '../AInntekt/AInntekt';
import EndreBehandlendeEnhet from '../EndreBehandlendeEnhet/EndreBehandlendeEnhet';
import EndreBehandlingstema from '../EndreBehandling/EndreBehandlingstema';
import HenleggBehandling from '../HenleggBehandling/HenleggBehandling';
import { HenleggBehandlingNy } from '../HenleggBehandling/HenleggBehandlingNy';
import SettEllerOppdaterVenting from '../LeggBehandlingPåVent/SettEllerOppdaterVenting';
import TaBehandlingAvVent from '../LeggBehandlingPåVent/TaBehandlingAvVent';
import LeggTiLBarnPåBehandling from '../LeggTilBarnPåBehandling/LeggTilBarnPåBehandling';
import { LeggTilEllerFjernBrevmottakere } from '../LeggTilEllerFjernBrevmottakere/LeggTilEllerFjernBrevmottakere';

interface IProps {
    minimalFagsak: IMinimalFagsak;
    behandling: IBehandling;
}

const MenyvalgBehandling = ({ minimalFagsak, behandling }: IProps) => {
    const { toggles } = useAppContext();
    const { vurderErLesevisning } = useBehandlingContext();

    const erLesevisning = vurderErLesevisning();

    return (
        <>
            <EndreBehandlendeEnhet />
            <EndreBehandlingstema />
            {toggles[ToggleNavn.brukNyHenleggModal] && <HenleggBehandlingNy />}
            {!toggles[ToggleNavn.brukNyHenleggModal] && (
                <HenleggBehandling fagsakId={minimalFagsak.id} behandling={behandling} />
            )}
            {!erLesevisning &&
                (behandling.årsak === BehandlingÅrsak.NYE_OPPLYSNINGER ||
                    behandling.årsak === BehandlingÅrsak.KLAGE ||
                    behandling.årsak === BehandlingÅrsak.IVERKSETTE_KA_VEDTAK ||
                    behandling.årsak === BehandlingÅrsak.KORREKSJON_VEDTAKSBREV) && (
                    <LeggTiLBarnPåBehandling behandling={behandling} />
                )}
            {behandling.status === BehandlingStatus.UTREDES && (
                <SettEllerOppdaterVenting behandling={behandling} />
            )}
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

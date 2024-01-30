import React from 'react';

import { useBehandling } from '../../../../../context/behandlingContext/BehandlingContext';
import type { IBehandling } from '../../../../../typer/behandling';
import { BehandlingStatus, BehandlingÅrsak } from '../../../../../typer/behandling';
import type { IMinimalFagsak } from '../../../../../typer/fagsak';
import EndreBehandlendeEnhet from '../EndreBehandlendeEnhet/EndreBehandlendeEnhet';
import EndreBehandlingstema from '../EndreBehandling/EndreBehandlingstema';
import HenleggBehandling from '../HenleggBehandling/HenleggBehandling';
import SettEllerOppdaterVenting from '../LeggBehandlingPåVent/SettEllerOppdaterVenting';
import TaBehandlingAvVent from '../LeggBehandlingPåVent/TaBehandlingAvVent';
import LeggTiLBarnPåBehandling from '../LeggTilBarnPåBehandling/LeggTilBarnPåBehandling';

interface IProps {
    minimalFagsak: IMinimalFagsak;
    åpenBehandling: IBehandling;
}

const MenyvalgBehandling = ({ minimalFagsak, åpenBehandling }: IProps) => {
    const { vurderErLesevisning } = useBehandling();

    return (
        <>
            <EndreBehandlendeEnhet />
            {åpenBehandling.årsak !== BehandlingÅrsak.SØKNAD && <EndreBehandlingstema />}
            <HenleggBehandling fagsakId={minimalFagsak.id} behandling={åpenBehandling} />
            {!vurderErLesevisning() &&
                (åpenBehandling.årsak === BehandlingÅrsak.NYE_OPPLYSNINGER ||
                    åpenBehandling.årsak === BehandlingÅrsak.KLAGE ||
                    åpenBehandling.årsak === BehandlingÅrsak.KORREKSJON_VEDTAKSBREV) && (
                    <LeggTiLBarnPåBehandling behandling={åpenBehandling} />
                )}
            {åpenBehandling.status === BehandlingStatus.UTREDES && (
                <SettEllerOppdaterVenting behandling={åpenBehandling} />
            )}
            {åpenBehandling.behandlingPåVent && <TaBehandlingAvVent behandling={åpenBehandling} />}
        </>
    );
};

export default MenyvalgBehandling;

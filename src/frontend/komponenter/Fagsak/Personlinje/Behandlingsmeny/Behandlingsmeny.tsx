import React from 'react';

import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import '@navikt/ds-css-internal';

import { ExpandFilled } from '@navikt/ds-icons';
import { Button } from '@navikt/ds-react';
import { Dropdown } from '@navikt/ds-react-internal';
import { RessursStatus } from '@navikt/familie-typer';

import { useBehandling } from '../../../../context/behandlingContext/BehandlingContext';
import { BehandlingÅrsak } from '../../../../typer/behandling';
import type { IMinimalFagsak } from '../../../../typer/fagsak';
import type { IPersonInfo } from '../../../../typer/person';
import EndreBehandlendeEnhet from './EndreBehandlendeEnhet/EndreBehandlendeEnhet';
import EndreBehandlingstema from './EndreBehandling/EndreBehandlingstema';
import HenleggBehandling from './HenleggBehandling/HenleggBehandling';
import SettEllerOppdaterVenting from './LeggBehandlingPåVent/SettEllerOppdaterVenting';
import TaBehandlingAvVent from './LeggBehandlingPåVent/TaBehandlingAvVent';
import LeggTilBarnPBehandling from './LeggTilBarnPåBehandling/LeggTilBarnPåBehandling';
import OpprettBehandling from './OpprettBehandling/OpprettBehandling';
import OpprettFagsak from './OpprettFagsak/OpprettFagsak';

interface IProps {
    bruker?: IPersonInfo;
    minimalFagsak: IMinimalFagsak;
}

const PosisjonertMenyknapp = styled(Button)`
    margin-left: 3rem;
`;

const Behandlingsmeny: React.FC<IProps> = ({ bruker, minimalFagsak }) => {
    const { åpenBehandling, vurderErLesevisning } = useBehandling();
    const navigate = useNavigate();

    return (
        <Dropdown>
            <PosisjonertMenyknapp
                variant="secondary"
                size="small"
                icon={<ExpandFilled />}
                iconPosition={'right'}
                forwardedAs={Dropdown.Toggle}
            >
                Meny
            </PosisjonertMenyknapp>
            <Dropdown.Menu>
                <Dropdown.Menu.List>
                    {åpenBehandling.status === RessursStatus.SUKSESS && <EndreBehandlendeEnhet />}
                    {åpenBehandling.status === RessursStatus.SUKSESS &&
                        åpenBehandling.data.årsak !== BehandlingÅrsak.SØKNAD && (
                            <EndreBehandlingstema />
                        )}
                    <OpprettBehandling minimalFagsak={minimalFagsak} />
                    {!!bruker && <OpprettFagsak personInfo={bruker} />}
                    {åpenBehandling.status === RessursStatus.SUKSESS && (
                        <HenleggBehandling
                            fagsakId={minimalFagsak.id}
                            behandling={åpenBehandling.data}
                        />
                    )}
                    {åpenBehandling.status === RessursStatus.SUKSESS &&
                        !vurderErLesevisning() &&
                        (åpenBehandling.data.årsak === BehandlingÅrsak.NYE_OPPLYSNINGER ||
                            åpenBehandling.data.årsak === BehandlingÅrsak.KLAGE ||
                            åpenBehandling.data.årsak ===
                                BehandlingÅrsak.KORREKSJON_VEDTAKSBREV) && (
                            <LeggTilBarnPBehandling behandling={åpenBehandling.data} />
                        )}
                    {åpenBehandling.status === RessursStatus.SUKSESS &&
                        åpenBehandling.data.behandlingPåVent && (
                            <TaBehandlingAvVent behandling={åpenBehandling.data} />
                        )}
                    {åpenBehandling.status === RessursStatus.SUKSESS && (
                        <SettEllerOppdaterVenting behandling={åpenBehandling.data} />
                    )}
                    <Dropdown.Menu.List.Item
                        onClick={() => navigate(`/fagsak/${minimalFagsak.id}/dokumentutsending`)}
                    >
                        Send informasjonsbrev
                    </Dropdown.Menu.List.Item>
                </Dropdown.Menu.List>
            </Dropdown.Menu>
        </Dropdown>
    );
};

export default Behandlingsmeny;

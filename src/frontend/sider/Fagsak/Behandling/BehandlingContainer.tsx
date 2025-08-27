import React from 'react';

import styled from 'styled-components';

import { Alert } from '@navikt/ds-react';
import { ABorderDivider } from '@navikt/ds-tokens/dist/tokens';
import { RessursStatus } from '@navikt/familie-typer';

import { BehandlingRouter } from './BehandlingRouter';
import { useBehandlingContext } from './context/BehandlingContext';
import Høyremeny from './Høyremeny/Høyremeny';
import type { IMinimalFagsak } from '../../../typer/fagsak';
import type { IPersonInfo } from '../../../typer/person';
import { Fagsaklinje } from '../Fagsaklinje/Fagsaklinje';
import Venstremeny from './Venstremeny/Venstremeny';
import { HenleggBehandlingVeivalgModal } from '../Fagsaklinje/Behandlingsmeny/HenleggBehandling/HenleggBehandlingVeivalgModal';

const FlexContainer = styled.div`
    display: flex;
`;

const VenstremenyContainer = styled.div`
    min-width: 1rem;
    border-right: 1px solid ${ABorderDivider};
    overflow: hidden;
`;

const HovedinnholdContainer = styled.div`
    height: calc(100vh - 6rem);
    flex: 1;
    overflow: auto;
`;

const HøyremenyContainer = styled.div`
    border-left: 1px solid ${ABorderDivider};
    overflow-x: hidden;
    overflow-y: scroll;
`;

interface Props {
    bruker: IPersonInfo;
    minimalFagsak: IMinimalFagsak;
}

const BehandlingContainer: React.FunctionComponent<Props> = ({ bruker, minimalFagsak }) => {
    const { åpenBehandling } = useBehandlingContext();

    switch (åpenBehandling.status) {
        case RessursStatus.SUKSESS:
            return (
                <>
                    <HenleggBehandlingVeivalgModal />
                    <Fagsaklinje minimalFagsak={minimalFagsak} />
                    <FlexContainer>
                        <VenstremenyContainer>
                            <Venstremeny />
                        </VenstremenyContainer>
                        <HovedinnholdContainer>
                            <BehandlingRouter
                                åpenBehandling={åpenBehandling.data}
                                bruker={bruker}
                            />
                        </HovedinnholdContainer>
                        <HøyremenyContainer>
                            <Høyremeny bruker={bruker} />
                        </HøyremenyContainer>
                    </FlexContainer>
                </>
            );
        case RessursStatus.IKKE_TILGANG:
            return (
                <Alert
                    variant="warning"
                    children={`Du har ikke tilgang til å se denne behandlingen.`}
                />
            );
        case RessursStatus.FEILET:
        case RessursStatus.FUNKSJONELL_FEIL:
            return <Alert children={åpenBehandling.frontendFeilmelding} variant="error" />;
        default:
            return <div />;
    }
};

export default BehandlingContainer;

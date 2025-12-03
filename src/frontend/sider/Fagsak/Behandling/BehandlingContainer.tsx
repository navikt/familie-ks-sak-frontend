import styled from 'styled-components';

import { Alert } from '@navikt/ds-react';
import { ABorderDivider } from '@navikt/ds-tokens/dist/tokens';
import { RessursStatus } from '@navikt/familie-typer';

import { BehandlingRouter } from './BehandlingRouter';
import { BehandlingProvider } from './context/BehandlingContext';
import { Høyremeny } from './Høyremeny/Høyremeny';
import type { IPersonInfo } from '../../../typer/person';
import { Behandlingslinje } from '../Fagsaklinje/Behandlingslinje';
import { useHentOgSettBehandlingContext } from './context/HentOgSettBehandlingContext';
import { Venstremeny } from './Venstremeny/Venstremeny';
import { HenleggBehandlingModal } from '../Fagsaklinje/Behandlingsmeny/HenleggBehandling/HenleggBehandlingModal';
import { HenleggBehandlingVeivalgModal } from '../Fagsaklinje/Behandlingsmeny/HenleggBehandling/HenleggBehandlingVeivalgModal';
import { KorrigerEtterbetalingModal } from './sider/Vedtak/KorrigerEtterbetaling/KorrigerEtterbetalingModal';

const FlexContainer = styled.div`
    display: flex;
`;

const VenstremenyContainer = styled.div`
    min-width: 1rem;
    border-right: 1px solid ${ABorderDivider};
    overflow-x: hidden;
    overflow-y: scroll;
    height: calc(100vh - 146px);
`;

const HovedinnholdContainer = styled.div`
    height: calc(100vh - 146px);
    flex: 1;
    overflow: auto;
`;

const HøyremenyContainer = styled.div`
    min-width: 1rem;
    border-left: 1px solid ${ABorderDivider};
    overflow-x: hidden;
    overflow-y: scroll;
    height: calc(100vh - 146px);
`;

interface Props {
    bruker: IPersonInfo;
}

const BehandlingContainer = ({ bruker }: Props) => {
    const { behandlingRessurs } = useHentOgSettBehandlingContext();

    switch (behandlingRessurs.status) {
        case RessursStatus.SUKSESS:
            return (
                <BehandlingProvider behandling={behandlingRessurs.data}>
                    <HenleggBehandlingModal />
                    <HenleggBehandlingVeivalgModal />
                    <KorrigerEtterbetalingModal behandling={behandlingRessurs.data} />
                    <Behandlingslinje />
                    <FlexContainer>
                        <VenstremenyContainer>
                            <Venstremeny />
                        </VenstremenyContainer>
                        <HovedinnholdContainer>
                            <BehandlingRouter åpenBehandling={behandlingRessurs.data} bruker={bruker} />
                        </HovedinnholdContainer>
                        <HøyremenyContainer>
                            <Høyremeny bruker={bruker} />
                        </HøyremenyContainer>
                    </FlexContainer>
                </BehandlingProvider>
            );
        case RessursStatus.IKKE_TILGANG:
            return <Alert variant="warning" children={`Du har ikke tilgang til å se denne behandlingen.`} />;
        case RessursStatus.FEILET:
        case RessursStatus.FUNKSJONELL_FEIL:
            return <Alert children={behandlingRessurs.frontendFeilmelding} variant="error" />;
        default:
            return <div />;
    }
};

export default BehandlingContainer;

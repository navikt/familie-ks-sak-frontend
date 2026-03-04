import type { PropsWithChildren, ReactNode } from 'react';
import { useEffect } from 'react';

import styled from 'styled-components';

import { Box, Button, ErrorMessage, Heading, VStack } from '@navikt/ds-react';
import { Space16, Space24, Space96 } from '@navikt/ds-tokens/dist/tokens';

import { useBehandlingContext } from '../../sider/Fagsak/Behandling/context/BehandlingContext';
import { BehandlingSteg } from '../../typer/behandling';
import { behandlingErEtterSteg } from '../../utils/steg';
import { BehandlingPåVentAlert } from '../Alert/BehandlingPåVentAlert';
import { MidlertidigEnhetAlert } from '../Alert/MidlertidigEnhetAlert';

interface IProps extends PropsWithChildren {
    className?: string;
    forrigeKnappTittel?: string;
    forrigeOnClick?: () => void;
    nesteKnappTittel?: string;
    nesteOnClick?: () => void;
    senderInn: boolean;
    tittel: string | ReactNode;
    maxWidthStyle?: string;
    skalViseNesteKnapp?: boolean;
    skalViseForrigeKnapp?: boolean;
    feilmelding?: string;
    steg: BehandlingSteg;
}

const StyledErrorMessage = styled(ErrorMessage)`
    margin-top: ${Space16};
`;

const Navigering = styled.div`
    margin: ${Space96} 0 ${Space16};
    display: flex;
    flex-direction: row-reverse;
    justify-content: flex-end;

    button:not(:first-child) {
        margin-right: ${Space24};
    }
`;

const Skjemasteg = ({
    children,
    className,
    forrigeKnappTittel = 'Forrige steg',
    forrigeOnClick,
    nesteKnappTittel = 'Neste steg',
    nesteOnClick,
    senderInn,
    tittel,
    maxWidthStyle = '40rem',
    skalViseNesteKnapp = true,
    skalViseForrigeKnapp = true,
    feilmelding = '',
}: IProps) => {
    const { behandling, vurderErLesevisning } = useBehandlingContext();

    useEffect(() => {
        const skjema = document.getElementById('skjemasteg');
        if (skjema) {
            skjema.scrollIntoView({ block: 'start' });
        }
    }, []);

    const kanGåVidereILesevisning = behandlingErEtterSteg(BehandlingSteg.SIMULERING, behandling);

    function onNesteClicked() {
        if (!senderInn && nesteOnClick) {
            nesteOnClick();
        }
    }

    function onForrigeClicked() {
        if (forrigeOnClick) {
            forrigeOnClick();
        }
    }

    return (
        <Box marginBlock={'space-0 space-128'}>
            <VStack id={'skjemasteg'} paddingInline={'space-32'} paddingBlock={'space-24'} gap={'space-16'}>
                <BehandlingPåVentAlert />
                <MidlertidigEnhetAlert />
                <Box position={'relative'} marginBlock={'space-8'} className={className} maxWidth={maxWidthStyle}>
                    <Heading size={'large'} level={'1'} spacing={true}>
                        {tittel}
                    </Heading>
                    {children}
                    {feilmelding !== '' && <StyledErrorMessage>{feilmelding}</StyledErrorMessage>}
                    <Navigering>
                        {nesteOnClick && skalViseNesteKnapp && (!vurderErLesevisning() || kanGåVidereILesevisning) && (
                            <Button variant={'primary'} onClick={onNesteClicked} loading={senderInn}>
                                {nesteKnappTittel}
                            </Button>
                        )}
                        {forrigeOnClick && skalViseForrigeKnapp && (
                            <Button variant={'secondary'} onClick={onForrigeClicked}>
                                {forrigeKnappTittel}
                            </Button>
                        )}
                    </Navigering>
                </Box>
            </VStack>
        </Box>
    );
};

export default Skjemasteg;

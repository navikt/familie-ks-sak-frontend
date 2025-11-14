import { Link as ReactRouterLink, useLocation } from 'react-router';

import { FileTextIcon, HouseIcon } from '@navikt/aksel-icons';
import { Box, Button, HStack } from '@navikt/ds-react';

import Behandlingsmeny from './Behandlingsmeny/Behandlingsmeny';
import { BehandlingsmenyNy } from './Behandlingsmeny/BehandlingsmenyNy';
import { Fagsakmeny } from './Behandlingsmeny/Fagsakmeny';
import { useAppContext } from '../../../context/AppContext';
import type { IBehandling } from '../../../typer/behandling';
import type { IMinimalFagsak } from '../../../typer/fagsak';
import { ToggleNavn } from '../../../typer/toggles';

interface FagsaklinjeProps {
    minimalFagsak: IMinimalFagsak;
    behandling?: IBehandling;
}

const aktivFaneStyle = (fanenavn: string, pathname: string) => {
    const urlSplit = pathname.split('/');
    const sluttenPåUrl = urlSplit[urlSplit.length - 1];
    return sluttenPåUrl === fanenavn ? { textDecoration: 'underline' } : {};
};

export const Fagsaklinje = ({ minimalFagsak, behandling }: FagsaklinjeProps) => {
    const { pathname } = useLocation();
    const { harInnloggetSaksbehandlerSkrivetilgang, toggles } = useAppContext();

    const harSkrivetilgang = harInnloggetSaksbehandlerSkrivetilgang();
    const skalViseFagsakmeny = harSkrivetilgang && behandling === undefined && toggles[ToggleNavn.brukNyActionMeny];
    const skalViseNyBehandlingsmeny =
        harSkrivetilgang && behandling !== undefined && toggles[ToggleNavn.brukNyActionMeny];
    const skalViseGammelBehandlingsmeny = harSkrivetilgang && !toggles[ToggleNavn.brukNyActionMeny];

    return (
        <>
            <Box borderWidth="0 0 1 0" borderColor="border-subtle">
                <HStack paddingInline="2 4" paddingBlock="2" justify="space-between">
                    {minimalFagsak !== undefined && (
                        <HStack>
                            <Button
                                as={ReactRouterLink}
                                size="small"
                                variant="tertiary"
                                icon={<HouseIcon />}
                                to={`/fagsak/${minimalFagsak.id}/saksoversikt`}
                                style={aktivFaneStyle('saksoversikt', pathname)}
                            >
                                Saksoversikt
                            </Button>
                            <Button
                                as={ReactRouterLink}
                                size="small"
                                variant="tertiary"
                                icon={<FileTextIcon />}
                                to={`/fagsak/${minimalFagsak.id}/dokumenter`}
                                style={aktivFaneStyle('dokumenter', pathname)}
                            >
                                Dokumenter
                            </Button>
                        </HStack>
                    )}
                    {skalViseFagsakmeny && <Fagsakmeny />}
                    {skalViseNyBehandlingsmeny && <BehandlingsmenyNy />}
                    {skalViseGammelBehandlingsmeny && (
                        <Behandlingsmeny minimalFagsak={minimalFagsak} behandling={behandling} />
                    )}
                </HStack>
            </Box>
        </>
    );
};

import React from 'react';

import { Link as ReactRouterLink, useLocation } from 'react-router';

import { FileTextIcon, HouseIcon } from '@navikt/aksel-icons';
import { Box, Button, HStack } from '@navikt/ds-react';

import Behandlingsmeny from './Behandlingsmeny/Behandlingsmeny';
import { useAppContext } from '../../../context/AppContext';
import type { IBehandling } from '../../../typer/behandling';
import type { IMinimalFagsak } from '../../../typer/fagsak';

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
    const { harInnloggetSaksbehandlerSkrivetilgang } = useAppContext();
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
                    {harInnloggetSaksbehandlerSkrivetilgang() && (
                        <Behandlingsmeny minimalFagsak={minimalFagsak} behandling={behandling} />
                    )}
                </HStack>
            </Box>
        </>
    );
};

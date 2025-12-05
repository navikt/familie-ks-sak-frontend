import { Link as ReactRouterLink, useLocation } from 'react-router';

import { FileTextIcon, HouseIcon } from '@navikt/aksel-icons';
import { Box, Button, HStack } from '@navikt/ds-react';

import { useAppContext } from '../../../context/AppContext';
import { useFagsakContext } from '../FagsakContext';
import { Fagsakmeny } from './Behandlingsmeny/Fagsakmeny';

function lagAktivFaneStyle(fanenavn: string, pathname: string) {
    const urlSplit = pathname.split('/');
    const sluttenPåUrl = urlSplit[urlSplit.length - 1];
    return sluttenPåUrl === fanenavn ? { textDecoration: 'underline' } : {};
}

export function Fagsaklinje() {
    const { harInnloggetSaksbehandlerSkrivetilgang } = useAppContext();
    const { fagsak } = useFagsakContext();
    const { pathname } = useLocation();

    return (
        <Box borderWidth={'0 0 1 0'} borderColor={'border-subtle'}>
            <HStack paddingInline={'2 4'} paddingBlock={'2'} justify={'space-between'}>
                <HStack>
                    <Button
                        as={ReactRouterLink}
                        size={'small'}
                        variant={'tertiary'}
                        icon={<HouseIcon />}
                        to={`/fagsak/${fagsak.id}/saksoversikt`}
                        style={lagAktivFaneStyle('saksoversikt', pathname)}
                    >
                        Saksoversikt
                    </Button>
                    <Button
                        as={ReactRouterLink}
                        size={'small'}
                        variant={'tertiary'}
                        icon={<FileTextIcon />}
                        to={`/fagsak/${fagsak.id}/dokumenter`}
                        style={lagAktivFaneStyle('dokumenter', pathname)}
                    >
                        Dokumenter
                    </Button>
                </HStack>
                {harInnloggetSaksbehandlerSkrivetilgang() && <Fagsakmeny />}
            </HStack>
        </Box>
    );
}

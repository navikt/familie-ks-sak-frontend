import React from 'react';

import styled from 'styled-components';

import { Heading } from '@navikt/ds-react';

import BarnehagebarnInfotrygdList from './BarnehagebarnInfotrygdList';
import type { IBarnehagebarnInfotrygd } from '../../../typer/barnehagebarn';
import BarnehagebarnFilterskjema from '../BarnehagebarnFilterskjema';
import BarnehagebarnListNavigator from '../BarnehagebarnListNavigator';
import { useBarnehagebarn } from '../useBarnehagebarn';

const Container = styled.div`
    padding: 0.5rem;
    width: 100vw;
    overflow: auto;
    height: calc(100vh - 116px - 1.1rem);
`;

const BARNEHAGELISTE_URL = '/familie-ks-sak/api/barnehagebarn/barnehagebarnInfotrygdliste';

const BarnehagebarnInfotrygd: React.FunctionComponent = () => {
    const barnehagebarnInfotrygdContext =
        useBarnehagebarn<IBarnehagebarnInfotrygd>(BARNEHAGELISTE_URL);
    return (
        <Container>
            <Heading size={'medium'} level={'2'}>
                Barnehageliste Infotrygd
            </Heading>
            <BarnehagebarnFilterskjema {...barnehagebarnInfotrygdContext} />
            <BarnehagebarnListNavigator {...barnehagebarnInfotrygdContext} />
            <BarnehagebarnInfotrygdList {...barnehagebarnInfotrygdContext} />
        </Container>
    );
};

export default BarnehagebarnInfotrygd;

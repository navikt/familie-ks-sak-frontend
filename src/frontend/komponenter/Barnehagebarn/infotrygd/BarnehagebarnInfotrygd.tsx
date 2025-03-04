import React from 'react';

import styled from 'styled-components';

import { Heading } from '@navikt/ds-react';

import BarnehagebarnInfotrygdFilterskjema from './BarnehagebarnInfotrygdFilterskjema';
import BarnehagebarnInfotrygdList from './BarnehagebarnInfotrygdList';
import BarnehagebarnInfotrygdListNavigator from './BarnehagebarnInfotrygdListNavigator';

const Container = styled.div`
    padding: 0.5rem;
    width: 100vw;
    overflow: auto;
    height: calc(100vh - 116px - 1.1rem);
`;

const BarnehagebarnInfotrygd: React.FunctionComponent = () => {
    return (
        <Container>
            <Heading size={'medium'} level={'2'}>
                Barnehageliste Infotrygd
            </Heading>
            <BarnehagebarnInfotrygdFilterskjema />
            <BarnehagebarnInfotrygdListNavigator />
            <BarnehagebarnInfotrygdList />
        </Container>
    );
};

export default BarnehagebarnInfotrygd;

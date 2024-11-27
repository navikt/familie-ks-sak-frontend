import React from 'react';

import styled from 'styled-components';

import { Heading } from '@navikt/ds-react';

import BarnehagebarnFilterskjema from './BarnehagebarnFilterskjema';
import BarnehagebarnList from './BarnehagebarnList';
import BarnehagebarnListNavigator from './BarnehagebarnListNavigator';

const Container = styled.div`
    padding: 0.5rem;
    width: 100vw;
    overflow: auto;
    height: calc(100vh - 116px - 1.1rem);
`;

const Barnehagebarn: React.FunctionComponent = () => {
    return (
        <Container>
            <Heading size={'medium'} level={'2'}>
                Barnehageliste KS sak
            </Heading>
            <BarnehagebarnFilterskjema />
            <BarnehagebarnListNavigator />
            <BarnehagebarnList />
        </Container>
    );
};

export default Barnehagebarn;

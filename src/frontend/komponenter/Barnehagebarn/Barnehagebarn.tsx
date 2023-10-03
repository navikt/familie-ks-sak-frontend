import React, { useEffect } from 'react';

import styled from 'styled-components';

import { Heading } from '@navikt/ds-react';

import BarnehagebarnFilterskjema from './BarnehagebarnFilterskjema';
import BarnehagebarnList from './BarnehagebarnList';
import BarnehagebarnListNavigator from './BarnehagebarnListNavigator';
import { useAmplitude } from '../../utils/amplitude';

const Container = styled.div`
    padding: 0.5rem;
    width: 100vw;
    overflow: auto;
`;

const Barnehagebarn: React.FunctionComponent = () => {
    const { loggSidevisning } = useAmplitude();

    useEffect(() => {
        loggSidevisning('barnehageliste ks-sak');
    }, []);

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

import React, { useEffect } from 'react';

import styled from 'styled-components';

import { Heading } from '@navikt/ds-react';

import BarnehagebarnInfotrygdFilterskjema from './BarnehagebarnInfotrygdFilterskjema';
import BarnehagebarnInfotrygdList from './BarnehagebarnInfotrygdList';
import { useAmplitude } from '../../../utils/amplitude';

const Container = styled.div`
    padding: 0.5rem;
    width: 100vw;
    overflow: auto;
`;

const BarnehagebarnInfotrygd: React.FunctionComponent = () => {
    const { loggSidevisning } = useAmplitude();

    useEffect(() => {
        loggSidevisning('barnehageliste infotrygd');
    }, []);

    return (
        <Container>
            <Heading size={'medium'} level={'2'}>
                Barnehageliste Infotrygd
            </Heading>
            <BarnehagebarnInfotrygdFilterskjema />
            <BarnehagebarnInfotrygdList />
        </Container>
    );
};

export default BarnehagebarnInfotrygd;
import React from 'react';

import styled from 'styled-components';

import { Heading } from '@navikt/ds-react';

import BarnehagebarnFilterskjema from './BarnehagebarnFilterskjema';
import BarnehagebarnList from './BarnehagebarnList';
import BarnehagebarnListNavigator from './BarnehagebarnListNavigator';
import { useBarnehagebarn } from './useBarnehagebarn';
import type { IBarnehagebarn } from '../../typer/barnehagebarn';

const Container = styled.div`
    padding: 0.5rem;
    width: 100vw;
    overflow: auto;
    height: calc(100vh - 116px - 1.1rem);
`;

const BARNEHAGELISTE_URL = '/familie-ks-sak/api/barnehagebarn/barnehagebarnliste';

const Barnehagebarn: React.FunctionComponent = () => {
    const barnehagebarnContext = useBarnehagebarn<IBarnehagebarn>(BARNEHAGELISTE_URL);

    return (
        <Container>
            <Heading size={'medium'} level={'2'}>
                Barnehageliste KS sak
            </Heading>
            <BarnehagebarnFilterskjema {...barnehagebarnContext} />
            <BarnehagebarnListNavigator {...barnehagebarnContext} />
            <BarnehagebarnList {...barnehagebarnContext} />
        </Container>
    );
};

export default Barnehagebarn;

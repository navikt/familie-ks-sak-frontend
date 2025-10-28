import styled from 'styled-components';

import { Heading } from '@navikt/ds-react';

import { BarnehagebarnTabell } from './BarnehagebarnTabell';
import BarnehagebarnTabellNavigator from './BarnehagebarnTabellNavigator';
import BarnehagelisterFilterskjema from './BarnehagelisterFilterskjema';
import { useBarnehagelister } from './useBarnehagelister';

const Container = styled.div`
    padding: 0.5rem;
    width: 100vw;
    overflow: auto;
    height: calc(100vh - 116px - 1.1rem);
`;

const BarnehagelisterInnhold = () => {
    const barnehagelisterContext = useBarnehagelister();

    return (
        <Container>
            <Heading size={'medium'} level={'2'}>
                Barnehageliste KS sak
            </Heading>
            <BarnehagelisterFilterskjema {...barnehagelisterContext} />
            <BarnehagebarnTabellNavigator {...barnehagelisterContext} />
            <BarnehagebarnTabell {...barnehagelisterContext} />
        </Container>
    );
};

export default BarnehagelisterInnhold;

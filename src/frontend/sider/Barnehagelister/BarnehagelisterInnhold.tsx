import { Box, Heading } from '@navikt/ds-react';

import { BarnehagebarnTabell } from './BarnehagebarnTabell';
import BarnehagebarnTabellNavigator from './BarnehagebarnTabellNavigator';
import BarnehagelisterFilterskjema from './BarnehagelisterFilterskjema';
import { LasterNyttTabellInnholdSpinner } from './LasterNyttTabellInnholdSpinner';
import { useBarnehagelister } from './useBarnehagelister';

const BarnehagelisterInnhold = () => {
    const barnehagelisterContext = useBarnehagelister();

    return (
        <Box padding={'space-8'} width={'100vw'} overflow={'auto'} height={'calc(100vh - 116px - 1.1rem)'}>
            <Heading size={'medium'} level={'2'}>
                Barnehageliste KS sak
            </Heading>
            <BarnehagelisterFilterskjema {...barnehagelisterContext} />
            <BarnehagebarnTabellNavigator {...barnehagelisterContext} />
            <LasterNyttTabellInnholdSpinner
                barnehagebarnRequestParams={barnehagelisterContext.barnehagebarnRequestParams}
            />
            <BarnehagebarnTabell {...barnehagelisterContext} />
        </Box>
    );
};

export default BarnehagelisterInnhold;

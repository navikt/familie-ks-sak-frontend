import { Box, HStack, Loader } from '@navikt/ds-react';

import { useHentBarnehagebarn } from '../../hooks/useHentBarnehagebarn';
import type { BarnehagebarnRequestParams } from '../../typer/barnehagebarn';

interface Props {
    barnehagebarnRequestParams: BarnehagebarnRequestParams;
}

export function LasterNyttTabellInnholdSpinner({ barnehagebarnRequestParams }: Props) {
    const { isFetching, isPending } = useHentBarnehagebarn(barnehagebarnRequestParams);

    if (!isFetching || isPending) {
        return <Box height={'1.5rem'} />;
    }
    return (
        <HStack height={'1.5rem'} gap={'space-8'} align={'center'} justify={'end'}>
            <Loader />
            Henter nyeste barnehagebarn
        </HStack>
    );
}

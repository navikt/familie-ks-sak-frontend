import { Heading, VStack } from '@navikt/ds-react';

import FilterSkjema from './FilterSkjema';

const OppgaveHeader: React.FunctionComponent = () => {
    return (
        <VStack justify="space-between" gap="2">
            <Heading size={'medium'} level={'2'}>
                Oppgavebenken
            </Heading>
            <FilterSkjema />
        </VStack>
    );
};

export default OppgaveHeader;

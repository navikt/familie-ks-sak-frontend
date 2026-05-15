import { useErLesevisning } from '@hooks/useErLesevisning';
import { useLeggTilBarnModalContext } from '@komponenter/Modal/LeggTilBarn/LeggTilBarnModalContext';

import { PlusCircleIcon } from '@navikt/aksel-icons';
import { Button } from '@navikt/ds-react';

export function LeggTilBarnKnapp() {
    const { åpneModal } = useLeggTilBarnModalContext();

    const erLesevisning = useErLesevisning();

    if (erLesevisning) {
        return null;
    }

    return (
        <Button variant={'tertiary'} size={'medium'} onClick={åpneModal} icon={<PlusCircleIcon />}>
            {'Legg til barn'}
        </Button>
    );
}

import * as React from 'react';

import { PlusCircleIcon } from '@navikt/aksel-icons';
import { Button } from '@navikt/ds-react';

import { useLeggTilBarnModalContext } from '../../../../../komponenter/Modal/LeggTilBarn/LeggTilBarnModalContext';
import { useBehandlingContext } from '../../context/BehandlingContext';

export function LeggTilBarnKnapp() {
    const { vurderErLesevisning } = useBehandlingContext();
    const { åpneModal } = useLeggTilBarnModalContext();

    const erLesevisning = vurderErLesevisning();

    if (erLesevisning) {
        return null;
    }

    return (
        <Button variant={'tertiary'} size={'medium'} onClick={åpneModal} icon={<PlusCircleIcon />}>
            {'Legg til barn'}
        </Button>
    );
}

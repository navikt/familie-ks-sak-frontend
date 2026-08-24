import { useFeilutbetaltValutaTabellContext } from '@sider/Fagsak/Behandling/sider/Vedtak/FeilutbetaltValuta/FeilutbetaltValutaTabellContext';

import { CalculatorIcon } from '@navikt/aksel-icons';
import { ActionMenu } from '@navikt/ds-react';

export function FeilutbetaltValuta() {
    const { visFeilutbetaltValutaTabell } = useFeilutbetaltValutaTabellContext();

    return (
        <ActionMenu.Item onClick={visFeilutbetaltValutaTabell}>
            <CalculatorIcon fontSize={'1.4rem'} />
            Legg til feilutbetalt valuta
        </ActionMenu.Item>
    );
}

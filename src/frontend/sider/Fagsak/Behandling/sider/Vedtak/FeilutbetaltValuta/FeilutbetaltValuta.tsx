import { CalculatorIcon } from '@navikt/aksel-icons';
import { ActionMenu } from '@navikt/ds-react';
import { useFeilutbetaltValutaTabellContext } from '@sider/Fagsak/Behandling/sider/Vedtak/FeilutbetaltValuta/FeilutbetaltValutaTabellContext';

export function FeilutbetaltValuta() {
    const { visLeggTilFeilutbetaltValutaForm } = useFeilutbetaltValutaTabellContext();

    return (
        <ActionMenu.Item onClick={visLeggTilFeilutbetaltValutaForm}>
            <CalculatorIcon fontSize={'1.4rem'} />
            Legg til feilutbetalt valuta
        </ActionMenu.Item>
    );
}

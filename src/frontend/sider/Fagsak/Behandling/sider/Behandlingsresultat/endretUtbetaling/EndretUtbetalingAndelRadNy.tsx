import { useBehandling } from '@hooks/useBehandling';
import StatusIkon, { Status } from '@ikoner/StatusIkon';
import { BodyShort, HStack, Table, VStack } from '@navikt/ds-react';
import { årsakTekst } from '@typer/utbetalingAndel';
import { Datoformat, isoMånedPeriodeTilFormatertString } from '@utils/dato';
import { lagPersonLabel } from '@utils/formatter';
import { useState } from 'react';

import { useEndretUtbetalingAndelContext } from './EndretUtbetalingAndelContext';
import { EndretUtbetalingAndelSkjemaNy } from './skjema/EndretUtbetalingAndelSkjemaNy';
import { useEndretUtbetalingAndelSkjema } from './skjema/useEndretUtbetalingAndelSkjema';

function utbetalingTilTekst(prosent: number): string {
    switch (prosent) {
        case 100:
            return 'Ja - Full utbetaling';
        case 50:
            return 'Ja - Delt utbetaling';
        case 0:
            return 'Nei';
        default:
            throw new Error(`Ikke støttet prosent ${prosent} for delt bosted.`);
    }
}

export function EndretUtbetalingAndelRadNy() {
    const behandling = useBehandling();
    const { endretUtbetalingAndel } = useEndretUtbetalingAndelContext();
    const [erSkjemaEkspandert, settErSkjemaEkspandert] = useState(
        (endretUtbetalingAndel.personIdenter ?? []).length === 0
    );

    const lukkSkjema = () => settErSkjemaEkspandert(false);

    const { form, onSubmit } = useEndretUtbetalingAndelSkjema(endretUtbetalingAndel, lukkSkjema);

    function toggleSkjema() {
        if (erSkjemaEkspandert && form.formState.isDirty) {
            alert('Endretutbetalingsandelen har endringer som ikke er lagret!');
        } else {
            settErSkjemaEkspandert(!erSkjemaEkspandert);
        }
    }

    const { fom, tom, årsak, prosent, erTilknyttetAndeler } = endretUtbetalingAndel;
    const personIdenter = endretUtbetalingAndel.personIdenter ?? [];

    return (
        <Table.ExpandableRow
            togglePlacement={'right'}
            open={erSkjemaEkspandert}
            onOpenChange={toggleSkjema}
            content={<EndretUtbetalingAndelSkjemaNy form={form} onSubmit={onSubmit} lukkSkjema={lukkSkjema} />}
        >
            <Table.DataCell>
                <HStack gap={'space-16'} wrap={false}>
                    <StatusIkon status={erTilknyttetAndeler ? Status.OK : Status.ADVARSEL} />
                    {personIdenter.length > 0 ? (
                        <VStack>
                            {personIdenter.map(ident => (
                                <BodyShort key={ident}>{lagPersonLabel(ident, behandling.personer)}</BodyShort>
                            ))}
                        </VStack>
                    ) : (
                        'Ikke satt'
                    )}
                </HStack>
            </Table.DataCell>
            <Table.DataCell>
                {fom
                    ? isoMånedPeriodeTilFormatertString({ periode: { fom, tom }, tilFormat: Datoformat.MÅNED_ÅR })
                    : ''}
            </Table.DataCell>
            <Table.DataCell>{årsak ? årsakTekst[årsak] : ''}</Table.DataCell>
            <Table.DataCell>{typeof prosent === 'number' && årsak ? utbetalingTilTekst(prosent) : ''}</Table.DataCell>
        </Table.ExpandableRow>
    );
}

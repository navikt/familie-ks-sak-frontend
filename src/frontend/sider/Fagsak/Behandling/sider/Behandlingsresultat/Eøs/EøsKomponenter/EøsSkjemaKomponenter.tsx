import { BodyShort, HStack, Table } from '@navikt/ds-react';
import type { EøsPeriodeStatus } from '@typer/eøsPerioder';
import type { IGrunnlagPerson } from '@typer/person';
import { Datoformat, type IIsoMånedPeriode, isoMånedPeriodeTilFormatertString } from '@utils/dato';
import { lagPersonLabel } from '@utils/formatter';
import StatusIkon from '../../../../../../../ikoner/StatusIkon';
import { mapEøsPeriodeStatusTilStatus } from '../utils';

interface IStatusBarnCelleOgPeriodeCelleProps {
    status: EøsPeriodeStatus;
    barnIdenter: string[];
    personer: IGrunnlagPerson[];
    periode: IIsoMånedPeriode;
}

export const StatusBarnCelleOgPeriodeCelle = (props: IStatusBarnCelleOgPeriodeCelleProps) => {
    return (
        <>
            <Table.DataCell>
                <HStack gap={'space-16'} wrap={false}>
                    <StatusIkon status={mapEøsPeriodeStatusTilStatus[props.status]} />
                    {props.barnIdenter.map(barn => (
                        <BodyShort size="small" key={barn}>
                            {lagPersonLabel(barn, props.personer)}
                        </BodyShort>
                    ))}
                </HStack>
            </Table.DataCell>
            <Table.DataCell>
                <BodyShort size="small">
                    {isoMånedPeriodeTilFormatertString({
                        periode: props.periode,
                        tilFormat: Datoformat.MÅNED_ÅR_KORTNAVN,
                    })}
                </BodyShort>
            </Table.DataCell>
        </>
    );
};

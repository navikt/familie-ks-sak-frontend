import React from 'react';

import { Alert, BodyLong, Heading, Table, VStack } from '@navikt/ds-react';

import type { ManglendeSvalbardmerking } from '../../../../../../typer/ManglendeSvalbardmerking';
import { isoDatoPeriodeTilFormatertString } from '../../../../../../utils/dato';

interface ManglendeSvalbardmerkingVarselProps {
    manglendeSvalbardmerking: ManglendeSvalbardmerking[];
}

export const ManglendeSvalbardmerkingVarsel: React.FC<ManglendeSvalbardmerkingVarselProps> = (
    props: ManglendeSvalbardmerkingVarselProps
) => {
    const { manglendeSvalbardmerking } = props;

    const skalViseVarsel = manglendeSvalbardmerking.length > 0;

    if (!skalViseVarsel) {
        return null;
    } else {
        return (
            <Alert variant={'warning'}>
                <Heading spacing size="small" level="3">
                    Bosatt på Svalbard
                </Heading>
                <VStack gap={'space-8'}>
                    <BodyLong>
                        Personer i behandlingen har oppholdsadresse på Svalbard i en periode hvor «Bosatt på Svalbard»
                        ikke er lagt til i "Bosatt i riket"-vilkåret. Dette gjelder:
                    </BodyLong>
                    <Table size={'small'} style={{ width: '20rem' }}>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell scope="col">Person</Table.HeaderCell>
                                <Table.HeaderCell scope="col">Periode</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {manglendeSvalbardmerking.map(manglendeSvalbardmerking => {
                                return manglendeSvalbardmerking.manglendeSvalbardmerkingPerioder.map(
                                    (manglendeSvalbardmerkingPeriode, i) => {
                                        return (
                                            <Table.Row key={i + manglendeSvalbardmerking.ident} shadeOnHover={false}>
                                                <Table.DataCell>{manglendeSvalbardmerking.ident}</Table.DataCell>
                                                <Table.DataCell>
                                                    {isoDatoPeriodeTilFormatertString({
                                                        fom: manglendeSvalbardmerkingPeriode.fom,
                                                        tom: manglendeSvalbardmerkingPeriode.tom,
                                                    })}
                                                </Table.DataCell>
                                            </Table.Row>
                                        );
                                    }
                                );
                            })}
                        </Table.Body>
                    </Table>
                </VStack>
            </Alert>
        );
    }
};

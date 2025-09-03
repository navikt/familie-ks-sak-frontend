import React from 'react';

import { Alert, Heading } from '@navikt/ds-react';

import type { ManglendeSvalbardmerking } from '../../../../../../typer/ManglendeSvalbardmerking';
import { isoDatoPeriodeTilFormatertString } from '../../../../../../utils/dato';
import { slåSammenListeTilStreng } from '../../../../../../utils/formatter';

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
                <p>
                    Personer i behandlingen har oppholdsadresse på Svalbard i en periode hvor
                    «bosatt på Svalbard» ikke er lagt til i bosatt i riket vilkåret. Dette gjelder
                    (person/periode):
                </p>
                <ul>
                    {manglendeSvalbardmerking.map(manglendeSvalbardmerking => {
                        const perioder = slåSammenListeTilStreng(
                            manglendeSvalbardmerking.manglendeSvalbardmerkingPerioder.map(
                                manglendeSvalbardmerkingPeriode =>
                                    isoDatoPeriodeTilFormatertString({
                                        fom: manglendeSvalbardmerkingPeriode.fom,
                                        tom: manglendeSvalbardmerkingPeriode.tom,
                                    })
                            )
                        );
                        return <li>{`${manglendeSvalbardmerking.ident}: ${perioder}`}</li>;
                    })}
                </ul>
            </Alert>
        );
    }
};

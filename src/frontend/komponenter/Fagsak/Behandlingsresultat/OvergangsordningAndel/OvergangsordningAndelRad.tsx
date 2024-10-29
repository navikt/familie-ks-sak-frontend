import * as React from 'react';
import { useState } from 'react';

import deepEqual from 'deep-equal';
import styled from 'styled-components';

import { Table } from '@navikt/ds-react';

import OvergangsordningAndelSkjema from './OvergangsordningAndelSkjema';
import { useOvergangsordningAndel } from '../../../../context/OvergangsordningAndelContext';
import type { IBehandling } from '../../../../typer/behandling';
import type { IRestOvergangsordningAndel } from '../../../../typer/overgangsordningAndel';
import { Datoformat, isoMånedPeriodeTilFormatertString } from '../../../../utils/dato';
import { lagPersonLabel } from '../../../../utils/formatter';

interface IOvergangsordningRadProps {
    overgangsordningAndel: IRestOvergangsordningAndel;
    åpenBehandling: IBehandling;
}

const PersonCelle = styled.div`
    display: flex;
    svg {
        margin-right: 1rem;
    }
`;

const OvergangsordningAndelRad: React.FunctionComponent<IOvergangsordningRadProps> = ({
    overgangsordningAndel,
    åpenBehandling,
}) => {
    const [åpenOvergangsordningAndel, settÅpenOvergangsordningAndel] = useState<boolean>(
        overgangsordningAndel.personIdent === null
    );

    const { hentSkjemaData } = useOvergangsordningAndel();

    const erSkjemaForandret = () =>
        !deepEqual(
            {
                ...overgangsordningAndel,
                antallTimer:
                    typeof overgangsordningAndel.antallTimer === 'number'
                        ? overgangsordningAndel.antallTimer
                        : 0,
            },
            hentSkjemaData()
        );

    const toggleForm = () => {
        if (erSkjemaForandret() && åpenOvergangsordningAndel) {
            alert('Overgangsordningperiode har endringer som ikke er lagret!');
        } else {
            settÅpenOvergangsordningAndel(!åpenOvergangsordningAndel);
        }
    };

    return (
        <>
            <Table.ExpandableRow
                togglePlacement={'right'}
                open={åpenOvergangsordningAndel}
                onOpenChange={toggleForm}
                content={
                    <OvergangsordningAndelSkjema
                        åpenBehandling={åpenBehandling}
                        lukkSkjema={() => {
                            settÅpenOvergangsordningAndel(false);
                        }}
                        key={åpenOvergangsordningAndel ? 'åpen' : 'lukket'}
                    />
                }
            >
                <Table.DataCell>
                    <PersonCelle>
                        {overgangsordningAndel.personIdent
                            ? lagPersonLabel(
                                  overgangsordningAndel.personIdent,
                                  åpenBehandling.personer
                              )
                            : 'Ikke satt'}
                    </PersonCelle>
                </Table.DataCell>
                <Table.DataCell>
                    {overgangsordningAndel.fom
                        ? isoMånedPeriodeTilFormatertString({
                              periode: {
                                  fom: overgangsordningAndel.fom,
                                  tom: overgangsordningAndel.tom,
                              },
                              tilFormat: Datoformat.MÅNED_ÅR,
                          })
                        : ''}
                </Table.DataCell>
                <Table.DataCell>{overgangsordningAndel.antallTimer}</Table.DataCell>
            </Table.ExpandableRow>
        </>
    );
};

export default OvergangsordningAndelRad;

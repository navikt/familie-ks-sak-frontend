import * as React from 'react';
import { useState } from 'react';

import deepEqual from 'deep-equal';
import styled from 'styled-components';

import { Table } from '@navikt/ds-react';

import EndretUtbetalingAndelSkjema from './EndretUtbetalingAndelSkjema';
import { useEndretUtbetalingAndel } from '../../../context/EndretUtbetalingAndelContext';
import StatusIkon, { Status } from '../../../ikoner/StatusIkon';
import type { IBehandling } from '../../../typer/behandling';
import type { IRestEndretUtbetalingAndel } from '../../../typer/utbetalingAndel';
import { IEndretUtbetalingAndelÅrsak, årsakTekst } from '../../../typer/utbetalingAndel';
import { Datoformat, isoMånedPeriodeTilFormatertString } from '../../../utils/dato';
import { lagPersonLabel } from '../../../utils/formatter';

interface IEndretUtbetalingAndelRadProps {
    endretUtbetalingAndel: IRestEndretUtbetalingAndel;
    åpenBehandling: IBehandling;
}

const PersonCelle = styled.div`
    display: flex;
    svg {
        margin-right: 1rem;
    }
`;

const EndretUtbetalingAndelRad: React.FunctionComponent<IEndretUtbetalingAndelRadProps> = ({
    endretUtbetalingAndel,
    åpenBehandling,
}) => {
    const [åpenUtbetalingsAndel, settÅpenUtbetalingsAndel] = useState<boolean>(
        endretUtbetalingAndel.personIdent === null
    );

    const { hentSkjemaData } = useEndretUtbetalingAndel();

    const erSkjemaForandret = () =>
        !deepEqual(
            {
                ...endretUtbetalingAndel,
                prosent:
                    typeof endretUtbetalingAndel.prosent === 'number'
                        ? endretUtbetalingAndel.prosent
                        : 0,
            },
            hentSkjemaData()
        );

    const toggleForm = () => {
        if (erSkjemaForandret() && åpenUtbetalingsAndel) {
            alert('Endretutbetalingsandelen har endringer som ikke er lagret!');
        } else {
            settÅpenUtbetalingsAndel(!åpenUtbetalingsAndel);
        }
    };

    const fraProsentTilTekst = (prosent: number, årsak?: IEndretUtbetalingAndelÅrsak): string => {
        switch (årsak) {
            case IEndretUtbetalingAndelÅrsak.DELT_BOSTED:
            case IEndretUtbetalingAndelÅrsak.ENDRE_MOTTAKER:
            case IEndretUtbetalingAndelÅrsak.ALLEREDE_UTBETALT:
            case IEndretUtbetalingAndelÅrsak.ETTERBETALING_3MND:
                return fraProsentTilTekstDefault(prosent);
            default:
                throw new Error(`Ukjent årsak ${årsak}`);
        }
    };

    const fraProsentTilTekstDefault = (prosent: number): string => {
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
    };

    return (
        <>
            <Table.ExpandableRow
                togglePlacement={'right'}
                open={åpenUtbetalingsAndel}
                onOpenChange={() => toggleForm()}
                content={
                    <EndretUtbetalingAndelSkjema
                        åpenBehandling={åpenBehandling}
                        lukkSkjema={() => {
                            settÅpenUtbetalingsAndel(false);
                        }}
                        key={åpenUtbetalingsAndel ? 'åpen' : 'lukket'}
                    />
                }
            >
                <Table.DataCell>
                    <PersonCelle>
                        <StatusIkon
                            status={
                                endretUtbetalingAndel.erTilknyttetAndeler
                                    ? Status.OK
                                    : Status.ADVARSEL
                            }
                            height={20}
                            width={20}
                        />
                        {endretUtbetalingAndel.personIdent
                            ? lagPersonLabel(
                                  endretUtbetalingAndel.personIdent,
                                  åpenBehandling.personer
                              )
                            : 'Ikke satt'}
                    </PersonCelle>
                </Table.DataCell>
                <Table.DataCell>
                    {endretUtbetalingAndel.fom
                        ? isoMånedPeriodeTilFormatertString({
                              periode: {
                                  fom: endretUtbetalingAndel.fom,
                                  tom: endretUtbetalingAndel.tom,
                              },
                              tilFormat: Datoformat.MÅNED_ÅR,
                          })
                        : ''}
                </Table.DataCell>
                <Table.DataCell>
                    {endretUtbetalingAndel.årsak ? årsakTekst[endretUtbetalingAndel.årsak] : ''}
                </Table.DataCell>
                <Table.DataCell>
                    {typeof endretUtbetalingAndel.prosent === 'number' &&
                    endretUtbetalingAndel.årsak
                        ? fraProsentTilTekst(
                              endretUtbetalingAndel.prosent,
                              endretUtbetalingAndel.årsak
                          )
                        : ''}
                </Table.DataCell>
            </Table.ExpandableRow>
        </>
    );
};

export default EndretUtbetalingAndelRad;

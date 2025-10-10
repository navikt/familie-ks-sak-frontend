import { useState } from 'react';

import styled from 'styled-components';

import { Table } from '@navikt/ds-react';

import EndretUtbetalingAndelSkjema from './EndretUtbetalingAndelSkjema';
import { useEndretUtbetalingAndel } from './useEndretUtbetalingAndel';
import StatusIkon, { Status } from '../../../../../../ikoner/StatusIkon';
import type { IBehandling } from '../../../../../../typer/behandling';
import {
    IEndretUtbetalingAndelÅrsak,
    type IRestEndretUtbetalingAndel,
    årsakTekst,
} from '../../../../../../typer/utbetalingAndel';
import { Datoformat, isoMånedPeriodeTilFormatertString } from '../../../../../../utils/dato';
import { lagPersonLabel } from '../../../../../../utils/formatter';

interface IEndretUtbetalingAndelRadProps {
    lagretEndretUtbetalingAndel: IRestEndretUtbetalingAndel;
    åpenBehandling: IBehandling;
}

const PersonCelle = styled.div`
    display: flex;
    svg {
        margin-right: 1rem;
    }
`;

const EndretUtbetalingAndelRad = ({ lagretEndretUtbetalingAndel, åpenBehandling }: IEndretUtbetalingAndelRadProps) => {
    const [erSkjemaEkspandert, settErSkjemaEkspandert] = useState<boolean>(
        lagretEndretUtbetalingAndel.personIdent === null
    );

    const {
        skjemaHarEndringerSomIkkeErLagret,
        skjema,
        oppdaterEndretUtbetaling,
        slettEndretUtbetaling,
        settFelterTilLagredeVerdier,
    } = useEndretUtbetalingAndel(lagretEndretUtbetalingAndel, åpenBehandling);

    const toggleForm = () => {
        if (skjemaHarEndringerSomIkkeErLagret() && erSkjemaEkspandert) {
            alert('Endretutbetalingsandelen har endringer som ikke er lagret!');
        } else {
            settErSkjemaEkspandert(!erSkjemaEkspandert);
        }
    };

    const fraProsentTilTekst = (prosent: number, årsak?: IEndretUtbetalingAndelÅrsak): string => {
        switch (årsak) {
            case IEndretUtbetalingAndelÅrsak.ALLEREDE_UTBETALT:
            case IEndretUtbetalingAndelÅrsak.ETTERBETALING_3MND:
            case IEndretUtbetalingAndelÅrsak.FULLTIDSPLASS_I_BARNEHAGE_AUGUST_2024:
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
        <Table.ExpandableRow
            togglePlacement={'right'}
            open={erSkjemaEkspandert}
            onOpenChange={() => toggleForm()}
            content={
                <EndretUtbetalingAndelSkjema
                    skjema={skjema}
                    åpenBehandling={åpenBehandling}
                    lukkSkjema={() => {
                        settErSkjemaEkspandert(false);
                    }}
                    slettEndretUtbetaling={slettEndretUtbetaling}
                    oppdaterEndretUtbetaling={oppdaterEndretUtbetaling}
                    settFelterTilLagredeVerdier={settFelterTilLagredeVerdier}
                />
            }
        >
            <Table.DataCell>
                <PersonCelle>
                    <StatusIkon
                        status={lagretEndretUtbetalingAndel.erTilknyttetAndeler ? Status.OK : Status.ADVARSEL}
                    />
                    {lagretEndretUtbetalingAndel.personIdent
                        ? lagPersonLabel(lagretEndretUtbetalingAndel.personIdent, åpenBehandling.personer)
                        : 'Ikke satt'}
                </PersonCelle>
            </Table.DataCell>
            <Table.DataCell>
                {lagretEndretUtbetalingAndel.fom
                    ? isoMånedPeriodeTilFormatertString({
                          periode: {
                              fom: lagretEndretUtbetalingAndel.fom,
                              tom: lagretEndretUtbetalingAndel.tom,
                          },
                          tilFormat: Datoformat.MÅNED_ÅR,
                      })
                    : ''}
            </Table.DataCell>
            <Table.DataCell>
                {lagretEndretUtbetalingAndel.årsak ? årsakTekst[lagretEndretUtbetalingAndel.årsak] : ''}
            </Table.DataCell>
            <Table.DataCell>
                {typeof lagretEndretUtbetalingAndel.prosent === 'number' && lagretEndretUtbetalingAndel.årsak
                    ? fraProsentTilTekst(lagretEndretUtbetalingAndel.prosent, lagretEndretUtbetalingAndel.årsak)
                    : ''}
            </Table.DataCell>
        </Table.ExpandableRow>
    );
};

export default EndretUtbetalingAndelRad;

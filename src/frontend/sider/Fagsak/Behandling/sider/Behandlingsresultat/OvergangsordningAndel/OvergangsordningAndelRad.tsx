import { Table } from '@navikt/ds-react';
import type { IBehandling } from '@typer/behandling';
import { Datoformat, isoMånedPeriodeTilFormatertString } from '@utils/dato';
import { lagPersonLabel } from '@utils/formatter';
import { useOvergangsordningAndelContext } from './OvergangsordningAndelContext';
import OvergangsordningAndelSkjema from './OvergangsordningAndelSkjema';

interface IOvergangsordningRadProps {
    åpenBehandling: IBehandling;
}

const OvergangsordningAndelRad = ({ åpenBehandling }: IOvergangsordningRadProps) => {
    const {
        overgangsordningAndel,
        erOvergangsordningAndelForandret,
        erOvergangsordningAndelÅpen,
        settErOvergangsordningAndelÅpen,
    } = useOvergangsordningAndelContext();

    const toggleForm = () => {
        if (erOvergangsordningAndelForandret() && erOvergangsordningAndelÅpen) {
            alert('Overgangsordningperiode har endringer som ikke er lagret!');
        } else {
            settErOvergangsordningAndelÅpen(!erOvergangsordningAndelÅpen);
        }
    };

    return (
        <Table.ExpandableRow
            togglePlacement={'right'}
            open={erOvergangsordningAndelÅpen}
            onOpenChange={toggleForm}
            content={
                <OvergangsordningAndelSkjema
                    åpenBehandling={åpenBehandling}
                    key={erOvergangsordningAndelÅpen ? 'åpen' : 'lukket'}
                />
            }
        >
            <Table.DataCell>
                {overgangsordningAndel.personIdent
                    ? lagPersonLabel(overgangsordningAndel.personIdent, åpenBehandling.personer)
                    : 'Ikke satt'}
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
    );
};

export default OvergangsordningAndelRad;

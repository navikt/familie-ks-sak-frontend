import * as React from 'react';

import styled from 'styled-components';

import { TrashIcon } from '@navikt/aksel-icons';
import { Button, Checkbox, Fieldset, Label, Select, TextField } from '@navikt/ds-react';
import { ABorderAction } from '@navikt/ds-tokens/dist/tokens';

import { useOvergangsordningAndelContext } from './OvergangsordningAndelContext';
import Månedvelger, { DagIMåneden } from '../../../../../../komponenter/Datovelger/Månedvelger';
import Knapperekke from '../../../../../../komponenter/Knapperekke';
import { BehandlingÅrsak, type IBehandling } from '../../../../../../typer/behandling';
import { isNumeric } from '../../../../../../utils/eøsValidators';
import { lagPersonLabel } from '../../../../../../utils/formatter';
import { hentFrontendFeilmelding } from '../../../../../../utils/ressursUtils';
import { useBehandlingContext } from '../../../context/BehandlingContext';

const KnapperekkeVenstre = styled.div`
    display: flex;
    flex-direction: row;
`;

const StyledFieldset = styled(Fieldset)`
    margin-top: 1rem;
    margin-bottom: 1.5rem;
    padding-left: 2rem;
    margin-right: 2rem;
    border-left: 0.0625rem solid ${ABorderAction};
    max-width: 30rem;
`;

const StyledSelect = styled(Select)`
    max-width: 20rem;
    z-index: 1000;
`;

const StyledTextField = styled(TextField)`
    max-width: 20rem;
    z-index: 1000;
`;

const Feltmargin = styled.div`
    margin-bottom: 1rem;
`;

const StyledButton = styled(Button)`
    margin-right: 0.5rem;
`;

const FlexDiv = styled.div`
    display: flex;
    gap: 1.125rem;
`;

interface IOvergangsordningAndelSkjemaProps {
    åpenBehandling: IBehandling;
}

const OvergangsordningAndelSkjema = ({ åpenBehandling }: IOvergangsordningAndelSkjemaProps) => {
    const { vurderErLesevisning } = useBehandlingContext();

    const {
        overgangsordningAndel,
        skjema,
        slettOvergangsordningAndel,
        oppdaterOvergangsordningAndel,
        tilbakestillOgLukkOvergangsordningAndel,
    } = useOvergangsordningAndelContext();

    const erLesevisning = vurderErLesevisning() || åpenBehandling.årsak !== BehandlingÅrsak.OVERGANGSORDNING_2024;

    return (
        <StyledFieldset
            error={skjema.visFeilmeldinger && hentFrontendFeilmelding(skjema.submitRessurs)}
            legend={'Skjema for å endre overgangsordningandeler'}
            hideLegend
        >
            <Feltmargin>
                <StyledSelect
                    {...skjema.felter.personIdent.hentNavBaseSkjemaProps(skjema.visFeilmeldinger)}
                    label={<Label>Velg hvem det gjelder</Label>}
                    value={skjema.felter.personIdent.verdi ?? ''}
                    onChange={event => {
                        skjema.felter.personIdent.validerOgSettFelt(event.target.value);
                    }}
                    readOnly={erLesevisning}
                >
                    <option value={''}>Velg person</option>
                    {åpenBehandling.personerMedAndelerTilkjentYtelse
                        .map(personMedAndeler => personMedAndeler.personIdent)
                        .map((personIdent, index) => (
                            <option value={personIdent} key={`${index}_${personIdent}`}>
                                {lagPersonLabel(personIdent, åpenBehandling.personer)}
                            </option>
                        ))}
                </StyledSelect>
            </Feltmargin>

            <Feltmargin>
                <Label>Fastsett periode</Label>
                <FlexDiv>
                    <Månedvelger
                        felt={skjema.felter.fom}
                        label={'F.o.m.'}
                        visFeilmeldinger={skjema.visFeilmeldinger}
                        dagIMåneden={DagIMåneden.FØRSTE_DAG}
                        readOnly={erLesevisning}
                    />
                    <Månedvelger
                        felt={skjema.felter.tom}
                        label={'T.o.m.'}
                        visFeilmeldinger={skjema.visFeilmeldinger}
                        dagIMåneden={DagIMåneden.SISTE_DAG}
                        tilhørendeFomFelt={skjema.felter.fom}
                        readOnly={erLesevisning}
                    />
                </FlexDiv>
            </Feltmargin>

            <Feltmargin>
                <Checkbox
                    checked={skjema.felter.deltBosted.verdi}
                    onChange={event => {
                        skjema.felter.deltBosted.validerOgSettFelt(event.target.checked);
                        skjema.felter.antallTimer.validerOgSettFelt('0');
                    }}
                    readOnly={erLesevisning}
                >
                    {'Barnet har delt bosted'}
                </Checkbox>
            </Feltmargin>

            <Feltmargin>
                <StyledTextField
                    {...skjema.felter.antallTimer.hentNavBaseSkjemaProps(skjema.visFeilmeldinger)}
                    label={<Label>Antall timer i barnehage</Label>}
                    value={skjema.felter.antallTimer.verdi ?? ''}
                    onChange={event => {
                        if (isNumeric(event.target.value)) {
                            skjema.felter.antallTimer.validerOgSettFelt(event.target.value);
                        }
                    }}
                    readOnly={erLesevisning || skjema.felter.deltBosted.verdi}
                />
            </Feltmargin>
            {!erLesevisning && (
                <Knapperekke>
                    <KnapperekkeVenstre>
                        <StyledButton size={'small'} variant={'secondary'} onClick={oppdaterOvergangsordningAndel}>
                            Bekreft
                        </StyledButton>
                        <Button variant="tertiary" size="small" onClick={tilbakestillOgLukkOvergangsordningAndel}>
                            Avbryt
                        </Button>
                    </KnapperekkeVenstre>

                    {!erLesevisning && (
                        <Button
                            variant={'tertiary'}
                            id={`sletteknapp-overgangsordning-andel-${overgangsordningAndel.id}`}
                            size={'small'}
                            onClick={slettOvergangsordningAndel}
                            icon={<TrashIcon />}
                        >
                            {'Fjern periode'}
                        </Button>
                    )}
                </Knapperekke>
            )}
        </StyledFieldset>
    );
};

export default OvergangsordningAndelSkjema;

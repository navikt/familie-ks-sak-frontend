import { useErLesevisning } from '@hooks/useErLesevisning';
import { TrashIcon } from '@navikt/aksel-icons';
import { Box, Button, Checkbox, Fieldset, HStack, Label, Select, TextField, VStack } from '@navikt/ds-react';
import { BehandlingÅrsak, type IBehandling } from '@typer/behandling';
import { isNumeric } from '@utils/eøsValidators';
import { lagPersonLabel } from '@utils/formatter';
import { hentFrontendFeilmelding } from '@utils/ressursUtils';
import Månedvelger, { DagIMåneden } from '../../../../../../komponenter/Datovelger/Månedvelger';
import { useOvergangsordningAndelContext } from './OvergangsordningAndelContext';
import Styles from './OvergangsordningAndelSkjema.module.css';

interface IOvergangsordningAndelSkjemaProps {
    åpenBehandling: IBehandling;
}

const OvergangsordningAndelSkjema = ({ åpenBehandling }: IOvergangsordningAndelSkjemaProps) => {
    const {
        overgangsordningAndel,
        skjema,
        slettOvergangsordningAndel,
        oppdaterOvergangsordningAndel,
        tilbakestillOgLukkOvergangsordningAndel,
    } = useOvergangsordningAndelContext();

    const erLesevisning = useErLesevisning();

    const erRedigeringDeaktivert = erLesevisning || åpenBehandling.årsak !== BehandlingÅrsak.OVERGANGSORDNING_2024;

    return (
        <Box
            asChild
            marginBlock={'space-16 space-24'}
            marginInline={'space-0 space-32'}
            paddingInline={'space-32 space-0'}
            borderWidth={'0 0 0 1'}
            borderColor={'accent'}
            maxWidth={'30rem'}
        >
            <Fieldset
                error={skjema.visFeilmeldinger && hentFrontendFeilmelding(skjema.submitRessurs)}
                legend={'Skjema for å endre overgangsordningandeler'}
                hideLegend
            >
                <VStack gap={'space-16'}>
                    <Select
                        className={Styles.field}
                        {...skjema.felter.personIdent.hentNavBaseSkjemaProps(skjema.visFeilmeldinger)}
                        label={<Label>Velg hvem det gjelder</Label>}
                        value={skjema.felter.personIdent.verdi ?? ''}
                        onChange={event => {
                            skjema.felter.personIdent.validerOgSettFelt(event.target.value);
                        }}
                        readOnly={erRedigeringDeaktivert}
                    >
                        <option value={''}>Velg person</option>
                        {åpenBehandling.personerMedAndelerTilkjentYtelse
                            .map(personMedAndeler => personMedAndeler.personIdent)
                            .map((personIdent, index) => (
                                <option value={personIdent} key={`${index}_${personIdent}`}>
                                    {lagPersonLabel(personIdent, åpenBehandling.personer)}
                                </option>
                            ))}
                    </Select>
                    <div>
                        <Label>Fastsett periode</Label>
                        <HStack gap={'space-16'}>
                            <Månedvelger
                                felt={skjema.felter.fom}
                                label={'F.o.m.'}
                                visFeilmeldinger={skjema.visFeilmeldinger}
                                dagIMåneden={DagIMåneden.FØRSTE_DAG}
                                readOnly={erRedigeringDeaktivert}
                            />
                            <Månedvelger
                                felt={skjema.felter.tom}
                                label={'T.o.m.'}
                                visFeilmeldinger={skjema.visFeilmeldinger}
                                dagIMåneden={DagIMåneden.SISTE_DAG}
                                tilhørendeFomFelt={skjema.felter.fom}
                                readOnly={erRedigeringDeaktivert}
                            />
                        </HStack>
                    </div>
                    <Checkbox
                        checked={skjema.felter.deltBosted.verdi}
                        onChange={event => {
                            skjema.felter.deltBosted.validerOgSettFelt(event.target.checked);
                            skjema.felter.antallTimer.validerOgSettFelt('0');
                        }}
                        readOnly={erRedigeringDeaktivert}
                    >
                        {'Barnet har delt bosted'}
                    </Checkbox>
                    <TextField
                        className={Styles.field}
                        {...skjema.felter.antallTimer.hentNavBaseSkjemaProps(skjema.visFeilmeldinger)}
                        label={<Label>Antall timer i barnehage</Label>}
                        value={skjema.felter.antallTimer.verdi ?? ''}
                        onChange={event => {
                            if (isNumeric(event.target.value)) {
                                skjema.felter.antallTimer.validerOgSettFelt(event.target.value);
                            }
                        }}
                        readOnly={erRedigeringDeaktivert || skjema.felter.deltBosted.verdi}
                    />
                    {!erRedigeringDeaktivert && (
                        <HStack marginBlock={'space-16'} justify={'space-between'}>
                            <HStack gap={'space-8'}>
                                <Button size={'small'} variant={'primary'} onClick={oppdaterOvergangsordningAndel}>
                                    Bekreft
                                </Button>
                                <Button
                                    variant="tertiary"
                                    size="small"
                                    onClick={tilbakestillOgLukkOvergangsordningAndel}
                                >
                                    Avbryt
                                </Button>
                            </HStack>

                            {!erRedigeringDeaktivert && (
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
                        </HStack>
                    )}
                </VStack>
            </Fieldset>
        </Box>
    );
};

export default OvergangsordningAndelSkjema;

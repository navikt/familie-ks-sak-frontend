import type { ChangeEvent } from 'react';

import { useErLesevisning } from '@hooks/useErLesevisning';
import { validerFritekstKulepunkt } from '@utils/fritekstfelter';
import { useController, useFormContext } from 'react-hook-form';

import { PlusCircleIcon, TrashIcon } from '@navikt/aksel-icons';
import { Button, Fieldset, HStack, Label, Textarea } from '@navikt/ds-react';

import { erBrevmalMedObligatoriskFritekstKulepunkt } from './brevmalRegler';
import styles from './Brevskjema.module.css';
import type { Brevmal } from './typer';
import { type BrevModulFormValues, BrevmodulFeltnavn } from './useBrevModul';
import { useSkjemaErLåst } from './useSkjemaErLåst';

const makslengdeFritekstHvertKulepunkt = 220;
const maksAntallKulepunkter = 20;
const fritekstSkjemaGruppeId = 'Fritekster-brev';

interface Props {
    leggTilFritekstKulepunkt: () => void;
}

export function FritekstKulepunkterField({ leggTilFritekstKulepunkt }: Props) {
    const {
        control,
        watch,
        formState: { isSubmitted },
    } = useFormContext<BrevModulFormValues>();
    const erLesevisning = useErLesevisning();
    const skjemaErLåst = useSkjemaErLåst();

    const valgtBrevmal = watch(BrevmodulFeltnavn.BREVMAL) as Brevmal;

    const { field } = useController({
        name: BrevmodulFeltnavn.FRITEKST_KULEPUNKTER,
        control,
        rules: {
            validate: kulepunkter =>
                !kulepunkter.some(
                    kulepunkt => validerFritekstKulepunkt(kulepunkt, makslengdeFritekstHvertKulepunkt) !== undefined
                ),
        },
    });

    const erMaksAntallKulepunkter = field.value.length >= maksAntallKulepunkter;

    return (
        <div>
            <Label htmlFor={fritekstSkjemaGruppeId}>Legg til kulepunkt</Label>
            <Fieldset legend="Legg til kulepunkt" hideLegend id={fritekstSkjemaGruppeId}>
                {field.value.map((fritekst, index) => {
                    const fritekstId = fritekst.id;

                    const feilmelding = isSubmitted
                        ? validerFritekstKulepunkt(fritekst, makslengdeFritekstHvertKulepunkt)
                        : undefined;

                    return (
                        <HStack key={`fritekst-${fritekstId}`}>
                            <Textarea
                                key={`fritekst-${fritekstId}`}
                                id={`${fritekstId}`}
                                className={styles.textarea}
                                label="Skriv inn kulepunkt"
                                hideLabel
                                size={'small'}
                                value={fritekst.tekst}
                                maxLength={makslengdeFritekstHvertKulepunkt}
                                readOnly={skjemaErLåst}
                                onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                                    field.onChange(
                                        field.value.map(kulepunkt =>
                                            kulepunkt.id === fritekstId
                                                ? { ...kulepunkt, tekst: event.target.value }
                                                : kulepunkt
                                        )
                                    )
                                }
                                error={feilmelding}
                                /* eslint-disable-next-line jsx-a11y/no-autofocus */
                                autoFocus
                            />
                            {!(erBrevmalMedObligatoriskFritekstKulepunkt(valgtBrevmal) && index === 0) && (
                                <Button
                                    type={'button'}
                                    variant={'tertiary'}
                                    onClick={() =>
                                        field.onChange(field.value.filter(kulepunkt => kulepunkt.id !== fritekstId))
                                    }
                                    id={`fjern_fritekst-${fritekstId}`}
                                    size={'small'}
                                    disabled={skjemaErLåst}
                                    aria-label={'Fjern fritekst'}
                                    icon={<TrashIcon />}
                                    className={styles.removeButton}
                                >
                                    {'Fjern'}
                                </Button>
                            )}
                        </HStack>
                    );
                })}
            </Fieldset>

            {!erMaksAntallKulepunkter && !erLesevisning && (
                <Button
                    type={'button'}
                    variant={'tertiary'}
                    onClick={() => leggTilFritekstKulepunkt()}
                    id={`legg-til-fritekst`}
                    size={'small'}
                    disabled={skjemaErLåst}
                    icon={<PlusCircleIcon />}
                    className={styles.addButton}
                >
                    {'Legg til kulepunkt'}
                </Button>
            )}
        </div>
    );
}

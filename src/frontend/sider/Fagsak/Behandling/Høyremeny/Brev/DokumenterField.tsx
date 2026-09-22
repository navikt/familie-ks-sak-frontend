import { målform } from '@typer/søknad';
import { useController, useFormContext } from 'react-hook-form';

import { HStack, Tag, UNSAFE_Combobox } from '@navikt/ds-react';

import styles from './Brevskjema.module.css';
import { leggTilValuePåOption, opplysningsdokumenter } from './typer';
import { type BrevModulFormValues, BrevmodulFeltnavn } from './useBrevModul';
import { useMottakersMålform } from './useMottakersMålform';
import { useSkjemaErLåst } from './useSkjemaErLåst';

export function DokumenterField() {
    const { control } = useFormContext<BrevModulFormValues>();
    const skjemaErLåst = useSkjemaErLåst();
    const mottakersMålform = useMottakersMålform();

    const dokumenterOptions = opplysningsdokumenter.map(leggTilValuePåOption);

    const {
        field,
        fieldState: { error },
    } = useController({
        name: BrevmodulFeltnavn.DOKUMENTER,
        control,
        rules: {
            validate: (verdi, values) =>
                verdi.length === 0 && values.fritekstKulepunkter.length === 0 ? 'Du må velge minst ett dokument' : true,
        },
    });

    return (
        <UNSAFE_Combobox
            id={'velg-dokumenter'}
            className={styles.documentsCombobox}
            label={
                <HStack marginBlock={'space-16 space-8'} justify={'space-between'}>
                    Velg dokumenter
                    <Tag variant="neutral" size="small">
                        Skriv {målform[mottakersMålform].toLowerCase()}
                    </Tag>
                </HStack>
            }
            readOnly={skjemaErLåst}
            isMultiSelect
            options={dokumenterOptions}
            selectedOptions={field.value}
            onToggleSelected={(optionValue: string, isSelected: boolean) => {
                if (isSelected) {
                    const nyttValg = dokumenterOptions.find(valg => valg.value === optionValue);
                    if (nyttValg) {
                        field.onChange([...field.value, nyttValg]);
                    }
                } else {
                    field.onChange(field.value.filter(valg => valg.value !== optionValue));
                }
            }}
            error={error?.message}
        />
    );
}

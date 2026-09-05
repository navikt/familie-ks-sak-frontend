import { useRef } from 'react';

import { useErLesevisning } from '@hooks/useErLesevisning';
import { tidligsteRelevanteDato } from '@komponenter/Datovelger/utils';
import type { IGrunnlagPerson } from '@typer/person';
import { hentDagensDato, isoStringTilDate } from '@utils/dato';
import { useController, useFormContext } from 'react-hook-form';

import { DatePicker, type DateValidationT, useDatepicker } from '@navikt/ds-react';

import { validerAdopsjonsdato } from './BarnetsAlderValidering';
import {
    utledAdopsjonsdatoFraPerson,
    VilkårResultatFelt,
    type VilkårResultatFormValues,
} from '../../useVilkårResultatSkjema';

interface Props {
    person: IGrunnlagPerson;
}

export function AdopsjonsdatoFelt({ person }: Props) {
    const fødselsdato = isoStringTilDate(person.fødselsdato);
    const erLesevisning = useErLesevisning();

    const { control } = useFormContext<VilkårResultatFormValues>();

    const dateValidationRef = useRef<DateValidationT | undefined>(undefined);
    const ventendeDato = useRef<{ dato: Date | undefined } | null>(null);

    const {
        field: { onChange, ref },
        fieldState: { error },
        formState: { isSubmitting },
    } = useController({
        name: VilkårResultatFelt.ADOPSJONSDATO,
        control,
        rules: {
            deps: [VilkårResultatFelt.PERIODE],
            validate: adopsjonsdato => {
                const dateValidation = dateValidationRef.current;
                if (dateValidation && !dateValidation.isEmpty) {
                    if (dateValidation.isAfter) {
                        return 'Du kan ikke sette en dato som er frem i tid';
                    }
                    if (dateValidation.isInvalid) {
                        return 'Du må velge en gyldig dato';
                    }
                }
                return validerAdopsjonsdato(adopsjonsdato, fødselsdato);
            },
        },
    });

    const { datepickerProps, inputProps } = useDatepicker({
        defaultSelected: utledAdopsjonsdatoFraPerson(person) ?? undefined,
        fromDate: tidligsteRelevanteDato,
        toDate: hentDagensDato(),
        onDateChange: dato => {
            ventendeDato.current = { dato };
        },
        onValidate: validation => {
            dateValidationRef.current = validation;
            if (ventendeDato.current) {
                onChange(ventendeDato.current.dato ?? null);
                ventendeDato.current = null;
            }
        },
    });

    return (
        <DatePicker dropdownCaption {...datepickerProps}>
            <DatePicker.Input
                {...inputProps}
                ref={ref}
                label={'Adopsjonsdato'}
                placeholder={'DD.MM.ÅÅÅÅ'}
                readOnly={erLesevisning || isSubmitting}
                error={error?.message}
            />
        </DatePicker>
    );
}

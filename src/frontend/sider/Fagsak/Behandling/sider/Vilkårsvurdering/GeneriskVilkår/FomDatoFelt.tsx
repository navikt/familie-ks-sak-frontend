import { type Ref, useRef } from 'react';

import { senesteRelevanteDato, tidligsteRelevanteDato } from '@komponenter/Datovelger/utils';
import { Resultat } from '@typer/vilkår';
import {
    dateTilIsoDatoStringEllerUndefined,
    type IsoDatoString,
    isoStringTilDateEllerUndefinedHvisUgyldigDato,
} from '@utils/dato';
import { useFormContext, useWatch } from 'react-hook-form';

import { DatePicker, type DateValidationT, useDatepicker } from '@navikt/ds-react';

import { VilkårResultatFelt, type VilkårResultatFormValues } from './useVilkårResultatSkjema';

interface Props {
    lagretFom: IsoDatoString | undefined;
    readOnly: boolean;
    inputRef: Ref<HTMLInputElement>;
    onValidert: (validation: DateValidationT) => void;
    onEndret: (fom: IsoDatoString | undefined) => void;
}

export function FomDatoFelt({ lagretFom, readOnly, inputRef, onValidert, onEndret }: Props) {
    const { control } = useFormContext<VilkårResultatFormValues>();

    const resultat = useWatch({ control, name: VilkårResultatFelt.RESULTAT });
    const erEksplisittAvslagPåSøknad = useWatch({ control, name: VilkårResultatFelt.ER_EKSPLISITT_AVSLAG_PÅ_SØKNAD });

    const ventendeDato = useRef<{ dato: Date | undefined } | null>(null);

    const { datepickerProps, inputProps } = useDatepicker({
        defaultSelected: isoStringTilDateEllerUndefinedHvisUgyldigDato(lagretFom),
        fromDate: tidligsteRelevanteDato,
        toDate: senesteRelevanteDato,
        onDateChange: dato => {
            ventendeDato.current = { dato };
        },
        onValidate: validation => {
            onValidert(validation);
            if (ventendeDato.current) {
                onEndret(dateTilIsoDatoStringEllerUndefined(ventendeDato.current.dato));
                ventendeDato.current = null;
            }
        },
    });

    const erValgfri = resultat === Resultat.IKKE_OPPFYLT && erEksplisittAvslagPåSøknad;

    return (
        <DatePicker dropdownCaption {...datepickerProps}>
            <DatePicker.Input
                {...inputProps}
                ref={inputRef}
                label={erValgfri ? 'F.o.m (valgfri)' : 'F.o.m'}
                placeholder={'DD.MM.ÅÅÅÅ'}
                readOnly={readOnly}
            />
        </DatePicker>
    );
}

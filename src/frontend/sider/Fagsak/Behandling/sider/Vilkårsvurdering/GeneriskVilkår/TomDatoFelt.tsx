import { useRef } from 'react';

import { senesteRelevanteDato, tidligsteRelevanteDato } from '@komponenter/Datovelger/utils';
import { VilkårType } from '@typer/vilkår';
import {
    dateTilIsoDatoStringEllerUndefined,
    type IsoDatoString,
    isoStringTilDateEllerUndefinedHvisUgyldigDato,
} from '@utils/dato';

import { DatePicker, type DateValidationT, useDatepicker } from '@navikt/ds-react';

interface Props {
    vilkårType: VilkårType;
    lagretTom: IsoDatoString | undefined;
    readOnly: boolean;
    onValidert: (validation: DateValidationT) => void;
    onEndret: (tom: IsoDatoString | undefined) => void;
}

export function TomDatoFelt({ vilkårType, lagretTom, readOnly, onValidert, onEndret }: Props) {
    const ventendeDato = useRef<{ dato: Date | undefined } | null>(null);

    const { datepickerProps, inputProps } = useDatepicker({
        defaultSelected: isoStringTilDateEllerUndefinedHvisUgyldigDato(lagretTom),
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

    const erPåkrevd = vilkårType === VilkårType.BARNETS_ALDER;

    return (
        <DatePicker dropdownCaption {...datepickerProps}>
            <DatePicker.Input
                {...inputProps}
                label={erPåkrevd ? 'T.o.m' : 'T.o.m (valgfri)'}
                placeholder={'DD.MM.ÅÅÅÅ'}
                readOnly={readOnly}
            />
        </DatePicker>
    );
}

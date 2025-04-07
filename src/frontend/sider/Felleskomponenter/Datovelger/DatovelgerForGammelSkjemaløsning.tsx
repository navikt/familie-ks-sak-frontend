import * as React from 'react';
import { useEffect } from 'react';

import { isValid, parseISO } from 'date-fns';

import { DatePicker, useDatepicker } from '@navikt/ds-react';

import { senesteRelevanteDato, tidligsteRelevanteDato } from './utils';
import { dagensDato, dateTilFormatertString, Datoformat } from '../../../utils/dato';
import type { IsoDatoString } from '../../../utils/dato';

interface IProps {
    value: string | undefined;
    onDateChange: (dato: IsoDatoString) => void;
    label: string;
    visFeilmeldinger: boolean;
    feilmelding?: string;
    readOnly?: boolean;
    kanKunVelgeFortid?: boolean;
    minDatoAvgrensning?: Date;
}

const DatovelgerForGammelSkjemaløsning = ({
    value,
    onDateChange,
    label,
    visFeilmeldinger,
    minDatoAvgrensning,
    feilmelding = undefined,
    readOnly = false,
    kanKunVelgeFortid = false,
}: IProps) => {
    const formatterDefaultSelected = () => {
        if (value === undefined) return undefined;
        const isoString = parseISO(value);
        return isValid(isoString) ? isoString : undefined;
    };

    const { datepickerProps, inputProps, selectedDay, setSelected } = useDatepicker({
        defaultSelected: formatterDefaultSelected(),
        fromDate: minDatoAvgrensning ? minDatoAvgrensning : tidligsteRelevanteDato,
        toDate: kanKunVelgeFortid ? dagensDato : senesteRelevanteDato,
    });

    useEffect(() => {
        onDateChange(
            dateTilFormatertString({
                date: selectedDay,
                tilFormat: Datoformat.ISO_DAG,
                defaultString: inputProps.value?.toString(),
            })
        );
    }, [inputProps.value]);

    const [forrigeValue, settForrigeValue] = React.useState<string | undefined>();

    // Oppdaterer verdien til datovelgeren hvis value har endret seg uten at det er datovelgeren som har trigget endringen
    if (value != forrigeValue) {
        settForrigeValue(value);
        if (value != inputProps.value) {
            setSelected(formatterDefaultSelected());
        }
    }

    return (
        <DatePicker dropdownCaption {...datepickerProps}>
            <DatePicker.Input
                {...inputProps}
                label={label}
                placeholder={'DD.MM.ÅÅÅÅ'}
                readOnly={readOnly}
                error={visFeilmeldinger && feilmelding}
            />
        </DatePicker>
    );
};

export default DatovelgerForGammelSkjemaløsning;

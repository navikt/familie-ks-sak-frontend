import { useErLesevisning } from '@hooks/useErLesevisning';
import { useController, useFormContext } from 'react-hook-form';

import { TextField } from '@navikt/ds-react';

import { validerAntallTimer } from '../../../validering';
import { VilkårResultatFelt, type VilkårResultatFormValues } from '../../useVilkårResultatSkjema';

interface Props {
    onEndret: () => void;
}

export function AntallTimerFelt({ onEndret }: Props) {
    const erLesevisning = useErLesevisning();

    const { control } = useFormContext<VilkårResultatFormValues>();

    const {
        field: { value, onChange, onBlur, ref },
        fieldState: { error },
        formState: { isSubmitting },
    } = useController({
        name: VilkårResultatFelt.ANTALL_TIMER,
        control,
        rules: {
            validate: (antallTimer, formValues) =>
                validerAntallTimer(antallTimer, {
                    resultat: formValues.resultat,
                    utdypendeVilkårsvurderinger: formValues.utdypendeVilkårsvurderinger,
                }),
        },
    });

    return (
        <TextField
            ref={ref}
            onBlur={onBlur}
            label={'Antall timer'}
            type={'number'}
            readOnly={erLesevisning || isSubmitting}
            value={value}
            onChange={event => {
                onChange(event.target.value);
                onEndret();
            }}
            error={error?.message}
        />
    );
}

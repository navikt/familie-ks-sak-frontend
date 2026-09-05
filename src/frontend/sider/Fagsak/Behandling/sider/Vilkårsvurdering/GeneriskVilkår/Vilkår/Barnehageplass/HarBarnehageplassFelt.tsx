import { useErLesevisning } from '@hooks/useErLesevisning';
import { useController, useFormContext } from 'react-hook-form';

import { Radio, RadioGroup } from '@navikt/ds-react';

import { VilkårResultatFelt, type VilkårResultatFormValues } from '../../useVilkårResultatSkjema';

interface Props {
    legend: string;
    onEndret: (harBarnehageplass: boolean) => void;
}

export function HarBarnehageplassFelt({ legend, onEndret }: Props) {
    const erLesevisning = useErLesevisning();

    const { control } = useFormContext<VilkårResultatFormValues>();

    const {
        field: { value, onChange, onBlur, ref },
        fieldState: { error },
        formState: { isSubmitting },
    } = useController({
        name: VilkårResultatFelt.HAR_BARNEHAGEPLASS,
        control,
        rules: {
            deps: [VilkårResultatFelt.ANTALL_TIMER, VilkårResultatFelt.PERIODE],
            validate: harBarnehageplass => (harBarnehageplass === null ? 'Resultat er ikke satt' : undefined),
        },
    });

    return (
        <RadioGroup
            ref={ref}
            onBlur={onBlur}
            readOnly={erLesevisning || isSubmitting}
            value={value}
            legend={legend}
            error={error?.message}
            onChange={(harBarnehageplass: boolean) => {
                onChange(harBarnehageplass);
                onEndret(harBarnehageplass);
            }}
        >
            <Radio value={true}>Ja</Radio>
            <Radio value={false}>Nei</Radio>
        </RadioGroup>
    );
}

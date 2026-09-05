import { useErLesevisning } from '@hooks/useErLesevisning';
import { Resultat } from '@typer/vilkår';
import { useController, useFormContext } from 'react-hook-form';

import { Radio, RadioGroup } from '@navikt/ds-react';

import { validerResultat } from '../validering';
import { VilkårResultatFelt, type VilkårResultatFormValues } from './useVilkårResultatSkjema';

interface ResultatAlternativ {
    verdi: Resultat;
    label: string;
}

export const JA_NEI_ALTERNATIVER: ResultatAlternativ[] = [
    { verdi: Resultat.OPPFYLT, label: 'Ja' },
    { verdi: Resultat.IKKE_OPPFYLT, label: 'Nei' },
];

export const IKKE_AKTUELT_ALTERNATIV: ResultatAlternativ = { verdi: Resultat.IKKE_AKTUELT, label: 'Ikke aktuelt' };

interface Props {
    legend: string;
    alternativer?: ResultatAlternativ[];
}

export function ResultatFelt({ legend, alternativer = JA_NEI_ALTERNATIVER }: Props) {
    const erLesevisning = useErLesevisning();

    const { control, setValue } = useFormContext<VilkårResultatFormValues>();

    const {
        field: { value, onChange, onBlur, ref },
        fieldState: { error },
        formState: { isSubmitting },
    } = useController({
        name: VilkårResultatFelt.RESULTAT,
        control,
        rules: {
            deps: [VilkårResultatFelt.UTDYPENDE_VILKÅRSVURDERINGER, VilkårResultatFelt.PERIODE],
            validate: resultat => validerResultat(resultat),
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
            onChange={(nyttResultat: Resultat) => {
                onChange(nyttResultat);
                if (nyttResultat !== Resultat.IKKE_OPPFYLT) {
                    setValue(VilkårResultatFelt.ER_EKSPLISITT_AVSLAG_PÅ_SØKNAD, false, { shouldDirty: true });
                    setValue(VilkårResultatFelt.AVSLAG_BEGRUNNELSER, [], { shouldDirty: true });
                }
            }}
        >
            {alternativer.map(alternativ => (
                <Radio key={alternativ.verdi} value={alternativ.verdi}>
                    {alternativ.label}
                </Radio>
            ))}
        </RadioGroup>
    );
}

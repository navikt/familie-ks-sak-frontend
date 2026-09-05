import { useErLesevisning } from '@hooks/useErLesevisning';
import type { PersonType } from '@typer/person';
import type { VilkårType } from '@typer/vilkår';
import { useController, useFormContext, useWatch } from 'react-hook-form';

import { Textarea } from '@navikt/ds-react';

import { erBegrunnelsePåkrevd, validerBegrunnelse } from '../validering';
import { VilkårResultatFelt, type VilkårResultatFormValues } from './useVilkårResultatSkjema';

interface Props {
    personType: PersonType;
    vilkårType: VilkårType;
    valider?: (begrunnelse: string, formValues: VilkårResultatFormValues) => string | undefined;
}

export function BegrunnelseFelt({ personType, vilkårType, valider }: Props) {
    const erLesevisning = useErLesevisning();

    const { control } = useFormContext<VilkårResultatFormValues>();

    const vurderesEtter = useWatch({ control, name: VilkårResultatFelt.VURDERES_ETTER });
    const utdypendeVilkårsvurderinger = useWatch({ control, name: VilkårResultatFelt.UTDYPENDE_VILKÅRSVURDERINGER });
    const søkerHarMeldtFraOmBarnehageplass = useWatch({
        control,
        name: VilkårResultatFelt.SØKER_HAR_MELDT_FRA_OM_BARNEHAGEPLASS,
    });

    const {
        field: { value, onChange, onBlur, ref },
        fieldState: { error },
        formState: { isSubmitting },
    } = useController({
        name: VilkårResultatFelt.BEGRUNNELSE,
        control,
        rules: {
            validate: (begrunnelse, formValues) =>
                valider
                    ? valider(begrunnelse, formValues)
                    : validerBegrunnelse(begrunnelse, {
                          vilkårType,
                          vurderesEtter: formValues.vurderesEtter,
                          utdypendeVilkårsvurderinger: formValues.utdypendeVilkårsvurderinger,
                          personType,
                          søkerHarMeldtFraOmBarnehageplass: formValues.søkerHarMeldtFraOmBarnehageplass,
                      }),
        },
    });

    const påkrevd = erBegrunnelsePåkrevd({
        vilkårType,
        vurderesEtter,
        utdypendeVilkårsvurderinger,
        personType,
        søkerHarMeldtFraOmBarnehageplass,
    });

    return (
        <Textarea
            ref={ref}
            onBlur={onBlur}
            readOnly={erLesevisning || isSubmitting}
            value={value}
            onChange={onChange}
            label={påkrevd ? 'Begrunnelse' : 'Begrunnelse (valgfri)'}
            placeholder={'Begrunn hvorfor det er gjort endringer på vilkåret.'}
            error={error?.message}
        />
    );
}

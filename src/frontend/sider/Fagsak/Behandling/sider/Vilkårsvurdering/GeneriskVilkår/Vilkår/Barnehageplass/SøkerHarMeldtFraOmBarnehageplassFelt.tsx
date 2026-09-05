import { useErLesevisning } from '@hooks/useErLesevisning';
import { useController, useFormContext } from 'react-hook-form';

import { BodyShort, Checkbox, VStack } from '@navikt/ds-react';

import { VilkårResultatFelt, type VilkårResultatFormValues } from '../../useVilkårResultatSkjema';

export function SøkerHarMeldtFraOmBarnehageplassFelt() {
    const erLesevisning = useErLesevisning();

    const { control } = useFormContext<VilkårResultatFormValues>();

    const {
        field: { value, onChange, onBlur, ref },
        formState: { isSubmitting },
    } = useController({
        name: VilkårResultatFelt.SØKER_HAR_MELDT_FRA_OM_BARNEHAGEPLASS,
        control,
    });

    return (
        <VStack gap={'space-4'}>
            {value && (
                <BodyShort as={'em'} size="small">
                    Merk at tom-dato skal være dagen før barnehagestart
                </BodyShort>
            )}
            <Checkbox
                ref={ref}
                onBlur={onBlur}
                checked={value}
                readOnly={erLesevisning || isSubmitting}
                onChange={event => onChange(event.target.checked)}
            >
                Søker har meldt fra om barnehageplass
            </Checkbox>
        </VStack>
    );
}

import { type PropsWithChildren, useRef } from 'react';

import { useErLesevisning } from '@hooks/useErLesevisning';
import type { IGrunnlagPerson } from '@typer/person';
import type { VilkårType } from '@typer/vilkår';
import type { IIsoDatoPeriode, IsoDatoString } from '@utils/dato';
import { useController, useFormContext } from 'react-hook-form';

import { type DateValidationT, Fieldset, HelpText, HStack, Label } from '@navikt/ds-react';

import { FomDatoFelt } from './FomDatoFelt';
import { TomDatoFelt } from './TomDatoFelt';
import { VilkårResultatFelt, type VilkårResultatFormValues } from './useVilkårResultatSkjema';
import { validerPeriode } from '../validering';

const harUgyldigDatoInput = (validation: DateValidationT | undefined) =>
    !!validation && !validation.isEmpty && (validation.isInvalid || validation.isBefore || validation.isAfter);

interface Props extends PropsWithChildren {
    person: IGrunnlagPerson;
    vilkårType: VilkårType;
    lagretPeriode: IIsoDatoPeriode;
    førsteLagredeFom?: IsoDatoString;
    onEndret?: (periode: IIsoDatoPeriode) => void;
}

export function PeriodeFelt({ person, vilkårType, lagretPeriode, førsteLagredeFom, onEndret, children }: Props) {
    const erLesevisning = useErLesevisning();

    const { control } = useFormContext<VilkårResultatFormValues>();

    const fomValidationRef = useRef<DateValidationT | undefined>(undefined);
    const tomValidationRef = useRef<DateValidationT | undefined>(undefined);

    const {
        field: { value, onChange, ref },
        fieldState: { error },
        formState: { isSubmitting },
    } = useController({
        name: VilkårResultatFelt.PERIODE,
        control,
        rules: {
            validate: (periode, formValues) => {
                if (harUgyldigDatoInput(fomValidationRef.current)) {
                    return 'Ugyldig f.o.m.';
                }
                if (harUgyldigDatoInput(tomValidationRef.current)) {
                    return 'Ugyldig t.o.m.';
                }
                return validerPeriode(periode, vilkårType, {
                    person,
                    erEksplisittAvslagPåSøknad: formValues.erEksplisittAvslagPåSøknad,
                    resultat: formValues.resultat,
                    utdypendeVilkårsvurderinger: formValues.utdypendeVilkårsvurderinger,
                    søkerHarMeldtFraOmBarnehageplass: formValues.søkerHarMeldtFraOmBarnehageplass,
                    adopsjonsdato: formValues.adopsjonsdato,
                    førsteLagredeFom,
                });
            },
        },
    });

    const oppdaterPeriode = (periode: IIsoDatoPeriode) => {
        onChange(periode);
        onEndret?.(periode);
    };

    const readOnly = erLesevisning || isSubmitting;

    return (
        <Fieldset legend={'Periode for vurderingen'} hideLegend error={error?.message}>
            {!erLesevisning && (
                <HStack gap={'space-8'} align={'center'}>
                    <Label>Velg periode</Label>
                    <HelpText title="Hvordan fastsette periode">
                        Oppgi startdato/periode hvor vilkåret er oppfylt/ikke oppfylt. Virkningstidspunktet vil bli
                        beregnet ut fra dette. Dersom vurderingen gjelder et avslag er ikke periode påkrevd.
                    </HelpText>
                </HStack>
            )}
            <HStack gap={'space-16'}>
                <FomDatoFelt
                    lagretFom={lagretPeriode.fom}
                    readOnly={readOnly}
                    inputRef={ref}
                    onValidert={validation => {
                        fomValidationRef.current = validation;
                    }}
                    onEndret={fom => oppdaterPeriode({ ...value, fom })}
                />
                <TomDatoFelt
                    vilkårType={vilkårType}
                    lagretTom={lagretPeriode.tom}
                    readOnly={readOnly}
                    onValidert={validation => {
                        tomValidationRef.current = validation;
                    }}
                    onEndret={tom => oppdaterPeriode({ ...value, tom })}
                />
            </HStack>
            {children}
        </Fieldset>
    );
}

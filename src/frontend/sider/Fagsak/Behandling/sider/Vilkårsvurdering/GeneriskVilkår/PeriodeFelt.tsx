import { type PropsWithChildren, useRef } from 'react';

import { useErLesevisning } from '@hooks/useErLesevisning';
import { senesteRelevanteDato, tidligsteRelevanteDato } from '@komponenter/Datovelger/utils';
import type { IGrunnlagPerson } from '@typer/person';
import { Resultat, VilkårType } from '@typer/vilkår';
import {
    dateTilIsoDatoStringEllerUndefined,
    type IIsoDatoPeriode,
    type IsoDatoString,
    isoStringTilDateEllerUndefinedHvisUgyldigDato,
} from '@utils/dato';
import { useController, useFormContext, useWatch } from 'react-hook-form';

import { DatePicker, type DateValidationT, Fieldset, HelpText, HStack, Label, useDatepicker } from '@navikt/ds-react';

import { validerPeriode } from '../validering';
import { VilkårResultatFelt, type VilkårResultatFormValues } from './useVilkårResultatSkjema';

const harUgyldigDatoInput = (validation: DateValidationT | undefined) =>
    !!validation && !validation.isEmpty && (validation.isInvalid || validation.isBefore || validation.isAfter);

interface Props extends PropsWithChildren {
    person: IGrunnlagPerson;
    vilkårType: VilkårType;
    førsteLagredeFom?: IsoDatoString;
    onEndret?: (periode: IIsoDatoPeriode) => void;
}

export function PeriodeFelt({ person, vilkårType, førsteLagredeFom, onEndret, children }: Props) {
    const erLesevisning = useErLesevisning();

    const { control, trigger } = useFormContext<VilkårResultatFormValues>();

    const resultat = useWatch({ control, name: VilkårResultatFelt.RESULTAT });
    const erEksplisittAvslagPåSøknad = useWatch({ control, name: VilkårResultatFelt.ER_EKSPLISITT_AVSLAG_PÅ_SØKNAD });

    const fomValidationRef = useRef<DateValidationT | undefined>(undefined);
    const tomValidationRef = useRef<DateValidationT | undefined>(undefined);

    const {
        field: { value, onChange, ref },
        fieldState: { error },
        formState: { isSubmitting, isSubmitted },
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
        if (isSubmitted) {
            trigger(VilkårResultatFelt.PERIODE);
        }
    };

    const fom = useDatepicker({
        defaultSelected: isoStringTilDateEllerUndefinedHvisUgyldigDato(value.fom),
        fromDate: tidligsteRelevanteDato,
        toDate: senesteRelevanteDato,
        onDateChange: dato => oppdaterPeriode({ ...value, fom: dateTilIsoDatoStringEllerUndefined(dato) }),
        onValidate: validation => {
            fomValidationRef.current = validation;
            if (isSubmitted) {
                trigger(VilkårResultatFelt.PERIODE);
            }
        },
    });

    const tom = useDatepicker({
        defaultSelected: isoStringTilDateEllerUndefinedHvisUgyldigDato(value.tom),
        fromDate: tidligsteRelevanteDato,
        toDate: senesteRelevanteDato,
        onDateChange: dato => oppdaterPeriode({ ...value, tom: dateTilIsoDatoStringEllerUndefined(dato) }),
        onValidate: validation => {
            tomValidationRef.current = validation;
            if (isSubmitted) {
                trigger(VilkårResultatFelt.PERIODE);
            }
        },
    });

    const fomErValgfri = resultat === Resultat.IKKE_OPPFYLT && erEksplisittAvslagPåSøknad;
    const tomErPåkrevd = vilkårType === VilkårType.BARNETS_ALDER;

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
                <DatePicker dropdownCaption {...fom.datepickerProps}>
                    <DatePicker.Input
                        {...fom.inputProps}
                        ref={ref}
                        label={fomErValgfri ? 'F.o.m (valgfri)' : 'F.o.m'}
                        placeholder={'DD.MM.ÅÅÅÅ'}
                        readOnly={erLesevisning || isSubmitting}
                    />
                </DatePicker>
                <DatePicker dropdownCaption {...tom.datepickerProps}>
                    <DatePicker.Input
                        {...tom.inputProps}
                        label={tomErPåkrevd ? 'T.o.m' : 'T.o.m (valgfri)'}
                        placeholder={'DD.MM.ÅÅÅÅ'}
                        readOnly={erLesevisning || isSubmitting}
                    />
                </DatePicker>
            </HStack>
            {children}
        </Fieldset>
    );
}

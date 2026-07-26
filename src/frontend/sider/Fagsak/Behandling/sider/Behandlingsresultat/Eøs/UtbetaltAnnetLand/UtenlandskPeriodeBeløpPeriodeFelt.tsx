import MånedÅrVelger from '@komponenter/MånedÅrInput/MånedÅrVelger';
import { hentDagensDato, isoStringTilDate } from '@utils/dato';
import { isEmpty } from '@utils/eøsValidators';
import { addMonths, endOfMonth, isAfter } from 'date-fns';
import { useController, useFormContext } from 'react-hook-form';

import { Fieldset, HStack } from '@navikt/ds-react';

import { UtenlandskPeriodeBeløpFelt, type UtenlandskPeriodeBeløpFormValues } from './useUtenlandskPeriodeBeløpSkjema';

const valgtDatoErNesteMånedEllerSenere = (valgtDato: string) =>
    isAfter(isoStringTilDate(valgtDato), endOfMonth(hentDagensDato()));

const valgtDatoErSenereEnnNesteMåned = (valgtDato: string) =>
    isAfter(isoStringTilDate(valgtDato), endOfMonth(addMonths(hentDagensDato(), 1)));

interface Props {
    initiellFom: string;
    periodeFeilmeldingId: string;
    lesevisning: boolean;
    behandlingsÅrsakErOvergangsordning: boolean;
}

export function UtenlandskPeriodeBeløpPeriodeFelt({
    initiellFom,
    periodeFeilmeldingId,
    lesevisning,
    behandlingsÅrsakErOvergangsordning,
}: Props) {
    const { control } = useFormContext<UtenlandskPeriodeBeløpFormValues>();

    const {
        field: { value, onChange },
        fieldState: { error },
    } = useController({
        name: UtenlandskPeriodeBeløpFelt.PERIODE,
        control,
        rules: {
            validate: periode => {
                const fom = periode.fom;
                const tom = periode.tom;

                if (!fom || isEmpty(fom)) {
                    return 'Fra og med måned må være utfylt';
                }
                if (fom && valgtDatoErSenereEnnNesteMåned(fom) && !behandlingsÅrsakErOvergangsordning) {
                    return 'Du kan ikke sette fra og med (f.o.m.) til måneden etter neste måned eller senere';
                }
                if (initiellFom && !isAfter(isoStringTilDate(fom), isoStringTilDate(initiellFom))) {
                    return `Du kan ikke legge inn fra og med måned som er før: ${initiellFom}`;
                }
                if (tom && valgtDatoErNesteMånedEllerSenere(tom) && !behandlingsÅrsakErOvergangsordning) {
                    return 'Du kan ikke sette til og med (t.o.m.) til neste måned eller senere';
                }
                return undefined;
            },
        },
    });

    const finnÅrTilbakeTil = (): number => new Date().getFullYear() - new Date(initiellFom).getFullYear();
    const antallÅrFrem = behandlingsÅrsakErOvergangsordning ? 1 : 0;

    return (
        <Fieldset
            className={lesevisning ? 'lesevisning' : ''}
            errorId={periodeFeilmeldingId}
            error={error?.message}
            legend="Periode"
            size="medium"
        >
            <HStack justify={'space-between'} gap={'space-16'} width={'32rem'}>
                <MånedÅrVelger
                    lesevisning={lesevisning}
                    id={'periode_fom'}
                    label={'F.o.m'}
                    antallÅrTilbake={finnÅrTilbakeTil()}
                    antallÅrFrem={antallÅrFrem}
                    value={value.fom ?? undefined}
                    onEndret={årMåned => {
                        if (årMåned === value.fom) {
                            return;
                        }
                        onChange({ ...value, fom: årMåned });
                    }}
                />
                <MånedÅrVelger
                    lesevisning={lesevisning}
                    id={'periode_tom'}
                    label={'T.o.m (valgfri)'}
                    antallÅrTilbake={finnÅrTilbakeTil()}
                    antallÅrFrem={antallÅrFrem}
                    value={value.tom ?? undefined}
                    onEndret={årMåned => {
                        if (årMåned === value.tom) {
                            return;
                        }
                        onChange({ ...value, tom: årMåned });
                    }}
                />
            </HStack>
        </Fieldset>
    );
}

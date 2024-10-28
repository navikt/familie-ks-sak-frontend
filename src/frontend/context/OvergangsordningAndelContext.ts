import { useState } from 'react';

import createUseContext from 'constate';
import { isValid } from 'date-fns';

import { feil, ok, useFelt, useSkjema } from '@navikt/familie-skjema';

import type { IBehandling } from '../typer/behandling';
import type {
    IRestOvergangsordningAndel,
    IRestOvergangsordningAndelSkjemaFelt,
} from '../typer/overgangsordningAndel';
import { dateTilIsoMånedÅrString, validerGyldigDato } from '../utils/dato';
import { isNumeric } from '../utils/eøsValidators';

interface IProps {
    overgangsordningAndel: IRestOvergangsordningAndel;
}

const [OvergangsordningAndelProvider, useOvergangsordningAndel] = createUseContext(
    ({ overgangsordningAndel }: IProps) => {
        const { skjema, kanSendeSkjema, onSubmit } = useSkjema<
            IRestOvergangsordningAndelSkjemaFelt,
            IBehandling
        >({
            felter: {
                personIdent: useFelt<string | undefined>({
                    verdi: overgangsordningAndel.personIdent,
                    valideringsfunksjon: felt =>
                        felt.verdi ? ok(felt) : feil(felt, 'Du må velge en person'),
                }),
                antallTimer: useFelt<string | undefined>({
                    verdi: overgangsordningAndel.antallTimer?.toString(),
                    valideringsfunksjon: felt => {
                        if (felt.verdi === undefined) {
                            return ok(felt);
                        }
                        if (!isNumeric(felt.verdi)) {
                            return feil(felt, 'Antall timer må være et tall');
                        }
                        if (Number(felt.verdi) < 0) {
                            return feil(felt, 'Antall timer må være 0 eller større');
                        }
                        return ok(felt);
                    },
                }),
                deltBosted: useFelt<boolean>({
                    verdi: overgangsordningAndel.deltBosted,
                }),
                fom: useFelt<Date | undefined>({
                    verdi: overgangsordningAndel.fom
                        ? new Date(overgangsordningAndel.fom)
                        : undefined,
                    valideringsfunksjon: felt => {
                        return felt.verdi && isValid(felt.verdi)
                            ? ok(felt)
                            : feil(felt, 'Du må velge en gyldig dato');
                    },
                }),
                tom: useFelt<Date | undefined>({
                    verdi: overgangsordningAndel.tom
                        ? new Date(overgangsordningAndel.tom)
                        : undefined,
                    valideringsfunksjon: felt => validerGyldigDato(felt),
                }),
            },
            skjemanavn: 'Endre overgangsandelperiode',
        });
        const [forrigeOvergangsordningAndel, settForrigeOvergangsordningAndel] =
            useState<IRestOvergangsordningAndel>();

        if (overgangsordningAndel !== forrigeOvergangsordningAndel) {
            settForrigeOvergangsordningAndel(overgangsordningAndel);
        }

        const tilbakestillFelterTilDefault = () => {
            skjema.felter.personIdent.nullstill();
            skjema.felter.antallTimer.nullstill();
            skjema.felter.deltBosted.nullstill();
            skjema.felter.fom.nullstill();
            skjema.felter.tom.nullstill();
        };

        const hentSkjemaData = () => {
            const { personIdent, antallTimer, deltBosted, fom, tom } = skjema.felter;
            return {
                id: overgangsordningAndel.id,
                personIdent: personIdent && personIdent.verdi,
                antallTimer: antallTimer && Number(antallTimer.verdi),
                deltBosted: deltBosted.verdi,
                fom: fom && dateTilIsoMånedÅrString(fom.verdi),
                tom: tom && dateTilIsoMånedÅrString(tom.verdi),
            };
        };

        return {
            overgangsordningAndel,
            skjema,
            kanSendeSkjema,
            onSubmit,
            hentSkjemaData,
            tilbakestillFelterTilDefault,
        };
    }
);
export { OvergangsordningAndelProvider, useOvergangsordningAndel };

import { useState } from 'react';

import createUseContext from 'constate';

import { feil, ok, useFelt, useSkjema } from '@navikt/familie-skjema';

import type { IBehandling } from '../typer/behandling';
import type { IRestOvergangsordningAndel } from '../typer/overgangsordningAndel';
import type { IsoMånedString } from '../utils/dato';
import { erIsoStringGyldig } from '../utils/dato';
import { isNumeric } from '../utils/eøsValidators';

interface IProps {
    overgangsordningAndel: IRestOvergangsordningAndel;
}

const [OvergangsordningAndelProvider, useOvergangsordningAndel] = createUseContext(
    ({ overgangsordningAndel }: IProps) => {
        const { skjema, kanSendeSkjema, onSubmit } = useSkjema<
            {
                person: string | undefined;
                antallTimer: string | undefined;
                deltBosted: boolean;
                fom: IsoMånedString | undefined;
                tom: IsoMånedString | undefined;
            },
            IBehandling
        >({
            felter: {
                person: useFelt<string | undefined>({
                    verdi: overgangsordningAndel.personIdent,
                    valideringsfunksjon: felt =>
                        felt.verdi ? ok(felt) : feil(felt, 'Du må velge en person'),
                }),
                antallTimer: useFelt<string | undefined>({
                    verdi: overgangsordningAndel.antallTimer,
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
                fom: useFelt<IsoMånedString | undefined>({
                    verdi: overgangsordningAndel.fom,
                    valideringsfunksjon: felt =>
                        erIsoStringGyldig(felt.verdi)
                            ? ok(felt)
                            : feil(felt, 'Du må velge f.o.m-dato'),
                }),
                tom: useFelt<IsoMånedString | undefined>({
                    verdi: overgangsordningAndel.tom,
                    valideringsfunksjon: felt =>
                        erIsoStringGyldig(felt.verdi)
                            ? ok(felt)
                            : feil(felt, 'Du må velge t.o.m-dato'),
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
            skjema.felter.person.nullstill();
            skjema.felter.antallTimer.nullstill();
            skjema.felter.deltBosted.nullstill();
            skjema.felter.fom.nullstill();
            skjema.felter.tom.nullstill();
        };

        const hentSkjemaData = () => {
            const { person, antallTimer, deltBosted, fom, tom } = skjema.felter;
            return {
                id: overgangsordningAndel.id,
                personIdent: person && person.verdi,
                antallTimer: antallTimer && antallTimer.verdi,
                deltBosted: deltBosted.verdi,
                fom: fom && fom.verdi,
                tom: tom && tom.verdi,
            };
        };

        return {
            overgangsordningAndel: overgangsordningAndel,
            skjema,
            kanSendeSkjema,
            onSubmit,
            hentSkjemaData,
            tilbakestillFelterTilDefault,
        };
    }
);
export { OvergangsordningAndelProvider, useOvergangsordningAndel };

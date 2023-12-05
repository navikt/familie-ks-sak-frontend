import { useState } from 'react';

import createUseContext from 'constate';
import { addMonths, endOfMonth, subMonths } from 'date-fns';

import type { Periode, Etikett } from '@navikt/familie-tidslinje';

import type { IPersonMedAndelerTilkjentYtelse, IYtelsePeriode } from '../typer/beregning';
import type { IGrunnlagPerson } from '../typer/person';
import { dagensDato } from '../utils/dato';
import { sorterPersonTypeOgFødselsdato } from '../utils/formatter';
import {
    hentFørsteDagIYearMonth,
    hentSisteDagIYearMonth,
    kalenderDatoTilDate,
} from '../utils/kalender';

export interface ITidslinjeVindu {
    id: number;
    label: string;
    måneder: number;
}

export enum TidslinjeVindu {
    HALVT_ÅR,
    ETT_ÅR,
    TRE_ÅR,
}

export enum NavigeringsRetning {
    VENSTRE = 'VENSTRE',
    HØYRE = 'HØYRE',
}

const [TidslinjeProvider, useTidslinje] = createUseContext(() => {
    const tidslinjeVinduer: ITidslinjeVindu[] = [
        { id: TidslinjeVindu.HALVT_ÅR, label: '6 mnd', måneder: 6 },
        { id: TidslinjeVindu.ETT_ÅR, label: '1 år', måneder: 12 },
        { id: TidslinjeVindu.TRE_ÅR, label: '3 år', måneder: 36 },
    ];

    const [aktivEtikett, settAktivEtikett] = useState<Etikett | undefined>(undefined);
    const [initiellAktivEtikettErSatt, setInitiellAktivEtikettErSatt] = useState<boolean>(false);

    const [aktivtTidslinjeVindu, settAktivtTidslinjeVindu] = useState({
        vindu: tidslinjeVinduer[TidslinjeVindu.ETT_ÅR],
        startDato: endOfMonth(subMonths(dagensDato, 11)),
        sluttDato: endOfMonth(addMonths(dagensDato, 1)),
    });

    const genererFormatertÅrstall = () => {
        const startÅr = aktivtTidslinjeVindu.startDato.getFullYear();
        const sluttÅr = aktivtTidslinjeVindu.sluttDato.getFullYear();

        if (startÅr !== sluttÅr) {
            return `${startÅr} - ${sluttÅr}`;
        } else {
            return sluttÅr;
        }
    };

    const naviger = (retning: NavigeringsRetning) => {
        if (retning === NavigeringsRetning.VENSTRE) {
            settAktivtTidslinjeVindu(({ sluttDato, startDato, vindu }) => ({
                ...aktivtTidslinjeVindu,
                startDato: endOfMonth(subMonths(startDato, vindu.måneder)),
                sluttDato: endOfMonth(subMonths(sluttDato, vindu.måneder)),
            }));
        } else {
            settAktivtTidslinjeVindu(({ sluttDato, startDato, vindu }) => ({
                ...aktivtTidslinjeVindu,
                startDato: endOfMonth(subMonths(startDato, vindu.måneder)),
                sluttDato: endOfMonth(subMonths(sluttDato, vindu.måneder)),
            }));
        }
    };

    const endreTidslinjeVindu = (vindu: ITidslinjeVindu) => {
        if (vindu.id === TidslinjeVindu.TRE_ÅR) {
            settAktivEtikett(undefined);
            setInitiellAktivEtikettErSatt(false);
        }

        settAktivtTidslinjeVindu(({ sluttDato }) => ({
            ...aktivtTidslinjeVindu,
            vindu: vindu,
            startDato: endOfMonth(subMonths(sluttDato, vindu.måneder)),
        }));
    };

    const genererRader = (
        personerMedAndelerTilkjentYtelse?: IPersonMedAndelerTilkjentYtelse[]
    ): Periode[][] => {
        return personerMedAndelerTilkjentYtelse
            ? personerMedAndelerTilkjentYtelse.map(
                  (personMedAndelerTilkjentYtelse: IPersonMedAndelerTilkjentYtelse) => {
                      return personMedAndelerTilkjentYtelse.ytelsePerioder.reduce(
                          (acc: Periode[], ytelsePeriode: IYtelsePeriode) => {
                              const fom = kalenderDatoTilDate(
                                  hentFørsteDagIYearMonth(ytelsePeriode.stønadFom)
                              );
                              const periode: Periode = {
                                  fom,
                                  tom: kalenderDatoTilDate(
                                      hentSisteDagIYearMonth(ytelsePeriode.stønadTom)
                                  ),
                                  id: `${
                                      personMedAndelerTilkjentYtelse.personIdent
                                  }_${fom.getMonth()}_${fom.getDay()}`,
                                  status: ytelsePeriode.skalUtbetales ? 'suksess' : 'feil',
                              };
                              return [...acc, periode];
                          },
                          []
                      );
                  }
              )
            : [];
    };

    const filterOgSorterGrunnlagPersonerMedAndeler = (
        personer: IGrunnlagPerson[],
        personerMedAndelerTilkjentYtelse: IPersonMedAndelerTilkjentYtelse[]
    ): IGrunnlagPerson[] => {
        personer.sort(sorterPersonTypeOgFødselsdato);
        return personer.filter(
            grunnlagPerson =>
                personerMedAndelerTilkjentYtelse.length &&
                personerMedAndelerTilkjentYtelse.some(
                    personMedAndel => personMedAndel.personIdent === grunnlagPerson.personIdent
                )
        );
    };

    const filterOgSorterAndelPersonerIGrunnlag = (
        personer: IGrunnlagPerson[],
        personerMedAndelerTilkjentYtelse: IPersonMedAndelerTilkjentYtelse[]
    ): IPersonMedAndelerTilkjentYtelse[] => {
        return personer
            .sort(sorterPersonTypeOgFødselsdato)
            .map((person: IGrunnlagPerson) => {
                return personerMedAndelerTilkjentYtelse.find(
                    (personMedAndelerTilkjentYtelse: IPersonMedAndelerTilkjentYtelse) =>
                        person.personIdent === personMedAndelerTilkjentYtelse.personIdent
                );
            })
            .reduce((acc: IPersonMedAndelerTilkjentYtelse[], andelTilkjentYtelse) => {
                if (andelTilkjentYtelse) {
                    return [...acc, andelTilkjentYtelse];
                }
                return acc;
            }, []);
    };

    return {
        aktivEtikett,
        settAktivEtikett,
        genererFormatertÅrstall,
        tidslinjeVinduer,
        aktivtTidslinjeVindu,
        naviger,
        endreTidslinjeVindu,
        genererRader,
        initiellAktivEtikettErSatt,
        setInitiellAktivEtikettErSatt,
        filterOgSorterGrunnlagPersonerMedAndeler,
        filterOgSorterAndelPersonerIGrunnlag,
    };
});

export { TidslinjeProvider, useTidslinje };

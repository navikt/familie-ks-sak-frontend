import { kjønnType } from '@navikt/familie-typer';

import { type IPersonMedAndelerTilkjentYtelse, YtelseType } from '@typer/beregning';
import {
    Adressebeskyttelsegradering,
    ForelderBarnRelasjonRolle,
    type IForelderBarnRelasjon,
    type IGrunnlagPerson,
    type IPersonInfo,
    PersonType,
} from '@typer/person';
import { Målform } from '@typer/søknad';

export function lagPerson(person: Partial<IPersonInfo> = {}): IPersonInfo {
    return {
        kommunenummer: '0001',
        adressebeskyttelseGradering: Adressebeskyttelsegradering.UGRADERT,
        harTilgang: true,
        forelderBarnRelasjon: [],
        forelderBarnRelasjonMaskert: [],
        fødselsdato: '1995-01-01',
        kjønn: kjønnType.MANN,
        navn: 'Test Testersen',
        personIdent: '12345678903',
        type: PersonType.SØKER,
        dødsfallDato: undefined,
        bostedsadresse: undefined,
        erEgenAnsatt: false,
        harFalskIdentitet: false,
        ...person,
    };
}

export function lagForelderBarnRelasjon(relasjon: Partial<IForelderBarnRelasjon> = {}): IForelderBarnRelasjon {
    return {
        adressebeskyttelseGradering: Adressebeskyttelsegradering.UGRADERT,
        fødselsdato: '2024-02-10',
        navn: 'Barn Testersen',
        personIdent: '10022412345',
        relasjonRolle: ForelderBarnRelasjonRolle.BARN,
        ...relasjon,
    };
}

export function lagGrunnlagPerson(person: Partial<IGrunnlagPerson> = {}): IGrunnlagPerson {
    return {
        fødselsdato: '1995-01-01',
        kjønn: kjønnType.MANN,
        navn: 'Test Testersen',
        personIdent: '12345678903',
        type: PersonType.SØKER,
        målform: Målform.NB,
        ...person,
    };
}

export function lagPersonMedAndelerTilkjentYtelse(
    person: Partial<IPersonMedAndelerTilkjentYtelse> = {}
): IPersonMedAndelerTilkjentYtelse {
    return {
        personIdent: '10022412345',
        beløp: 7500,
        stønadFom: '2025-03',
        stønadTom: '2025-09',
        ytelsePerioder: [
            {
                beløp: 7500,
                stønadFom: '2025-03',
                stønadTom: '2025-09',
                ytelseType: YtelseType.ORDINÆR_KONTANTSTØTTE,
                skalUtbetales: true,
            },
        ],
        ...person,
    };
}

export * as PersonTestdata from './personTestdata';

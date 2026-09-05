import { kjønnType } from '@navikt/familie-typer';

import { Adressebeskyttelsegradering, type IGrunnlagPerson, type IPersonInfo, PersonType } from '../../typer/person';
import { Målform } from '../../typer/søknad';

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

export * as PersonTestdata from './personTestdata';

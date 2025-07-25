import { differenceInMilliseconds, isBefore } from 'date-fns';

import { hentDagensDato, isoStringTilDate } from './dato';
import type { IGrunnlagPerson, IPersonInfo } from '../typer/person';
import { PersonType } from '../typer/person';
import type { IBarnMedOpplysninger } from '../typer/søknad';
import type { IUtbetalingsperiodeDetalj } from '../typer/vedtaksperiode';

const millisekunderIEttÅr = 3.15576e10;

export const hentAlder = (fødselsdato: string): number => {
    return fødselsdato !== ''
        ? Math.floor(
              differenceInMilliseconds(hentDagensDato(), isoStringTilDate(fødselsdato)) /
                  millisekunderIEttÅr
          )
        : 0;
};

export const hentAlderSomString = (fødselsdato: string | undefined) => {
    return fødselsdato ? hentAlder(fødselsdato) + ' år' : 'Alder ukjent';
};

export const formaterBeløp = (beløp: number): string => {
    return `${beløp.toLocaleString('no-NO')} kr`;
};

export const summer = (beløp: number[]): number => beløp.reduce((acc, b) => acc + b, 0);

export const kunSiffer = (value: string) => /^\d+$/.test(value);

const erPersonId = (personIdent: string | undefined) => {
    if (!personIdent) {
        return false;
    }

    const id = personIdent.split(' ').join('');
    return /^[+-]?\d+(\.\d+)?$/.test(id) && id.length === 11;
};

const erOrgNr = (orgNr: string) => {
    // Sjekker kun etter ni siffer, validerer ikke kontrollsifferet (det 9. sifferet)
    return kunSiffer(orgNr) && orgNr.length === 9;
};

export const formaterIdent = (personIdent: string | undefined, ukjentTekst = 'Ukjent id') => {
    if (personIdent === '' || personIdent === undefined) {
        return ukjentTekst;
    }

    return erPersonId(personIdent)
        ? `${personIdent.slice(0, 6)} ${personIdent.slice(6, personIdent.length)}`
        : erOrgNr(personIdent)
          ? `${personIdent.slice(0, 3)} ${personIdent.slice(3, 6)} ${personIdent.slice(6, 9)}`
          : ukjentTekst;
};

export const formaterIdenter = (personIdenter: string[]) =>
    personIdenter.map(ident => formaterIdent(ident)).join(', ');

export const lagPersonLabel = (ident: string, personer: IGrunnlagPerson[]): string => {
    const person = personer.find(person => person.personIdent === ident);
    if (person) {
        return `${person.navn} (${hentAlder(person.fødselsdato)} år) ${formaterIdent(
            person.personIdent
        )}`;
    } else {
        return ident;
    }
};

export const lagBarnLabel = (barn: IBarnMedOpplysninger): string => {
    return `${barn.navn ?? 'Navn ukjent'} (${hentAlderSomString(
        barn.fødselsdato
    )}) | ${formaterIdent(barn.ident)}`;
};

export const sorterPåDato = (datoStringA: string, datoStringB: string) => {
    const datoA = new Date(datoStringA);
    const datoB = new Date(datoStringB);

    return isBefore(datoA, datoB) ? 1 : -1;
};

export const sorterPersonTypeOgFødselsdato = (
    personA: IGrunnlagPerson,
    personB: IGrunnlagPerson
) => {
    if (personA.type === PersonType.SØKER) return -1;
    else if (personB.type === PersonType.SØKER) return 1;
    else return sorterPåDato(personA.fødselsdato, personB.fødselsdato);
};

export const sorterUtbetaling = (
    utbetalingsperiodeDetaljA: IUtbetalingsperiodeDetalj,
    utbetalingsperiodeDetaljB: IUtbetalingsperiodeDetalj
) => {
    return sorterPåDato(
        utbetalingsperiodeDetaljA.person.fødselsdato,
        utbetalingsperiodeDetaljB.person.fødselsdato
    );
};

export const slåSammenListeTilStreng = (liste: string[]) => {
    return liste.join(', ').replace(new RegExp('(.*),'), '$1 og');
};

export const lagBrukerLabel = (bruker: IPersonInfo): string =>
    `${bruker.navn} (${hentAlder(bruker.fødselsdato)} år) ${formaterIdent(bruker.personIdent)}`;

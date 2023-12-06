import { isValid, parseISO } from 'date-fns';

import type { DagMånedÅr, FamilieIsoDate } from './typer';

export const erIsoStringGyldig = (familieIsoDato?: FamilieIsoDate): boolean => {
    if (!familieIsoDato) return false;
    else if (!familieIsoDato.includes('-')) return false;

    const dato = parseISO(familieIsoDato);

    const år: number = dato.getFullYear();

    if (år < 1800 || år > 2500) {
        return false;
    }

    return isValid(dato);
};

export const parseIso8601String = (familieIsoDato: FamilieIsoDate): DagMånedÅr => {
    const dato = parseISO(familieIsoDato);

    if (!isValid(dato)) {
        throw new Error(`Dato '${familieIsoDato}' er ugyldig`);
    }

    const år: number = dato.getFullYear();

    if (år < 1000 || år > 3000) {
        throw new Error(`År fra dato '${familieIsoDato}' er '${år}' og er sannsynligvis feil`);
    }

    return {
        dag: dato.getDate(),
        måned: dato.getMonth(),
        år,
    };
};

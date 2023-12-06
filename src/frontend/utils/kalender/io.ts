import { isValid, parseISO } from 'date-fns';

import type { FamilieIsoDate } from './typer';

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

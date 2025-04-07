import type { FeltState } from '@navikt/familie-skjema';
import { feil, ok } from '@navikt/familie-skjema';

import { erPositivtHeltall } from '../../../../../../utils/validators';

export const validerFeilutbetaltBeløp = (felt: FeltState<string>) => {
    if (felt.verdi === '') {
        return feil(felt, 'Beløp er påkrevd');
    } else if (!erPositivtHeltall(felt.verdi)) {
        return feil(felt, 'Feil format. Skriv inn et gyldig siffer.');
    }
    return ok(felt);
};

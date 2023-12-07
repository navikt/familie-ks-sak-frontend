import type { Avhengigheter, FeltState } from '@navikt/familie-skjema';
import { ok } from '@navikt/familie-skjema';

import { Resultat, VilkårType } from '../../../../../../typer/vilkår';
import type { IPeriode } from '../../../../../../utils/kalender';
import { erPeriodeGyldig as erPeriodeGyldigDefault } from '../../../../../../utils/validators';

export const erPeriodeGyldig = (
    felt: FeltState<IPeriode>,
    avhengigheter?: Avhengigheter
): FeltState<IPeriode> => {
    if (avhengigheter && avhengigheter.resultat.verdi === Resultat.IKKE_AKTUELT) {
        return ok(felt);
    }
    return erPeriodeGyldigDefault(felt, VilkårType.MEDLEMSKAP_ANNEN_FORELDER, avhengigheter);
};

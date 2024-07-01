import type { Avhengigheter, FeltState } from '@navikt/familie-skjema';
import { ok } from '@navikt/familie-skjema';

import { Resultat, VilkårType } from '../../../../../../typer/vilkår';
import type { IIsoDatoPeriode } from '../../../../../../utils/dato';
import { erPeriodeGyldig as erPeriodeGyldigDefault } from '../../../../../../utils/validators';

export const erPeriodeGyldig = (
    felt: FeltState<IIsoDatoPeriode>,
    erLovendringTogglePå: boolean,
    avhengigheter?: Avhengigheter
): FeltState<IIsoDatoPeriode> => {
    if (avhengigheter && avhengigheter.resultat.verdi === Resultat.IKKE_AKTUELT) {
        return ok(felt);
    }
    return erPeriodeGyldigDefault(
        felt,
        VilkårType.MEDLEMSKAP_ANNEN_FORELDER,
        erLovendringTogglePå,
        avhengigheter
    );
};

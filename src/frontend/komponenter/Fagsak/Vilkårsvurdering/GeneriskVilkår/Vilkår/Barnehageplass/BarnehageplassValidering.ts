import type { Avhengigheter, FeltState } from '@navikt/familie-skjema';
import { feil, ok } from '@navikt/familie-skjema';

import { Resultat } from '../../../../../../typer/vilkår';
import { tellAntallDesimaler } from '../../../../../../utils/eøsValidators';

export const erAntallTimerGyldig = (
    felt: FeltState<string>,
    avhengigheter?: Avhengigheter
): FeltState<string> => {
    if (felt.verdi !== '') {
        const antallTimer = Number(felt.verdi);
        if (antallTimer <= 0) {
            return feil(felt, 'Antall timer med barnehageplass må være større enn 0');
        }
        if (antallTimer > 122) {
            return feil(felt, 'Antall timer med barnehageplass kan ikke overstige 122');
        }
        if (tellAntallDesimaler(felt.verdi) > 2) {
            return feil(
                felt,
                'Antall timer med barnehageplass kan maksimalt oppgis med 2 desimaler'
            );
        }
        return ok(felt);
    }
    console.log(avhengigheter?.utdypendeVilkårsvurdering);
    if (
        avhengigheter?.resultat !== Resultat.OPPFYLT &&
        avhengigheter?.utdypendeVilkårsvurdering.length <= 0
    ) {
        return feil(felt, 'Antall timer med barnehageplass må fylles ut');
    }
    return ok(felt);
};

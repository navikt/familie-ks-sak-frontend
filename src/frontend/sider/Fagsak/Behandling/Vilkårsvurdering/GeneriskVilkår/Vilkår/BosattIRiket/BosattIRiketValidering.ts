import type { Avhengigheter, FeltState } from '@navikt/familie-skjema';
import { feil, ok } from '@navikt/familie-skjema';

import { bestemMuligeUtdypendeVilkårsvurderingerIBosattIRiketVilkår } from './BosattIRiketContext';
import type { UtdypendeVilkårsvurdering } from '../../../../../../../typer/vilkår';
import { Regelverk } from '../../../../../../../typer/vilkår';

export const erUtdypendeVilkårsvurderingerGyldig = (
    felt: FeltState<UtdypendeVilkårsvurdering[]>,
    avhengigheter?: Avhengigheter
): FeltState<UtdypendeVilkårsvurdering[]> => {
    if (!avhengigheter) {
        return feil(felt, 'Utdypende vilkårsvurdering er ugyldig');
    }

    const muligeUtdypendeVilkårsvurderinger =
        bestemMuligeUtdypendeVilkårsvurderingerIBosattIRiketVilkår(
            avhengigheter.vurderesEtter,
            avhengigheter.person
        );

    if (muligeUtdypendeVilkårsvurderinger.length === 0) {
        return ok(felt);
    }
    if (!felt.verdi.every(item => muligeUtdypendeVilkårsvurderinger.includes(item))) {
        return feil(felt, 'Du har valgt en ugyldig kombinasjon');
    }

    if (avhengigheter.vurderesEtter === Regelverk.EØS_FORORDNINGEN) {
        if (felt.verdi.length === 0) {
            return feil(felt, 'Du må velge ett alternativ');
        }
        if (felt.verdi.length > 1) {
            return feil(felt, 'Du kan kun velge ett alternativ');
        }
    }

    return ok(felt);
};

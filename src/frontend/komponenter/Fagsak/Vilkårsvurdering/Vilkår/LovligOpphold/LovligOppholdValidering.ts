import type { Avhengigheter, FeltState } from '@navikt/familie-skjema';
import { feil, ok } from '@navikt/familie-skjema';

import type { UtdypendeVilkårsvurdering } from '../../../../../typer/vilkår';
import { Regelverk, UtdypendeVilkårsvurderingGenerell } from '../../../../../typer/vilkår';

export const bestemMuligeUtdypendeVilkårsvurderinger = (vurderesEtter: Regelverk) => {
    if (vurderesEtter === Regelverk.EØS_FORORDNINGEN) {
        return [];
    }
    return [UtdypendeVilkårsvurderingGenerell.VURDERING_ANNET_GRUNNLAG];
};

export const erUtdypendeVilkårsvurderingerGyldig = (
    felt: FeltState<UtdypendeVilkårsvurdering[]>,
    avhengigheter?: Avhengigheter
): FeltState<UtdypendeVilkårsvurdering[]> => {
    if (!avhengigheter) {
        return feil(felt, 'Utdypende vilkårsvurdering er ugyldig');
    }
    const muligeUtdypendeVilkårsvurderinger: UtdypendeVilkårsvurdering[] =
        bestemMuligeUtdypendeVilkårsvurderinger(avhengigheter.vurderesEtter);

    if (muligeUtdypendeVilkårsvurderinger.length === 0) {
        return ok(felt);
    }

    if (!felt.verdi.every(item => muligeUtdypendeVilkårsvurderinger.includes(item))) {
        return feil(felt, 'Du har valgt en ugyldig kombinasjon');
    }

    return ok(felt);
};

export const erBegrunnelseGyldig = (
    felt: FeltState<string>,
    avhengigheter?: Avhengigheter
): FeltState<string> => {
    if (!avhengigheter) {
        return feil(felt, 'Begrunnelse er ugyldig');
    }

    const begrunnelseOppgitt = felt.verdi.length > 0;

    if (avhengigheter.vurderesEtter === Regelverk.EØS_FORORDNINGEN) {
        return ok(felt);
    } else {
        if (begrunnelseOppgitt || avhengigheter?.utdypendeVilkårsvurdering.length === 0) {
            return ok(felt);
        }
        return feil(
            felt,
            'Du har gjort ett eller flere valg under "Utdypende vilkårsvurdering" og må derfor fylle inn en begrunnelse'
        );
    }
};

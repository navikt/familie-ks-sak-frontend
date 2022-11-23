import type { Avhengigheter, FeltState } from '@navikt/familie-skjema';
import { feil, ok } from '@navikt/familie-skjema';

import type { UtdypendeVilkårsvurdering } from '../../../../../../typer/vilkår';
import { Regelverk } from '../../../../../../typer/vilkår';
import { muligeUtdypendeVilkårsvurderinger } from './BarnetsAlderContext';

export const erUtdypendeVilkårsvurderingerGyldig = (
    felt: FeltState<UtdypendeVilkårsvurdering[]>
): FeltState<UtdypendeVilkårsvurdering[]> => {
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

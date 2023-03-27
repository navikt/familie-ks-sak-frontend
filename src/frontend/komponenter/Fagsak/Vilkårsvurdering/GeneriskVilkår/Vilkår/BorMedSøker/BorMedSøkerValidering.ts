import type { Avhengigheter, FeltState } from '@navikt/familie-skjema';
import { feil, ok } from '@navikt/familie-skjema';

import { bestemMuligeUtdypendeVilkårsvurderingerIBorMedSøkerVilkår } from './BorMedSøkerContext';
import type { UtdypendeVilkårsvurdering } from '../../../../../../typer/vilkår';
import { Regelverk } from '../../../../../../typer/vilkår';
import { erBegrunnelsePåkrevd } from '../../VilkårSkjema';

export const erUtdypendeVilkårsvurderingerGyldig = (
    felt: FeltState<UtdypendeVilkårsvurdering[]>,
    avhengigheter?: Avhengigheter
): FeltState<UtdypendeVilkårsvurdering[]> => {
    if (!avhengigheter || !avhengigheter?.vurderesEtter) {
        return feil(felt, 'Utdypende vilkårsvurdering er ugyldig');
    }

    const muligeUtdypendeVilkårsvurderinger =
        bestemMuligeUtdypendeVilkårsvurderingerIBorMedSøkerVilkår(avhengigheter.vurderesEtter);

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

export const erBegrunnelseGyldig = (
    felt: FeltState<string>,
    avhengigheter?: Avhengigheter
): FeltState<string> => {
    if (!avhengigheter) {
        return feil(felt, 'Begrunnelse er ugyldig');
    }

    const begrunnelseOppgitt = felt.verdi.length > 0;

    if (
        erBegrunnelsePåkrevd(
            avhengigheter.vurderesEtter,
            avhengigheter.utdypendeVilkårsvurderinger,
            avhengigheter.personType,
            avhengigheter.vilkårType
        )
    ) {
        return begrunnelseOppgitt ? ok(felt) : feil(felt, 'Du må fylle inn en begrunnelse');
    } else {
        if (begrunnelseOppgitt || avhengigheter?.utdypendeVilkårsvurderinger.length === 0) {
            return ok(felt);
        }
        return feil(
            felt,
            'Du har gjort ett eller flere valg under "Utdypende vilkårsvurdering" og må derfor fylle inn en begrunnelse'
        );
    }
};

import type { Avhengigheter, FeltState } from '@navikt/familie-skjema';
import { feil, ok } from '@navikt/familie-skjema';

export const erBegrunnelseGyldig = (
    felt: FeltState<string>,
    avhengigheter?: Avhengigheter
): FeltState<string> => {
    if (!avhengigheter) {
        return feil(felt, 'Begrunnelse er ugyldig');
    }

    const begrunnelseOppgitt = felt.verdi.length > 0;

    return begrunnelseOppgitt ? ok(felt) : feil(felt, 'Du må fylle inn en begrunnelse');
};

import type { Felt } from '@navikt/familie-skjema';
import type { Avhengigheter, FeltState } from '@navikt/familie-skjema';
import { feil, ok, Valideringsstatus } from '@navikt/familie-skjema';

import type { KompetanseResultat } from '../../../../../../../typer/eøsPerioder';
import {
    AnnenForelderAktivitet,
    SøkersAktivitet,
    type KompetanseAktivitet,
} from '../../../../../../../typer/eøsPerioder';
import { isEmpty } from '../../../../../../../utils/eøsValidators';

const ikkeUtfyltFelt = 'Feltet er påkrevd, men mangler input';

const erSøkersAktivitetGyldig = (
    felt: FeltState<KompetanseAktivitet | undefined>
): FeltState<KompetanseAktivitet | undefined> =>
    !isEmpty(felt.verdi) ? ok(felt) : feil(felt, ikkeUtfyltFelt);
const erAnnenForeldersAktivitetGyldig = (
    felt: FeltState<KompetanseAktivitet | undefined>
): FeltState<KompetanseAktivitet | undefined> =>
    !isEmpty(felt.verdi) ? ok(felt) : feil(felt, ikkeUtfyltFelt);
const erAnnenForeldersAktivitetslandGyldig = (
    felt: FeltState<string | undefined>,
    avhengigheter?: Avhengigheter
): FeltState<string | undefined> => {
    const annenForeldersAktivitet =
        avhengigheter?.annenForeldersAktivitet as Felt<KompetanseAktivitet>;
    if (
        annenForeldersAktivitet?.valideringsstatus === Valideringsstatus.IKKE_VALIDERT ||
        annenForeldersAktivitet?.verdi === AnnenForelderAktivitet.IKKE_AKTUELT ||
        annenForeldersAktivitet?.verdi === AnnenForelderAktivitet.INAKTIV
    ) {
        return ok(felt);
    }
    return !isEmpty(felt.verdi) ? ok(felt) : feil(felt, ikkeUtfyltFelt);
};
const erSøkersAktivitetslandGyldig = (
    felt: FeltState<string | undefined>,
    avhengigheter?: Avhengigheter
): FeltState<string | undefined> => {
    const søkersAktivitet = avhengigheter?.søkersAktivitet as Felt<KompetanseAktivitet>;
    if (
        søkersAktivitet?.valideringsstatus === Valideringsstatus.IKKE_VALIDERT ||
        søkersAktivitet?.verdi === SøkersAktivitet.INAKTIV
    ) {
        return ok(felt);
    }
    return !isEmpty(felt.verdi) ? ok(felt) : feil(felt, ikkeUtfyltFelt);
};
const erBarnetsBostedslandGyldig = (
    felt: FeltState<string | undefined>
): FeltState<string | undefined> => (!isEmpty(felt.verdi) ? ok(felt) : feil(felt, ikkeUtfyltFelt));
const erKompetanseResultatGyldig = (
    felt: FeltState<KompetanseResultat | undefined>
): FeltState<KompetanseResultat | undefined> =>
    !isEmpty(felt.verdi) ? ok(felt) : feil(felt, ikkeUtfyltFelt);

export {
    erSøkersAktivitetGyldig,
    erSøkersAktivitetslandGyldig,
    erAnnenForeldersAktivitetGyldig,
    erAnnenForeldersAktivitetslandGyldig,
    erBarnetsBostedslandGyldig,
    erKompetanseResultatGyldig,
};

import type { FeltState } from '@navikt/familie-skjema';
import { feil, ok } from '@navikt/familie-skjema';

import type { FamilieIsoDate } from '../../../../utils/kalender';
import {
    erFør,
    erIsoStringGyldig,
    kalenderDato,
    kalenderDatoMedFallback,
    sisteDagIInneværendeMåned,
    TIDENES_ENDE,
    TIDENES_MORGEN,
} from '../../../../utils/kalender';
import { erPositivtHeltall } from '../../../../utils/validators';

const datoErFremITid = (dato: FamilieIsoDate): boolean => {
    const nå = sisteDagIInneværendeMåned();

    return erFør(nå, kalenderDato(dato));
};

export const validerFom = (felt: FeltState<FamilieIsoDate>) => {
    const fom = felt.verdi;

    if (fom === '') return feil(felt, 'Du må velge en f.o.m-dato');
    if (!erIsoStringGyldig(fom)) {
        return feil(felt, 'Du må velge en gyldig f.o.m-dato');
    }
    if (datoErFremITid(fom)) {
        return feil(felt, 'F.o.m kan ikke være senere enn inneværende måned');
    }
    return ok(felt);
};

export const validerTom = (felt: FeltState<FamilieIsoDate>, fom: FamilieIsoDate) => {
    const tom = felt.verdi;

    if (tom === '') return feil(felt, 'Du må velge en t.o.m-dato');
    if (!erIsoStringGyldig(tom)) {
        return feil(felt, 'Du må velge en gyldig t.o.m-dato');
    }
    if (datoErFremITid(tom)) {
        return feil(felt, 'T.o.m. kan ikke være senere enn inneværende måned');
    }

    const fomKalenderDato = kalenderDatoMedFallback(fom, TIDENES_MORGEN);
    const tomKalenderDato = kalenderDatoMedFallback(tom, TIDENES_ENDE);
    const fomDatoErFørTomDato = erFør(fomKalenderDato, tomKalenderDato);

    if (!fomDatoErFørTomDato) {
        return feil(felt, 'T.o.m. må være senere enn f.o.m');
    }

    return ok(felt);
};

export const validerFeilutbetaltBeløp = (felt: FeltState<string>) => {
    if (felt.verdi === '') {
        return feil(felt, 'Beløp er påkrevd');
    } else if (!erPositivtHeltall(felt.verdi)) {
        return feil(felt, 'Feil format. Skriv inn et gyldig siffer.');
    }
    return ok(felt);
};

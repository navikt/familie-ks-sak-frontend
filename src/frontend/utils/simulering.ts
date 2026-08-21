import { addMonths, differenceInCalendarMonths, isAfter, isSameDay } from 'date-fns';

import { dateTilIsoDatoString, isoStringTilDate, isoStringTilDateMedFallback, tidenesMorgen } from './dato';
import type { ISimuleringDTO, ISimuleringPeriode } from '../typer/simulering';

export const hentPeriodelisteMedTommePerioder = (perioder: ISimuleringPeriode[]): ISimuleringPeriode[] => {
    const fomDatoerISimulering = hentSorterteFomdatoer(perioder);
    const førstePeriodeFom = fomDatoerISimulering[0];
    const antallMånederISimulering = hentAntallMånederISimuleringen(fomDatoerISimulering);

    const periodelisteMedTommePerioder = [...perioder];

    for (let i = 0; i < antallMånederISimulering; i++) {
        const aktuellPeriodeFom = addMonths(førstePeriodeFom, i);

        if (!fomDatoerISimulering.some(date => isSameDay(date, aktuellPeriodeFom))) {
            periodelisteMedTommePerioder.push({
                fom: dateTilIsoDatoString(aktuellPeriodeFom),
                tom: '',
            });
        }
    }

    periodelisteMedTommePerioder.sort((a, b) => (isAfter(isoStringTilDate(a.fom), isoStringTilDate(b.fom)) ? 1 : -1));
    return periodelisteMedTommePerioder;
};

export const hentÅrISimuleringen = (perioder: ISimuleringPeriode[]): number[] =>
    [...new Set(perioder.map(periode => isoStringTilDate(periode.fom).getFullYear()))].sort();

const hentSorterteFomdatoer = (perioder: ISimuleringPeriode[]): Date[] =>
    perioder.map(periode => isoStringTilDate(periode.fom)).sort((a, b) => (isAfter(a, b) ? 1 : -1));

const hentAntallMånederISimuleringen = (fomListe: Date[]): number => {
    const førstePeriodeFom = fomListe[0];
    const sistePeriodeFom = fomListe[fomListe.length - 1];

    return differenceInCalendarMonths(sistePeriodeFom, førstePeriodeFom) + 1;
};

export const settPerioderTilIkkeUtbetaltOmForfallsdatoIkkePassert = (simulering: ISimuleringDTO): ISimuleringDTO => ({
    ...simulering,
    perioder: simulering.perioder.map(periode =>
        settPeriodeTilIkkeUtbetaltOmForfallsdatoIkkePassert(periode, simulering.tidSimuleringHentet)
    ),
});

const settPeriodeTilIkkeUtbetaltOmForfallsdatoIkkePassert = (
    periode: ISimuleringPeriode,
    tidSimuleringHentet: string | undefined
): ISimuleringPeriode => {
    const forfallsdatoErEtterTidSimuleringHentet = isAfter(
        isoStringTilDateMedFallback({ isoString: periode.forfallsdato, fallbackDate: tidenesMorgen }),
        isoStringTilDateMedFallback({ isoString: tidSimuleringHentet, fallbackDate: tidenesMorgen })
    );

    if (periode.resultat === 0 && forfallsdatoErEtterTidSimuleringHentet) {
        return { ...periode, tidligereUtbetalt: 0, resultat: periode.nyttBeløp };
    }

    return periode;
};

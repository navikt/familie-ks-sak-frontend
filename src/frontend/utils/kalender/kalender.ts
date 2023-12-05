import { parseIso8601String } from './io';
import type { DagMånedÅr, FamilieIsoDate } from './typer';

export const TIDENES_MORGEN: DagMånedÅr = {
    dag: 1,
    måned: 1,
    år: 1000,
};
export const TIDENES_ENDE: DagMånedÅr = {
    dag: 1,
    måned: 1,
    år: 3000,
};

export const kalenderDato = (dato: FamilieIsoDate): DagMånedÅr => parseIso8601String(dato);

export const kalenderDatoMedFallback = (
    dato: FamilieIsoDate | undefined,
    fallbackDato: DagMånedÅr
): DagMånedÅr => (dato ? parseIso8601String(dato) : fallbackDato);

export const kalenderDatoFraDate = (date: Date): DagMånedÅr => ({
    dag: date.getDate(),
    måned: date.getMonth(),
    år: date.getFullYear(),
});

export const kalenderDatoTilDate = (
    dagMånedÅr: DagMånedÅr,
    timer?: number,
    minutter?: number
): Date =>
    new Date(
        dagMånedÅr.år,
        dagMånedÅr.måned,
        dagMånedÅr.dag,
        timer ? timer : 0,
        minutter ? minutter : 0
    );

export const iDag = (): DagMånedÅr => kalenderDatoFraDate(new Date());

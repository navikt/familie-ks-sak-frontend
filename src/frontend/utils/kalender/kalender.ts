import { parseIso8601String } from './io';
import type { DagMånedÅr, FamilieIsoDate } from './typer';

export const kalenderDato = (dato: FamilieIsoDate): DagMånedÅr => parseIso8601String(dato);

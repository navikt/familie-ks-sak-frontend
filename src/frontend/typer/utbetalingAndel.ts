import type { OptionType } from './common';
import type { Begrunnelse } from './vedtak';
import type { IsoDatoString, IsoMånedString } from '../utils/dato';

export interface IRestEndretUtbetalingAndel {
    id?: number;
    personIdent?: string;
    prosent?: number;
    fom?: IsoMånedString;
    tom?: IsoMånedString;
    begrunnelse?: string;
    søknadstidspunkt?: IsoDatoString;
    avtaletidspunktDeltBosted?: IsoDatoString;
    årsak?: IEndretUtbetalingAndelÅrsak;
    erTilknyttetAndeler?: boolean;
    erEksplisittAvslagPåSøknad?: boolean;
    vedtaksbegrunnelser?: Begrunnelse[];
}

export enum IEndretUtbetalingAndelÅrsak {
    ALLEREDE_UTBETALT = 'ALLEREDE_UTBETALT',
    ETTERBETALING_3MND = 'ETTERBETALING_3MND',
    FULLTIDSPLASS_I_BARNEHAGE_AUGUST_2024 = 'FULLTIDSPLASS_I_BARNEHAGE_AUGUST_2024',
}

export const årsakTekst: { [key in IEndretUtbetalingAndelÅrsak]: string } = {
    ALLEREDE_UTBETALT: 'Allerede utbetalt',
    ETTERBETALING_3MND: 'Etterbetaling 3 måned',
    FULLTIDSPLASS_I_BARNEHAGE_AUGUST_2024: 'Fulltidsplass i barnehage august 2024',
};

export const årsaker: IEndretUtbetalingAndelÅrsak[] = Object.keys(IEndretUtbetalingAndelÅrsak).map(
    k => k as IEndretUtbetalingAndelÅrsak
);

export const AVSLAG_ALLEREDE_UTBETALT_SØKER =
    'NasjonalEllerFellesBegrunnelse$AVSLAG_ENDRINGSPERIODE_ALLEREDE_UTBETALT_SØKER';

export const AVSLAG_ALLEREDE_UTBETALT_ANNEN_FORELDER =
    'NasjonalEllerFellesBegrunnelse$AVSLAG_ENDRINGSPERIODE_ALLEREDE_UTBETALT_ANNEN_FORELDER';

export enum IEndretUtbetalingAndelFullSats {
    FULL_SATS = 'FULL_SATS',
}

interface SatsOption extends OptionType {
    fullSats: boolean;
}

export const satsTilOption = (fullSats: boolean): SatsOption => ({
    value: fullSats ? '100' : '50',
    label: fullSats ? 'Full' : 'Delt',
    fullSats: fullSats,
});

export const optionTilsats = (satsLabel: string): boolean => {
    return satsLabel === IEndretUtbetalingAndelFullSats.FULL_SATS.valueOf();
};

export const satser: IEndretUtbetalingAndelFullSats[] = Object.keys(
    IEndretUtbetalingAndelFullSats
).map(k => k as IEndretUtbetalingAndelFullSats);

import type { IBehandling } from '@typer/behandling';
import type { IEndretUtbetalingAndelÅrsak, IRestEndretUtbetalingAndel } from '@typer/utbetalingAndel';
import type { Begrunnelse } from '@typer/vedtak';
import {
    dateTilIsoDatoStringEllerUndefined,
    type IsoDatoString,
    type IsoMånedString,
    isoStringTilDateEllerUndefinedHvisUgyldigDato,
} from '@utils/dato';

export enum EndretUtbetalingAndelFeltnavn {
    PERSONER = 'personer',
    FOM = 'fom',
    TOM = 'tom',
    ÅRSAK = 'årsak',
    PERIODE_SKAL_UTBETALES = 'periodeSkalUtbetales',
    ER_EKSPLISITT_AVSLAG = 'erEksplisittAvslagPåSøknad',
    VEDTAKSBEGRUNNELSER = 'vedtaksbegrunnelser',
    SØKNADSTIDSPUNKT = 'søknadstidspunkt',
    BEGRUNNELSE = 'begrunnelse',
}

export interface EndretUtbetalingAndelFormValues {
    [EndretUtbetalingAndelFeltnavn.PERSONER]: string[];
    [EndretUtbetalingAndelFeltnavn.FOM]: IsoMånedString | null;
    [EndretUtbetalingAndelFeltnavn.TOM]: IsoMånedString | null;
    [EndretUtbetalingAndelFeltnavn.ÅRSAK]: IEndretUtbetalingAndelÅrsak | null;
    [EndretUtbetalingAndelFeltnavn.PERIODE_SKAL_UTBETALES]: boolean | null;
    [EndretUtbetalingAndelFeltnavn.ER_EKSPLISITT_AVSLAG]: boolean;
    [EndretUtbetalingAndelFeltnavn.VEDTAKSBEGRUNNELSER]: Begrunnelse[];
    [EndretUtbetalingAndelFeltnavn.SØKNADSTIDSPUNKT]: IsoDatoString | null;
    [EndretUtbetalingAndelFeltnavn.BEGRUNNELSE]: string;
}

export interface StandardFeltProps {
    erLesevisning: boolean;
}

function prosentTilPeriodeSkalUtbetales(prosent: number | undefined): boolean | null {
    if (prosent === undefined || prosent === null) {
        return null;
    }
    return prosent > 0;
}

function hentSøknadstidspunkt(
    endretUtbetalingAndel: IRestEndretUtbetalingAndel,
    behandling: IBehandling
): IsoDatoString | null {
    if (endretUtbetalingAndel.søknadstidspunkt) {
        return endretUtbetalingAndel.søknadstidspunkt;
    }
    const søknadMottattDato = isoStringTilDateEllerUndefinedHvisUgyldigDato(behandling.søknadMottattDato);
    return dateTilIsoDatoStringEllerUndefined(søknadMottattDato) ?? null;
}

export function endretUtbetalingAndelSkjemaStandardverdier(
    endretUtbetalingAndel: IRestEndretUtbetalingAndel,
    behandling: IBehandling
): EndretUtbetalingAndelFormValues {
    return {
        [EndretUtbetalingAndelFeltnavn.PERSONER]: endretUtbetalingAndel.personIdenter ?? [],
        [EndretUtbetalingAndelFeltnavn.FOM]: endretUtbetalingAndel.fom ?? null,
        [EndretUtbetalingAndelFeltnavn.TOM]: endretUtbetalingAndel.tom ?? null,
        [EndretUtbetalingAndelFeltnavn.ÅRSAK]: endretUtbetalingAndel.årsak ?? null,
        [EndretUtbetalingAndelFeltnavn.PERIODE_SKAL_UTBETALES]: prosentTilPeriodeSkalUtbetales(
            endretUtbetalingAndel.prosent
        ),
        [EndretUtbetalingAndelFeltnavn.ER_EKSPLISITT_AVSLAG]: endretUtbetalingAndel.erEksplisittAvslagPåSøknad ?? false,
        [EndretUtbetalingAndelFeltnavn.VEDTAKSBEGRUNNELSER]: endretUtbetalingAndel.vedtaksbegrunnelser ?? [],
        [EndretUtbetalingAndelFeltnavn.SØKNADSTIDSPUNKT]: hentSøknadstidspunkt(endretUtbetalingAndel, behandling),
        [EndretUtbetalingAndelFeltnavn.BEGRUNNELSE]: endretUtbetalingAndel.begrunnelse ?? '',
    };
}

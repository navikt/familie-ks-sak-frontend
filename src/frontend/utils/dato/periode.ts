import type { IsoDatoString, IsoMånedString } from './dato';
import { Datoformat, isoStringTilFormatertString } from './dato';

export interface IIsoDatoPeriode {
    // Format YYYY-MM-DD (ISO)
    fom?: IsoDatoString;
    tom?: IsoDatoString;
}

export interface IIsoMånedPeriode {
    // Format YYYY-MM
    fom?: IsoMånedString;
    tom?: IsoMånedString;
}

export const isoDatoPeriodeTilFormatertString = (periode: IIsoDatoPeriode) => {
    return `${isoStringTilFormatertString({
        isoString: periode.fom,
        tilFormat: Datoformat.DATO,
    })} - ${isoStringTilFormatertString({
        isoString: periode.tom,
        tilFormat: Datoformat.DATO,
    })}`;
};

interface FormaterIsoMånedPeriodeProps {
    periode: IIsoMånedPeriode;
    tilFormat: Datoformat;
}

export const isoMånedPeriodeTilFormatertString = ({
    periode,
    tilFormat,
}: FormaterIsoMånedPeriodeProps) => {
    return `${isoStringTilFormatertString({
        isoString: periode.fom,
        tilFormat: tilFormat,
    })} - ${isoStringTilFormatertString({
        isoString: periode.tom,
        tilFormat: tilFormat,
    })}`;
};

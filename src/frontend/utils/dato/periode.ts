import type { IsoDatoString } from './dato';
import { Datoformat, isoStringTilFormatertString } from './dato';

export interface IIsoDatoPeriode {
    // Format YYYY-MM-DD (ISO)
    fom?: IsoDatoString;
    tom?: IsoDatoString;
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

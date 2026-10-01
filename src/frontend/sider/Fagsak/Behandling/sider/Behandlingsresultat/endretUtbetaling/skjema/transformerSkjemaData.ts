import type { IRestEndretUtbetalingAndel } from '@typer/utbetalingAndel';
import {
    EndretUtbetalingAndelFeltnavn,
    type EndretUtbetalingAndelFormValues,
} from './endretUtbetalingAndelSkjemaTyper';

export function transformerSkjemaData(
    values: EndretUtbetalingAndelFormValues,
    lagretEndretUtbetalingAndel: IRestEndretUtbetalingAndel
): IRestEndretUtbetalingAndel {
    return {
        id: lagretEndretUtbetalingAndel.id,
        personIdenter: values[EndretUtbetalingAndelFeltnavn.PERSONER] ?? [],
        prosent: values[EndretUtbetalingAndelFeltnavn.PERIODE_SKAL_UTBETALES] ? 100 : 0,
        fom: values[EndretUtbetalingAndelFeltnavn.FOM] ?? undefined,
        tom: values[EndretUtbetalingAndelFeltnavn.TOM] ?? undefined,
        årsak: values[EndretUtbetalingAndelFeltnavn.ÅRSAK] ?? undefined,
        søknadstidspunkt: values[EndretUtbetalingAndelFeltnavn.SØKNADSTIDSPUNKT] ?? undefined,
        begrunnelse: values[EndretUtbetalingAndelFeltnavn.BEGRUNNELSE],
        erTilknyttetAndeler: lagretEndretUtbetalingAndel.erTilknyttetAndeler,
        erEksplisittAvslagPåSøknad: values[EndretUtbetalingAndelFeltnavn.ER_EKSPLISITT_AVSLAG],
        vedtaksbegrunnelser: values[EndretUtbetalingAndelFeltnavn.VEDTAKSBEGRUNNELSER],
    };
}

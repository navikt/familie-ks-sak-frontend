import { useOnFormSubmitSuccessful } from '@hooks/useOnFormSubmitSuccessful';
import { useOppdaterEndretUtbetalingAndel } from '@hooks/useOppdaterEndretUtbetalingAndel';
import { byggSuksessRessurs } from '@navikt/familie-typer';
import type { IRestEndretUtbetalingAndel } from '@typer/utbetalingAndel';
import { useForm } from 'react-hook-form';
import { useBehandlingContext } from '../../../../context/BehandlingContext';
import {
    EndretUtbetalingAndelFeltnavn,
    type EndretUtbetalingAndelFormValues,
    endretUtbetalingAndelSkjemaStandardverdier,
} from './endretUtbetalingAndelSkjemaTyper';
import { transformerSkjemaData } from './transformerSkjemaData';

const TOM_FEILMELDING_FRA_BACKEND = 'til og med dato';

export function useEndretUtbetalingAndelSkjema(
    endretUtbetalingAndel: IRestEndretUtbetalingAndel,
    lukkSkjema: () => void
) {
    const { behandling, settÅpenBehandling } = useBehandlingContext();

    const form = useForm<EndretUtbetalingAndelFormValues>({
        values: endretUtbetalingAndelSkjemaStandardverdier(endretUtbetalingAndel, behandling),
    });

    const { control, reset, setError } = form;

    useOnFormSubmitSuccessful(control, reset);

    const { mutateAsync: oppdaterEndretUtbetalingAndel } = useOppdaterEndretUtbetalingAndel({
        behandlingId: behandling.behandlingId,
        endretUtbetalingAndelId: endretUtbetalingAndel.id,
    });

    async function onSubmit(values: EndretUtbetalingAndelFormValues) {
        return oppdaterEndretUtbetalingAndel(transformerSkjemaData(values, endretUtbetalingAndel))
            .then(oppdatertBehandling => {
                lukkSkjema();
                settÅpenBehandling(byggSuksessRessurs(oppdatertBehandling));
            })
            .catch(e => {
                const message = e instanceof Error ? e.message : 'En ukjent feil oppstod.';
                if (message.includes(TOM_FEILMELDING_FRA_BACKEND)) {
                    setError(EndretUtbetalingAndelFeltnavn.TOM, { message });
                } else {
                    setError('root', { message });
                }
            });
    }

    return { form, onSubmit };
}

import { useForm } from 'react-hook-form';

import { byggSuksessRessurs } from '@navikt/familie-typer';

import { useOppdaterEndringstidspunkt } from '../../../../../../hooks/useOppdaterEndringstidspunkt';
import type { IsoDatoString } from '../../../../../../utils/dato';
import { useBehandlingContext } from '../../../context/BehandlingContext';

export interface FormValues {
    [Feltnavn.ENDRINGSTIDSPUNKT]: IsoDatoString | undefined;
}

export interface TransformedFormValues {
    [Feltnavn.ENDRINGSTIDSPUNKT]: IsoDatoString;
}

export enum Feltnavn {
    ENDRINGSTIDSPUNKT = 'endringstidspunkt',
}

interface Props {
    lukkModal: () => void;
}

export function useEndringstidspunktForm({ lukkModal }: Props) {
    const { behandling, settÅpenBehandling } = useBehandlingContext();
    const { mutateAsync: oppdaterEndringstidspunk } = useOppdaterEndringstidspunkt(behandling.behandlingId);

    const form = useForm<FormValues, never, TransformedFormValues>({
        defaultValues: {
            [Feltnavn.ENDRINGSTIDSPUNKT]: undefined,
        },
    });

    const { setError } = form;

    async function onSubmit(formValues: TransformedFormValues) {
        const { endringstidspunkt } = formValues;
        return oppdaterEndringstidspunk({ endringstidspunkt })
            .then(behandling => {
                lukkModal();
                settÅpenBehandling(byggSuksessRessurs(behandling));
            })
            .catch(error => setError('root', { message: error.message ?? 'Ukjent feil' }));
    }

    return { form, onSubmit };
}

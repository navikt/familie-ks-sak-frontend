import { useSettPåVent } from '@hooks/useSettPåVent';
import { useBehandlingContext } from '@sider/Fagsak/Behandling/context/BehandlingContext';
import type { SettPåVentÅrsak } from '@typer/behandling';
import { dateTilIsoDatoString, hentDagensDato, type IsoDatoString } from '@utils/dato';
import { addDays } from 'date-fns';
import { useForm } from 'react-hook-form';

import { byggSuksessRessurs } from '@navikt/familie-typer';

const STANDARD_ANTALL_DAGER_FRIST = 3 * 7;

export const SETT_PÅ_VENT_FORM_ID = 'sett_på_vent_form_id';

export enum SettPåVentFelt {
    FRIST = 'frist',
    ÅRSAK = 'årsak',
}

export interface SettPåVentFormValues {
    [SettPåVentFelt.FRIST]: IsoDatoString | null;
    [SettPåVentFelt.ÅRSAK]: SettPåVentÅrsak | '';
}

type TransformedSettPåVentFormValues = {
    [SettPåVentFelt.FRIST]: IsoDatoString;
    [SettPåVentFelt.ÅRSAK]: SettPåVentÅrsak;
};

interface Props {
    lukkModal: () => void;
}

export function useSettPåVentSkjema({ lukkModal }: Props) {
    const { behandling, settÅpenBehandling } = useBehandlingContext();

    const behandlingPåVent = behandling.behandlingPåVent;
    const erBehandlingAlleredePåVent = !!behandlingPåVent;

    const standardfrist = dateTilIsoDatoString(addDays(hentDagensDato(), STANDARD_ANTALL_DAGER_FRIST));

    const { mutateAsync: settPåVent } = useSettPåVent({
        onSuccess: behandling => {
            settÅpenBehandling(byggSuksessRessurs(behandling));
            lukkModal();
        },
        onError: error => {
            setError('root', { message: error.message ?? 'Teknisk feil ved lagring av sett på vent.' });
        },
    });

    const form = useForm<SettPåVentFormValues, unknown, TransformedSettPåVentFormValues>({
        values: {
            [SettPåVentFelt.FRIST]: behandlingPåVent?.frist ?? standardfrist,
            [SettPåVentFelt.ÅRSAK]: behandlingPåVent?.årsak ?? '',
        },
    });

    const { setError } = form;

    function onSubmit(values: TransformedSettPåVentFormValues) {
        return settPåVent({
            frist: values.frist,
            årsak: values.årsak,
            behandlingId: behandling.behandlingId,
            erBehandlingAlleredePåVent,
        });
    }

    return { form, onSubmit, erBehandlingAlleredePåVent };
}

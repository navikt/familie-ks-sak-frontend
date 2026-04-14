import { useForm } from 'react-hook-form';

import { byggSuksessRessurs } from '@navikt/familie-typer';

import { useOppdaterBehandlingstema } from '../../../../hooks/useOppdaterBehandlingstema';
import { useBehandlingContext } from '../../../../sider/Fagsak/Behandling/context/BehandlingContext';
import { behandlingstemaer, type IBehandlingstema } from '../../../../typer/behandlingstema';

export enum OppdaterBehandlingstemaFelt {
    BEHANDLINGSTEMA = 'behandlingstema',
}

export interface OppdaterBehandlingstemaFormValues {
    [OppdaterBehandlingstemaFelt.BEHANDLINGSTEMA]: IBehandlingstema;
}

interface Props {
    lukkModal: () => void;
}

export const useOppdaterBehandlingstemaSkjema = ({ lukkModal }: Props) => {
    const { behandling, settÅpenBehandling } = useBehandlingContext();
    const { mutateAsync: oppdaterBehandlingstema } = useOppdaterBehandlingstema();

    const eksisterendeBehandlingstema = Object.values(behandlingstemaer).find(
        it => it.kategori === behandling.kategori
    )!;

    const form = useForm<OppdaterBehandlingstemaFormValues, unknown, OppdaterBehandlingstemaFormValues>({
        values: {
            [OppdaterBehandlingstemaFelt.BEHANDLINGSTEMA]: eksisterendeBehandlingstema,
        },
    });

    const { setError } = form;

    const onSubmit = async (values: OppdaterBehandlingstemaFormValues) => {
        const { behandlingstema } = values;

        const oppdaterBehandlingstemaParameters = {
            behandlingKategori: behandlingstema.kategori,
            behandlingId: behandling.behandlingId,
        };

        return oppdaterBehandlingstema(oppdaterBehandlingstemaParameters)
            .then(behandling => {
                settÅpenBehandling(byggSuksessRessurs(behandling));
                lukkModal();
            })
            .catch((e: unknown) =>
                setError('root', {
                    message: e instanceof Error ? e.message : 'Teknisk feil ved endring av behandlingstema.',
                })
            );
    };
    return {
        form,
        onSubmit,
    };
};

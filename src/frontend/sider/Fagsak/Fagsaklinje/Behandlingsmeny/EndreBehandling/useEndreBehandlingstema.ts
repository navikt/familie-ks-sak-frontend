import { useEffect, useState } from 'react';

import { useHttp } from '@navikt/familie-http';
import type { FeltState } from '@navikt/familie-skjema';
import { feil, ok, useFelt, useSkjema } from '@navikt/familie-skjema';
import type { Ressurs } from '@navikt/familie-typer';
import { byggHenterRessurs, byggTomRessurs, RessursStatus } from '@navikt/familie-typer';

import type { IBehandling } from '../../../../../typer/behandling';
import type {
    IBehandlingstema,
    IRestEndreBehandlingstema,
} from '../../../../../typer/behandlingstema';
import { tilBehandlingstema } from '../../../../../typer/behandlingstema';
import { useBehandlingContext } from '../../../Behandling/context/BehandlingContext';

const useEndreBehandling = (lukkModal: () => void) => {
    const { request } = useHttp();
    const { behandling, settÅpenBehandling } = useBehandlingContext();

    const [ressurs, settRessurs] = useState(byggTomRessurs());

    const { skjema } = useSkjema<{ behandlingstema: IBehandlingstema | undefined }, string>({
        felter: {
            behandlingstema: useFelt<IBehandlingstema | undefined>({
                verdi: undefined,
                valideringsfunksjon: (felt: FeltState<IBehandlingstema | undefined>) =>
                    felt.verdi ? ok(felt) : feil(felt, 'Behandlingstema må settes.'),
            }),
        },
        skjemanavn: 'Endre behandlingstema',
    });

    useEffect(() => {
        nullstillSkjema();
    }, [behandling]);

    const endreBehandlingstema = (behandlingId: number) => {
        const { behandlingstema } = skjema.felter;
        if (behandlingstema.verdi !== undefined) {
            const { kategori } = behandlingstema.verdi;
            settRessurs(byggHenterRessurs());
            request<IRestEndreBehandlingstema, IBehandling>({
                method: 'PUT',
                data: { behandlingKategori: kategori },
                url: `/familie-ks-sak/api/behandlinger/${behandlingId}/behandlingstema`,
            }).then((oppdatertFagsak: Ressurs<IBehandling>) => {
                if (oppdatertFagsak.status === RessursStatus.SUKSESS) {
                    settÅpenBehandling(oppdatertFagsak);
                    settRessurs(byggTomRessurs());
                }
                settRessurs(oppdatertFagsak);
            });
        }
        lukkModal();
    };

    const nullstillSkjema = () => {
        const { kategori } = behandling;
        skjema.felter.behandlingstema.validerOgSettFelt(tilBehandlingstema(kategori));
    };

    return {
        skjema,
        nullstillSkjema,
        endreBehandlingstema,
        ressurs,
    };
};

export default useEndreBehandling;

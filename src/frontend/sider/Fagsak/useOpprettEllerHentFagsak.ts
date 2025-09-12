import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

import type { Ressurs } from '@navikt/familie-typer';
import { RessursStatus } from '@navikt/familie-typer';

import type { IOpprettEllerHentFagsakData } from '../../api/fagsak';
import useFagsakApi from '../../api/useFagsakApi';
import { HentFagsakQueryKeyFactory } from '../../hooks/useHentFagsak';
import type { IMinimalFagsak } from '../../typer/fagsak';
import { hentAktivBehandlingPåMinimalFagsak } from '../../utils/fagsak';

export const useOpprettEllerHentFagsak = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { hentFagsak } = useFagsakApi();

    function opprettEllerHentFagsak(data: IOpprettEllerHentFagsakData) {
        hentFagsak(data)
            .then((response: Ressurs<IMinimalFagsak>) => {
                if (response.status === RessursStatus.SUKSESS) {
                    const hentetFagsak = response.data;
                    queryClient.setQueryData(HentFagsakQueryKeyFactory.fagsak(hentetFagsak.id), hentetFagsak);
                    const aktivBehandling = hentAktivBehandlingPåMinimalFagsak(hentetFagsak);
                    if (aktivBehandling) {
                        navigate(`/fagsak/${hentetFagsak.id}/${aktivBehandling.behandlingId}`);
                    } else {
                        navigate(`/fagsak/${hentetFagsak.id}/saksoversikt`);
                    }
                } else if (
                    response.status === RessursStatus.FEILET ||
                    response.status === RessursStatus.FUNKSJONELL_FEIL ||
                    response.status === RessursStatus.IKKE_TILGANG
                ) {
                    // TODO: Legg på samme toast som i ba-sak-frontend
                } else {
                    // TODO: Legg på samme toast som i ba-sak-frontend
                }
            })
            .catch(() => {
                // TODO: Feilhåndter
            });
    }

    return {
        opprettEllerHentFagsak,
    };
};

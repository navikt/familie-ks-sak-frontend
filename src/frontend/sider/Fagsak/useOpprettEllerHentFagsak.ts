import { useNavigate } from 'react-router';

import { RessursStatus } from '@navikt/familie-typer';
import type { Ressurs } from '@navikt/familie-typer';

import type { VisningBehandling } from './Saksoversikt/visningBehandling';
import useFagsakApi from './useFagsakApi';
import type { IOpprettEllerHentFagsakData } from '../../api/fagsak';
import { useFagsakContext } from '../../context/fagsak/FagsakContext';
import type { IMinimalFagsak } from '../../typer/fagsak';
import { hentAktivBehandlingPåMinimalFagsak } from '../../utils/fagsak';

export const useopprettEllerHentFagsak = (data: IOpprettEllerHentFagsakData) => {
    const { settMinimalFagsakRessurs } = useFagsakContext();

    const navigate = useNavigate();
    const { hentFagsak } = useFagsakApi();

    hentFagsak(data)
        .then((response: Ressurs<IMinimalFagsak>) => {
            if (response.status === RessursStatus.SUKSESS) {
                settMinimalFagsakRessurs(response);

                const aktivBehandling: VisningBehandling | undefined =
                    hentAktivBehandlingPåMinimalFagsak(response.data);
                if (aktivBehandling) {
                    navigate(`/fagsak/${response.data.id}/${aktivBehandling.behandlingId}`);
                } else {
                    navigate(`/fagsak/${response.data.id}/saksoversikt`);
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
};

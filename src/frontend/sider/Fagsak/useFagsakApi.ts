import { useNavigate } from 'react-router';

import { useHttp } from '@navikt/familie-http';
import { RessursStatus } from '@navikt/familie-typer';
import type { Ressurs } from '@navikt/familie-typer';

import type { VisningBehandling } from './Saksoversikt/visningBehandling';
import type { IOpprettEllerHentFagsakData } from '../../api/fagsak';
import { useFagsakContext } from '../../context/fagsak/FagsakContext';
import type { IMinimalFagsak } from '../../typer/fagsak';
import { hentAktivBehandlingPåMinimalFagsak } from '../../utils/fagsak';

const useFagsakApi = () => {
    const { settMinimalFagsakRessurs } = useFagsakContext();
    const { request } = useHttp();

    const navigate = useNavigate();

    const opprettEllerHentFagsak = (data: IOpprettEllerHentFagsakData) => {
        request<IOpprettEllerHentFagsakData, IMinimalFagsak>({
            data,
            method: 'POST',
            url: `/familie-ks-sak/api/fagsaker`,
            påvirkerSystemLaster: true,
        })
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

    const hentFagsakForPerson = async (personId: string) => {
        return request<{ ident: string }, IMinimalFagsak>({
            method: 'POST',
            url: `/familie-ks-sak/api/fagsaker/hent-fagsak-paa-person`,
            data: {
                ident: personId,
            },
        }).then((fagsak: Ressurs<IMinimalFagsak>) => {
            return fagsak;
        });
    };

    return {
        opprettEllerHentFagsak,
        hentFagsakForPerson,
    };
};

export default useFagsakApi;

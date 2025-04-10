import { useHttp } from '@navikt/familie-http';
import type { Ressurs } from '@navikt/familie-typer';

import type { IOpprettEllerHentFagsakData } from '../../api/fagsak';
import type { IMinimalFagsak } from '../../typer/fagsak';

const useFagsakApi = () => {
    const { request } = useHttp();

    const hentFagsak = (data: IOpprettEllerHentFagsakData) => {
        return request<IOpprettEllerHentFagsakData, IMinimalFagsak>({
            data,
            method: 'POST',
            url: `/familie-ks-sak/api/fagsaker`,
            påvirkerSystemLaster: true,
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
        hentFagsak,
        hentFagsakForPerson,
    };
};

export default useFagsakApi;

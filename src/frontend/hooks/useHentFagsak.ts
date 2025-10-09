import { useQuery } from '@tanstack/react-query';

import { useHttp } from '@navikt/familie-http';

import { hentFagsak } from '../api/hentFagsak';
import { useAppContext } from '../context/AppContext';
import type { IMinimalFagsak } from '../typer/fagsak';
import { PersonType } from '../typer/person';
import { sammenlignFødselsdato } from '../utils/obfuskerData';

function obfuskerFagsak(fagsak: IMinimalFagsak) {
    fagsak.gjeldendeUtbetalingsperioder.forEach(gup => {
        let indeks = 1;
        gup.utbetalingsperiodeDetaljer.sort(sammenlignFødselsdato).forEach(upd => {
            if (upd.person.type === PersonType.SØKER) {
                upd.person.navn = 'Søker Søkersen';
            } else {
                upd.person.navn = '[' + indeks++ + '] Barn Barnesen';
            }
        });
    });
}

export const HentFagsakQueryKeyFactory = {
    fagsak: (fagsakId: number | undefined) => ['fagsak', fagsakId],
};

export function useHentFagsak(fagsakId: number | undefined, påvirkerSystemLaster: boolean = true) {
    const { request } = useHttp();
    const { skalObfuskereData } = useAppContext();
    return useQuery({
        queryKey: HentFagsakQueryKeyFactory.fagsak(fagsakId),
        queryFn: () => {
            if (fagsakId === undefined) {
                return Promise.reject(new Error('Kan ikke hente fagsak uten fagsakId.'));
            }
            return hentFagsak(request, fagsakId, påvirkerSystemLaster);
        },
        select: fagsak => {
            if (skalObfuskereData) {
                obfuskerFagsak(fagsak);
            }
            return fagsak;
        },
        enabled: fagsakId !== undefined,
    });
}

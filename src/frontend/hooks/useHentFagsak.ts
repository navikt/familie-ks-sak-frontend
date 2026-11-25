import { hentFagsak } from '@api/hentFagsak';
import { queryKeys } from '@hooks/keys/queryKeys';
import { MetaKey } from '@hooks/meta/metaKey';
import { useSkalObfuskereData } from '@hooks/useSkalObfuskereData';
import { useQuery } from '@tanstack/react-query';
import type { FagsakId, IMinimalFagsak } from '@typer/fagsak';
import { PersonType } from '@typer/person';
import { sammenlignFødselsdato } from '@utils/obfuskerData';

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

export function useHentFagsak(fagsakId: FagsakId | undefined) {
    const skalObfuskereData = useSkalObfuskereData();
    return useQuery({
        queryKey: queryKeys.fagsak(fagsakId),
        queryFn: () => {
            if (fagsakId === undefined) {
                throw new Error('Kan ikke hente fagsak uten fagsakId.');
            }
            return hentFagsak(fagsakId);
        },
        select: fagsak => {
            if (skalObfuskereData) {
                obfuskerFagsak(fagsak);
            }
            return fagsak;
        },
        enabled: fagsakId !== undefined,
        meta: { [MetaKey.VIS_SYSTEMET_LASTER]: true },
    });
}

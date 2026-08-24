import { useBehandling } from '@hooks/useBehandling';
import { useFeilutbetaltValutaTabellContext } from '@sider/Fagsak/Behandling/sider/Vedtak/FeilutbetaltValuta/FeilutbetaltValutaTabellContext';
import { BehandlingKategori } from '@typer/behandlingstema';

export function useSkalViseFeilutbetaltValutaMenyvalg() {
    const behandling = useBehandling();

    const { erFeilutbetaltValutaTabellSynlig } = useFeilutbetaltValutaTabellContext();

    return !erFeilutbetaltValutaTabellSynlig && behandling.kategori === BehandlingKategori.EØS;
}

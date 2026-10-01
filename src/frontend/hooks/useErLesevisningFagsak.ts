import { erFagsakLåst } from '../utils/fagsak';
import { useFagsak } from './useFagsak';
import { useSaksbehandler } from './useSaksbehandler';

export function useErLesevisningFagsak() {
    const saksbehandler = useSaksbehandler();
    const fagsak = useFagsak();

    if (erFagsakLåst(fagsak)) {
        return true;
    }

    if (!saksbehandler.harSkrivetilgang) {
        return true;
    }

    return false;
}

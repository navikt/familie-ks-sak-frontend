import { useBehandling } from '@hooks/useBehandling';
import { useRefusjonEøsTabellContext } from '@sider/Fagsak/Behandling/sider/Vedtak/RefusjonEøs/RefusjonEøsTabellContext';
import { vedtakHarFortsattUtbetaling } from '@utils/vedtakUtils';

export function useSkalViseRefusjonEøsMenyvalg() {
    const behandling = useBehandling();

    const { erRefusjonEøsTabellSynlig } = useRefusjonEøsTabellContext();

    return !erRefusjonEøsTabellSynlig && vedtakHarFortsattUtbetaling(behandling.resultat);
}

import { useLocation, useNavigate } from 'react-router';

import { ActionMenu } from '@navikt/ds-react';

import { useFagsakContext } from '../../../../sider/Fagsak/FagsakContext';
import { erFagsakLåst } from '../../../../utils/fagsak';

export function SendInformasjonsbrev() {
    const { fagsak } = useFagsakContext();

    const navigate = useNavigate();
    const location = useLocation();

    const erPåDokumentutsending = location.pathname.includes('dokumentutsending');

    if (erPåDokumentutsending || erFagsakLåst(fagsak)) {
        return null;
    }

    return (
        <ActionMenu.Item onSelect={() => navigate(`/fagsak/${fagsak.id}/dokumentutsending`)}>
            Send informasjonsbrev
        </ActionMenu.Item>
    );
}

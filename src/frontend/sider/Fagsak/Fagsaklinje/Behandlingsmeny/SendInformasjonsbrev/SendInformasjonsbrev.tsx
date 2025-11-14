import { useLocation, useNavigate } from 'react-router';

import { ActionMenu } from '@navikt/ds-react';

import { useFagsakContext } from '../../../FagsakContext';

export function SendInformasjonsbrev() {
    const { fagsak } = useFagsakContext();

    const navigate = useNavigate();
    const location = useLocation();

    const erPåDokumentutsending = location.pathname.includes('dokumentutsending');

    if (erPåDokumentutsending) {
        return null;
    }

    return (
        <ActionMenu.Item onSelect={() => navigate(`/fagsak/${fagsak.id}/dokumentutsending`)}>
            Send informasjonsbrev
        </ActionMenu.Item>
    );
}

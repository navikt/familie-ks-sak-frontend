import { useBehandlingId } from '@hooks/useBehandlingId';
import { useFagsakId } from '@hooks/useFagsakId';
import { useNavigate } from 'react-router';

import { Button } from '@navikt/ds-react';

export function TilForrigeSteg() {
    const navigate = useNavigate();
    const fagsakId = useFagsakId();
    const behandlingId = useBehandlingId();

    function onForrigeStegClicked() {
        navigate(`/fagsak/${fagsakId}/${behandlingId}/simulering`);
    }

    return (
        <Button variant={'tertiary'} onClick={onForrigeStegClicked}>
            Forrige steg
        </Button>
    );
}

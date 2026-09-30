import { useFagsak } from '@hooks/useFagsak';
import { ActionMenu } from '@navikt/ds-react';
import { erFagsakLåst } from '@utils/fagsak';

interface Props {
    åpneModal: () => void;
}

export function OpprettBehandling({ åpneModal }: Props) {
    const fagsak = useFagsak();

    if (erFagsakLåst(fagsak)) {
        return null;
    }

    return <ActionMenu.Item onSelect={åpneModal}>Opprett behandling</ActionMenu.Item>;
}

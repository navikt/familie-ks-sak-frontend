import { ModalType } from '@context/ModalContext';
import { useFagsak } from '@hooks/useFagsak';
import { useModal } from '@hooks/useModal';
import { ActionMenu } from '@navikt/ds-react';
import { erFagsakLåst } from '@utils/fagsak';

export function LåsOppFagsak() {
    const fagsak = useFagsak();
    const { åpneModal } = useModal(ModalType.LÅS_OPP_FAGSAK);

    if (!erFagsakLåst(fagsak)) {
        return null;
    }

    return <ActionMenu.Item onSelect={() => åpneModal()}>Lås opp fagsak</ActionMenu.Item>;
}

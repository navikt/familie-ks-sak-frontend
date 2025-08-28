import React from 'react';

import { Modal } from '@navikt/ds-react';

import { ModalType } from '../../../context/ModalContext';
import { useModal } from '../../../hooks/useModal';

export function OpprettFagsakModalNy() {
    const { tittel, erModalÅpen, lukkModal, args, bredde } = useModal(ModalType.OPPRETT_FAGSAK);

    return (
        <Modal
            open={erModalÅpen}
            onClose={lukkModal}
            header={{ heading: tittel, size: 'medium' }}
            portal={true}
            width={bredde}
        >
            {args !== undefined && erModalÅpen ? (
                <Modal.Body>Model er åpen</Modal.Body>
            ) : (
                <Modal.Body>Model er ikke åpen</Modal.Body>
            )}
        </Modal>
    );
}

export default OpprettFagsakModalNy;

import { useState } from 'react';

import { useNavigate } from 'react-router';

import { Button, Modal, VStack } from '@navikt/ds-react';

import Brevskjema from './Brevskjema';
import useSakOgBehandlingParams from '../../../hooks/useSakOgBehandlingParams';
import type { IPersonInfo } from '../../../typer/person';

interface IProps {
    onIModalClick: () => void;
    bruker: IPersonInfo;
}

const Brev = ({ onIModalClick, bruker }: IProps) => {
    const { fagsakId } = useSakOgBehandlingParams();
    const navigate = useNavigate();

    const [visInnsendtBrevModal, settVisInnsendtBrevModal] = useState(false);

    return (
        <VStack marginBlock={'space-16'} marginInline={'space-20'}>
            <Brevskjema onSubmitSuccess={() => settVisInnsendtBrevModal(true)} bruker={bruker} />
            {visInnsendtBrevModal && (
                <Modal
                    open
                    onClose={() => {
                        settVisInnsendtBrevModal(false);
                        onIModalClick();
                    }}
                    header={{
                        heading: 'Brevet er sendt',
                        size: 'medium',
                    }}
                    portal
                >
                    <Modal.Footer>
                        <Button
                            variant={'secondary'}
                            key={'til saksoversikt'}
                            size={'medium'}
                            onClick={() => {
                                onIModalClick();
                                navigate(`/fagsak/${fagsakId}/saksoversikt`);
                                settVisInnsendtBrevModal(false);
                            }}
                            children={'Se saksoversikt'}
                        />
                        <Button
                            variant={'secondary'}
                            key={'til oppgavebenken'}
                            size={'medium'}
                            onClick={() => {
                                onIModalClick();
                                navigate('/oppgaver');
                            }}
                            children={'Se oppgavebenk'}
                        />
                    </Modal.Footer>
                </Modal>
            )}
        </VStack>
    );
};
export default Brev;

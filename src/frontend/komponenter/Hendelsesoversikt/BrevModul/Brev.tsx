import * as React from 'react';

import { useNavigate } from 'react-router';
import styled from 'styled-components';

import { Button, Modal } from '@navikt/ds-react';

import Brevskjema from './Brevskjema';
import BrevskjemaGammel from './BrevskjemaGammel';
import { useAppContext } from '../../../context/AppContext';
import useSakOgBehandlingParams from '../../../hooks/useSakOgBehandlingParams';
import type { IPersonInfo } from '../../../typer/person';
import { ToggleNavn } from '../../../typer/toggles';

interface IProps {
    onIModalClick: () => void;
    bruker: IPersonInfo;
}

const BoksMedMargin = styled.div`
    margin: 1rem 1.25rem;
`;

const Brev = ({ onIModalClick, bruker }: IProps) => {
    const { fagsakId } = useSakOgBehandlingParams();
    const navigate = useNavigate();
    const { toggles } = useAppContext();

    const [visInnsendtBrevModal, settVisInnsendtBrevModal] = React.useState(false);

    return (
        <BoksMedMargin>
            {toggles[ToggleNavn.brukNyPdfModal] ? (
                <Brevskjema
                    onSubmitSuccess={() => {
                        settVisInnsendtBrevModal(true);
                    }}
                    bruker={bruker}
                />
            ) : (
                <BrevskjemaGammel
                    onSubmitSuccess={() => {
                        settVisInnsendtBrevModal(true);
                    }}
                    bruker={bruker}
                />
            )}
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
        </BoksMedMargin>
    );
};
export default Brev;

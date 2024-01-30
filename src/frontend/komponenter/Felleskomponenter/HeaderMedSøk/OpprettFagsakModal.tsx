import React from 'react';

import styled from 'styled-components';

import { BodyShort, Button, ErrorMessage, Modal } from '@navikt/ds-react';
import type { ISøkeresultat } from '@navikt/familie-header';

import useOpprettFagsak from './useOpprettFagsak';
import { formaterIdent } from '../../../utils/formatter';

export interface IOpprettFagsakModal {
    lukkModal: () => void;
    søkeresultat: ISøkeresultat;
}

const StyledBodyShort = styled(BodyShort)`
    margin-top: 2rem;
`;

const OpprettFagsakModal: React.FC<IOpprettFagsakModal> = ({ lukkModal, søkeresultat }) => {
    const { opprettFagsak, feilmelding, senderInn, settSenderInn } = useOpprettFagsak();
    const { navn, ident } = søkeresultat;

    return (
        <Modal
            open
            onClose={lukkModal}
            portal
            width={'35rem'}
            header={{ heading: 'Opprett fagsak', size: 'medium' }}
        >
            <Modal.Body>
                <BodyShort size={'small'} level={'3'}>
                    Personen har ingen tilknyttet fagsak. Ønsker du å opprette fagsak for denne
                    personen?
                </BodyShort>
                <StyledBodyShort>{`${navn} (${formaterIdent(ident)})`}</StyledBodyShort>
                {!!feilmelding && <ErrorMessage children={feilmelding} />}
            </Modal.Body>
            <Modal.Footer>
                <Button
                    key={'bekreft'}
                    variant={'primary'}
                    size={'small'}
                    onClick={async () => {
                        settSenderInn(true);
                        opprettFagsak(
                            {
                                personIdent: ident,
                                aktørId: null,
                            },
                            lukkModal
                        );
                    }}
                    children={'Ja, opprett fagsak'}
                    disabled={senderInn}
                    loading={senderInn}
                />
                <Button
                    variant={'secondary'}
                    key={'avbryt'}
                    size={'small'}
                    onClick={lukkModal}
                    children={'Avbryt'}
                />
            </Modal.Footer>
        </Modal>
    );
};

export default OpprettFagsakModal;

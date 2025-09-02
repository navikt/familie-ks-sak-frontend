import React from 'react';

import { BodyShort, Button, ErrorMessage, Modal, VStack } from '@navikt/ds-react';
import type { ISøkeresultat } from '@navikt/familie-header';

import useOpprettFagsak from './useOpprettFagsak';
import { formaterIdent } from '../../utils/formatter';

interface IOpprettFagsakModal {
    lukkModal: () => void;
    søkeresultat: ISøkeresultat;
}

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
                <VStack gap={'space-32'}>
                    <BodyShort size={'small'}>
                        Personen har ingen tilknyttet fagsak. Ønsker du å opprette fagsak for denne
                        personen?
                    </BodyShort>
                    <BodyShort>{`${navn} (${formaterIdent(ident)})`}</BodyShort>
                </VStack>
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

import React, { useState } from 'react';

import { useNavigate } from 'react-router';

import { Alert, BodyShort, Button, Modal, VStack } from '@navikt/ds-react';

import { ModalType } from '../../../context/ModalContext';
import { useModal } from '../../../hooks/useModal';
import { useOpprettFagsak } from '../../../hooks/useOpprettFagsak';
import type { IMinimalFagsak } from '../../../typer/fagsak';
import { formaterIdent } from '../../../utils/formatter';

interface Props {
    personIdent: string;
    personNavn: string;
}

const kulepunkt = `\u2022`;

export function OpprettFagsakModalInnhold({ personIdent, personNavn }: Props) {
    const navigate = useNavigate();
    const { lukkModal } = useModal(ModalType.OPPRETT_FAGSAK);
    const [visFeilmelding, settVisFeilmelding] = useState(false);
    const { mutate, error, isPending } = useOpprettFagsak({
        onSuccess: (fagsak: IMinimalFagsak) => {
            navigate(`/fagsak/${fagsak.id}/saksoversikt`);
            lukkModal();
        },
        onError: () => {
            settVisFeilmelding(true);
        },
    });

    return (
        <>
            <Modal.Body>
                <VStack gap={'4'}>
                    <BodyShort>Ønsker du å opprette fagsak for denne personen?</BodyShort>
                    <BodyShort>{`${kulepunkt} ${personNavn} ${formaterIdent(personIdent)}`}</BodyShort>
                    {visFeilmelding && (
                        <Alert
                            variant={'error'}
                            closeButton={true}
                            onClose={() => settVisFeilmelding(false)}
                        >
                            {error?.message ?? 'Ukjent feil oppstod'}
                        </Alert>
                    )}
                </VStack>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant={'primary'}
                    onClick={() => mutate({ personIdent })}
                    disabled={isPending}
                    loading={isPending}
                >
                    Opprett fagsak
                </Button>
                <Button type={'button'} variant={'tertiary'} onClick={lukkModal}>
                    Avbryt
                </Button>
            </Modal.Footer>
        </>
    );
}

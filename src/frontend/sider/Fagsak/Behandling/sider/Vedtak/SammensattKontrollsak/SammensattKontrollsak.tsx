import React, { useState } from 'react';

import styled from 'styled-components';

import { Alert, Button, ErrorMessage, Textarea, VStack } from '@navikt/ds-react';
import { ASpacing6 } from '@navikt/ds-tokens/dist/tokens';

import { useSammensattKontrollsakContext } from './SammensattKontrollsakContext';
import { useBehandlingContext } from '../../../context/BehandlingContext';

const StyledVStack = styled(VStack)`
    margin-bottom: ${ASpacing6};
`;

const StyledButton = styled(Button)`
    align-self: start;
`;

export function SammensattKontrollsak() {
    const { vurderErLesevisning } = useBehandlingContext();
    const { sammensattKontrollsak, opprettEllerOppdaterSammensattKontrollsak, feilmelding } =
        useSammensattKontrollsakContext();

    const [fritekst, settFritekst] = useState<string>(sammensattKontrollsak?.fritekst ?? '');

    const fritekstErEndret = fritekst !== (sammensattKontrollsak?.fritekst ?? '');

    const erLesevisning = vurderErLesevisning();

    return (
        <StyledVStack gap="5">
            <Textarea
                label="Fritekst til vedtaksbrev"
                description="Her skal du skrive hvilke vurderinger som er gjort, hvilken informasjon som er lagt til grunn og hvilke hjemler som er brukt."
                onChange={event => settFritekst(event.target.value)}
                value={fritekst}
                minRows={20}
                readOnly={erLesevisning}
            />
            {fritekstErEndret && (
                <Alert variant="warning" size="small">
                    Du har ikke lagret dine siste endringer, og vil miste disse om du forlater siden
                    uten å lagre.
                </Alert>
            )}
            {feilmelding && <ErrorMessage>{feilmelding}</ErrorMessage>}
            {!erLesevisning && (
                <StyledButton
                    onClick={() => opprettEllerOppdaterSammensattKontrollsak(fritekst)}
                    variant="primary"
                    size="small"
                    loading={false}
                >
                    Lagre
                </StyledButton>
            )}
        </StyledVStack>
    );
}

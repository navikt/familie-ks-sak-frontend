import { useState } from 'react';

import { useErLesevisning } from '@hooks/useErLesevisning';

import { Button, ErrorMessage, LocalAlert, Textarea, VStack } from '@navikt/ds-react';

import { useSammensattKontrollsakContext } from './SammensattKontrollsakContext';

export function SammensattKontrollsak() {
    const { sammensattKontrollsak, opprettEllerOppdaterSammensattKontrollsak, feilmelding } =
        useSammensattKontrollsakContext();

    const erLesevisning = useErLesevisning();

    const [fritekst, settFritekst] = useState<string>(sammensattKontrollsak?.fritekst ?? '');

    const fritekstErEndret = fritekst !== (sammensattKontrollsak?.fritekst ?? '');

    return (
        <VStack gap="space-20" marginBlock={'space-0 space-24'} align={'start'}>
            <Textarea
                label="Fritekst til vedtaksbrev"
                description="Her skal du skrive hvilke vurderinger som er gjort, hvilken informasjon som er lagt til grunn og hvilke hjemler som er brukt."
                onChange={event => settFritekst(event.target.value)}
                value={fritekst}
                minRows={20}
                readOnly={erLesevisning}
            />
            {fritekstErEndret && (
                <LocalAlert status="warning">
                    <LocalAlert.Header>
                        <LocalAlert.Title>Du har ikke lagret dine siste endringer</LocalAlert.Title>
                    </LocalAlert.Header>
                    <LocalAlert.Content>Du vil miste disse om du forlater siden uten å lagre.</LocalAlert.Content>
                </LocalAlert>
            )}
            {feilmelding && <ErrorMessage showIcon={true}>{feilmelding}</ErrorMessage>}
            {!erLesevisning && (
                <Button
                    onClick={() => opprettEllerOppdaterSammensattKontrollsak(fritekst)}
                    variant="primary"
                    size="small"
                    loading={false}
                >
                    Lagre
                </Button>
            )}
        </VStack>
    );
}

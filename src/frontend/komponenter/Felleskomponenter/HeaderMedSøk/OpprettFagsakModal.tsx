import React from 'react';

import styled from 'styled-components';

import { BodyShort, Button, ErrorMessage, Heading } from '@navikt/ds-react';
import type { ISøkeresultat } from '@navikt/familie-header';

import { useApp } from '../../../context/AppContext';
import type { IPersonInfo } from '../../../typer/person';
import { formaterIdent } from '../../../utils/formatter';
import UIModalWrapper from '../Modal/UIModalWrapper';
import useOpprettFagsak from './useOpprettFagsak';

export interface IOpprettFagsakModal {
    lukkModal: () => void;
    søkeresultat?: ISøkeresultat | undefined;
    personInfo?: IPersonInfo;
}

const StyledHeading = styled(Heading)`
    font-size: 1rem;
    margin-bottom: 1.5rem;
`;

const OpprettFagsakModal: React.FC<IOpprettFagsakModal> = ({
    lukkModal,
    søkeresultat,
    personInfo,
}) => {
    const { opprettFagsak, feilmelding, senderInn, settSenderInn } = useOpprettFagsak();
    const { sjekkTilgang } = useApp();
    const visModal = !!søkeresultat || !!personInfo;

    return (
        <UIModalWrapper
            modal={{
                actions: [
                    <Button
                        variant={'secondary'}
                        key={'avbryt'}
                        size={'small'}
                        onClick={lukkModal}
                        children={'Avbryt'}
                    />,
                    <Button
                        key={'bekreft'}
                        variant={'primary'}
                        size={'small'}
                        onClick={async () => {
                            settSenderInn(true);
                            if (søkeresultat && (await sjekkTilgang(søkeresultat.ident))) {
                                opprettFagsak(
                                    {
                                        personIdent: søkeresultat.ident,
                                        aktørId: null,
                                        institusjon: null,
                                    },
                                    lukkModal
                                );
                            } else {
                                settSenderInn(false);
                            }
                        }}
                        children={'Ja, opprett fagsak'}
                        disabled={senderInn}
                        loading={senderInn}
                    />,
                ],
                onClose: lukkModal,
                lukkKnapp: true,
                tittel: 'Opprett fagsak',
                visModal: visModal,
            }}
        >
            <StyledHeading size={'small'} level={'3'}>
                Personen har ingen tilknyttet fagsak. Ønsker du å opprette fagsak for denne
                personen?
            </StyledHeading>
            {søkeresultat && (
                <BodyShort>{`${søkeresultat.navn} (${formaterIdent(
                    søkeresultat.ident
                )})`}</BodyShort>
            )}
            {!!feilmelding && <ErrorMessage children={feilmelding} />}
        </UIModalWrapper>
    );
};

export default OpprettFagsakModal;

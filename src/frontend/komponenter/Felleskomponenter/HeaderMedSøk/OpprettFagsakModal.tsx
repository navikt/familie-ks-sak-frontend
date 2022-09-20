import React, { useEffect, useState } from 'react';

import styled from 'styled-components';

import { Knapp } from 'nav-frontend-knapper';
import { Feilmelding, Normaltekst, Undertittel } from 'nav-frontend-typografi';

import type { ISøkeresultat } from '@navikt/familie-header';
import { RessursStatus } from '@navikt/familie-typer';

import { useApp } from '../../../context/AppContext';
import { FagsakType } from '../../../typer/fagsak';
import type { IPersonInfo } from '../../../typer/person';
import type { ISamhandlerInfo } from '../../../typer/samhandler';
import { ToggleNavn } from '../../../typer/toggles';
import { formaterIdent } from '../../../utils/formatter';
import { useSamhandlerSkjema } from '../../Fagsak/InstitusjonOgVerge/useSamhandler';
import UIModalWrapper from '../Modal/UIModalWrapper';
import useOpprettFagsak from './useOpprettFagsak';

export interface IOpprettFagsakModal {
    lukkModal: () => void;
    søkeresultat?: ISøkeresultat | undefined;
    personInfo?: IPersonInfo;
}

const StyledUndertittel = styled(Undertittel)`
    font-size: 1rem;
    margin-bottom: 1.5rem;
`;

const StyledKnappContainer = styled.div`
    margin-top: 1.2rem;
    margin-bottom: 0.5rem;
`;

const OpprettFagsakModal: React.FC<IOpprettFagsakModal> = ({
    lukkModal,
    søkeresultat,
    personInfo,
}) => {
    const { opprettFagsak, feilmelding, senderInn, settSenderInn } = useOpprettFagsak();
    const { sjekkTilgang, toggles } = useApp();
    const visModal = !!søkeresultat || !!personInfo;
    const [fagsakType, settFagsakType] = useState<FagsakType>(FagsakType.NORMAL);
    const [visFeilmelding, settVisFeilmelding] = useState(false);
    const [valgtSamhandler, settValgtSamhandler] = useState<ISamhandlerInfo | undefined>(undefined);
    const { samhandlerSkjema } = useSamhandlerSkjema();

    const onClose = () => {
        settFagsakType(FagsakType.NORMAL);
        settVisFeilmelding(false);
        settValgtSamhandler(undefined);
        lukkModal();
    };

    useEffect(() => {
        if (samhandlerSkjema.submitRessurs.status === RessursStatus.SUKSESS) {
            settValgtSamhandler(samhandlerSkjema.submitRessurs.data);
            settVisFeilmelding(false);
        }
    }, [samhandlerSkjema.submitRessurs.status]);

    return (
        <>
            {!toggles[ToggleNavn.støtterInstitusjon].valueOf() && (
                <UIModalWrapper
                    modal={{
                        actions: [
                            <Knapp
                                key={'avbryt'}
                                mini={true}
                                onClick={lukkModal}
                                children={'Avbryt'}
                            />,
                            <Knapp
                                key={'bekreft'}
                                type={'hoved'}
                                mini={true}
                                onClick={async () => {
                                    settSenderInn(true);
                                    if (søkeresultat && (await sjekkTilgang(søkeresultat.ident))) {
                                        opprettFagsak(
                                            {
                                                personIdent: søkeresultat.ident,
                                                aktørId: null,
                                                fagsakType: FagsakType.NORMAL,
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
                                spinner={senderInn}
                            />,
                        ],
                        onClose: lukkModal,
                        lukkKnapp: true,
                        tittel: 'Opprett fagsak',
                        visModal: visModal,
                    }}
                >
                    <StyledUndertittel tag={'h3'}>
                        Personen har ingen tilknyttet fagsak. Ønsker du å opprette fagsak for denne
                        personen?
                    </StyledUndertittel>
                    {søkeresultat && (
                        <Normaltekst>{`${søkeresultat.navn} (${formaterIdent(
                            søkeresultat.ident
                        )})`}</Normaltekst>
                    )}
                    {!!feilmelding && <Feilmelding children={feilmelding} />}
                </UIModalWrapper>
            )}
            {toggles[ToggleNavn.støtterInstitusjon].valueOf() && (
                <UIModalWrapper
                    modal={{
                        actions: [
                            <StyledKnappContainer key={'OpprettFagsakModal knapper'}>
                                <Knapp
                                    key={'avbryt'}
                                    type={'flat'}
                                    mini={true}
                                    onClick={onClose}
                                    children={'Avbryt'}
                                    kompakt={true}
                                />
                                <Knapp
                                    key={'Bekreft'}
                                    type={'hoved'}
                                    mini={true}
                                    onClick={async () => {
                                        settSenderInn(true);
                                        const personIdent =
                                            søkeresultat?.ident || personInfo?.personIdent;

                                        if (personIdent && (await sjekkTilgang(personIdent))) {
                                            opprettFagsak(
                                                {
                                                    personIdent: personIdent,
                                                    aktørId: null,
                                                    fagsakType: fagsakType,
                                                    institusjon: valgtSamhandler
                                                        ? {
                                                              orgNummer: valgtSamhandler.orgNummer,
                                                              tssEksternId:
                                                                  valgtSamhandler.tssEksternId,
                                                          }
                                                        : null,
                                                },
                                                onClose
                                            );
                                        } else {
                                            settSenderInn(false);
                                        }
                                        settVisFeilmelding(true);
                                    }}
                                    children={'Opprett fagsak'}
                                    disabled={senderInn}
                                    spinner={senderInn}
                                    kompakt={true}
                                />
                            </StyledKnappContainer>,
                        ],
                        onClose: onClose,
                        lukkKnapp: true,
                        tittel: 'Opprett fagsak',
                        visModal: visModal,
                        className: 'uimodal-wider',
                    }}
                >
                    <StyledUndertittel tag={'h3'}>
                        {`Personen har ${
                            personInfo?.fagsakId ? 'en eksisterende' : 'ingen'
                        } tilknyttet fagsak. Ønsker du å opprette fagsak for denne
                            personen?`}
                    </StyledUndertittel>
                    {søkeresultat && (
                        <Normaltekst>{`${søkeresultat.navn} (${formaterIdent(
                            søkeresultat.ident
                        )})`}</Normaltekst>
                    )}
                    {!søkeresultat && personInfo && (
                        <Normaltekst>{`${personInfo.navn} (${formaterIdent(
                            personInfo.personIdent
                        )})`}</Normaltekst>
                    )}
                    {!!feilmelding && visFeilmelding && <Feilmelding children={feilmelding} />}
                </UIModalWrapper>
            )}
        </>
    );
};

export default OpprettFagsakModal;

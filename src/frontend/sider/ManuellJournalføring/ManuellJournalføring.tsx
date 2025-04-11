import React from 'react';

import styled from 'styled-components';

import { Alert } from '@navikt/ds-react';
import { Journalstatus, RessursStatus } from '@navikt/familie-typer';

import { DokumentPanel } from './Dokument/DokumentPanel';
import { JournalpostSkjema } from './JournalpostSkjema';
import {
    ManuellJournalførProvider,
    useManuellJournalførContext,
} from '../../context/ManuellJournalførContext';
import { fagsakHeaderHøydeRem } from '../../typer/styling';
import Personlinje from '../Fagsak/Personlinje/Personlinje';

const ToKolonnerDiv = styled.div<{ $viserAlert?: boolean }>`
    display: grid;
    grid-template-columns: 40rem 1fr;
    grid-template-rows: 1fr;
    height: calc(
        100vh -
            ${props => (props.$viserAlert ? fagsakHeaderHøydeRem + 5.25 : fagsakHeaderHøydeRem)}rem
    );
`;

const ManuellJournalføringContent: React.FC = () => {
    const { dataForManuellJournalføring, minimalFagsak } = useManuellJournalførContext();

    switch (dataForManuellJournalføring.status) {
        case RessursStatus.SUKSESS:
            const viserAlert =
                dataForManuellJournalføring.data.journalpost.journalstatus !==
                Journalstatus.MOTTATT;
            return (
                <>
                    <Personlinje
                        bruker={dataForManuellJournalføring.data.person}
                        minimalFagsak={minimalFagsak}
                    />

                    {dataForManuellJournalføring.data.journalpost.journalstatus !==
                        Journalstatus.MOTTATT && (
                        <>
                            <Alert
                                variant="warning"
                                children={`Journalposten har status ${dataForManuellJournalføring.data.journalpost.journalstatus} og er allerede journalført.`}
                            />
                            <br />
                        </>
                    )}

                    <ToKolonnerDiv $viserAlert={viserAlert}>
                        <JournalpostSkjema />
                        <DokumentPanel />
                    </ToKolonnerDiv>
                </>
            );
        case RessursStatus.FEILET:
        case RessursStatus.FUNKSJONELL_FEIL:
            return (
                <Alert variant="error" children={dataForManuellJournalføring.frontendFeilmelding} />
            );
        case RessursStatus.IKKE_TILGANG:
            return (
                <Alert
                    variant="error"
                    children={
                        'Kan ikke vise journalføringsoppgave. Personer relatert til journalpost har adressebeskyttelse. Krever ekstra tilganger.'
                    }
                />
            );
        default:
            return <div />;
    }
};

const ManuellJournalføring: React.FC = () => {
    return (
        <ManuellJournalførProvider>
            <ManuellJournalføringContent />
        </ManuellJournalførProvider>
    );
};

export default ManuellJournalføring;

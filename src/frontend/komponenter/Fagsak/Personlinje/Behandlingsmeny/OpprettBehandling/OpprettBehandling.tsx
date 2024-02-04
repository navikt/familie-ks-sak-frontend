import React, { useState } from 'react';

import { isBefore, subDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import { Button, Fieldset, Dropdown, Alert } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer';

import BehandlingstypeFelt from './BehandlingstypeFelt';
import { BehandlingårsakFelt } from './BehandlingsårsakFelt';
import useOpprettBehandling from './useOpprettBehandling';
import type { IMinimalFagsak } from '../../../../../typer/fagsak';
import { dagensDato } from '../../../../../utils/dato';
import { hentFrontendFeilmelding } from '../../../../../utils/ressursUtils';
import { BehandlingstemaSelect } from '../../../../Felleskomponenter/BehandlingstemaSelect';
import Datovelger from '../../../../Felleskomponenter/Datovelger/Datovelger';
import UIModalWrapper from '../../../../Felleskomponenter/Modal/UIModalWrapper';

const StyledFieldset = styled(Fieldset)`
    && > div:not(:last-child):not(:empty) {
        margin-bottom: 1rem;
    }
`;

const StyledAlert = styled(Alert)`
    margin-top: 1.5rem;
`;

interface IProps {
    minimalFagsak: IMinimalFagsak;
}

const OpprettBehandling: React.FC<IProps> = ({ minimalFagsak }) => {
    const [visModal, settVisModal] = useState(false);
    const [visBekreftelseTilbakekrevingModal, settVisBekreftelseTilbakekrevingModal] =
        useState(false);
    const navigate = useNavigate();

    const { onBekreft, opprettBehandlingSkjema, nullstillSkjemaStatus } = useOpprettBehandling({
        lukkModal: () => settVisModal(false),
        onOpprettTilbakekrevingSuccess: () => {
            settVisModal(false);
            settVisBekreftelseTilbakekrevingModal(true);
        },
    });

    const lukkOpprettBehandlingModal = () => {
        nullstillSkjemaStatus();
        settVisModal(false);
    };

    const søknadMottattDatoErMerEnn360DagerSiden =
        opprettBehandlingSkjema.felter.søknadMottattDato.verdi &&
        isBefore(opprettBehandlingSkjema.felter.søknadMottattDato.verdi, subDays(dagensDato, 360));

    return (
        <>
            <Dropdown.Menu.List.Item onClick={() => settVisModal(true)}>
                Opprett behandling
            </Dropdown.Menu.List.Item>

            <UIModalWrapper
                modal={{
                    actions: [
                        <Button
                            key={'avbryt'}
                            variant="tertiary"
                            size="small"
                            onClick={lukkOpprettBehandlingModal}
                            children={'Avbryt'}
                        />,
                        <Button
                            key={'bekreft'}
                            variant="primary"
                            size="small"
                            onClick={() => onBekreft(minimalFagsak.søkerFødselsnummer)}
                            children={'Bekreft'}
                            loading={
                                opprettBehandlingSkjema.submitRessurs.status ===
                                RessursStatus.HENTER
                            }
                            disabled={
                                opprettBehandlingSkjema.submitRessurs.status ===
                                RessursStatus.HENTER
                            }
                        />,
                    ],
                    onClose: lukkOpprettBehandlingModal,
                    lukkKnapp: true,
                    tittel: 'Opprett ny behandling',
                    visModal,
                }}
            >
                <StyledFieldset
                    error={hentFrontendFeilmelding(opprettBehandlingSkjema.submitRessurs)}
                    legend={'Opprett ny behandling'}
                    hideLegend
                >
                    <BehandlingstypeFelt
                        behandlingstype={opprettBehandlingSkjema.felter.behandlingstype}
                        visFeilmeldinger={opprettBehandlingSkjema.visFeilmeldinger}
                        minimalFagsak={minimalFagsak}
                    />

                    {opprettBehandlingSkjema.felter.behandlingsårsak.erSynlig && (
                        <BehandlingårsakFelt
                            behandlingsårsak={opprettBehandlingSkjema.felter.behandlingsårsak}
                            visFeilmeldinger={opprettBehandlingSkjema.visFeilmeldinger}
                        />
                    )}

                    {opprettBehandlingSkjema.felter.behandlingstema.erSynlig && (
                        <BehandlingstemaSelect
                            behandlingstema={opprettBehandlingSkjema.felter.behandlingstema}
                            visFeilmeldinger={opprettBehandlingSkjema.visFeilmeldinger}
                            name="Behandlingstema"
                            label="Velg behandlingstema"
                        />
                    )}

                    {opprettBehandlingSkjema.felter.kravMottattDato.erSynlig && (
                        <Datovelger
                            felt={opprettBehandlingSkjema.felter.kravMottattDato}
                            visFeilmeldinger={opprettBehandlingSkjema.visFeilmeldinger}
                            label={'Krav mottatt'}
                            kanKunVelgeFortid
                        />
                    )}
                    {opprettBehandlingSkjema.felter.søknadMottattDato.erSynlig && (
                        <Datovelger
                            felt={opprettBehandlingSkjema.felter.søknadMottattDato}
                            visFeilmeldinger={opprettBehandlingSkjema.visFeilmeldinger}
                            label={'Mottatt dato'}
                            kanKunVelgeFortid
                        />
                    )}
                </StyledFieldset>
                {søknadMottattDatoErMerEnn360DagerSiden && (
                    <StyledAlert variant={'warning'}>
                        Er mottatt dato riktig? <br />
                        Det er mer enn 360 dager siden denne datoen.
                    </StyledAlert>
                )}
            </UIModalWrapper>

            {visBekreftelseTilbakekrevingModal && (
                <UIModalWrapper
                    modal={{
                        tittel: 'Tilbakekreving opprettes...',
                        lukkKnapp: false,
                        visModal: visBekreftelseTilbakekrevingModal,
                        actions: [
                            <Button
                                key={'saksoversikt'}
                                variant="secondary"
                                size="small"
                                onClick={() => {
                                    settVisBekreftelseTilbakekrevingModal(false);
                                    navigate(`/fagsak/${minimalFagsak.id}/saksoversikt`);
                                }}
                                children={'Gå til saksoversikten'}
                            />,
                            <Button
                                key={'oppgavebenk'}
                                variant="primary"
                                size="small"
                                onClick={() => {
                                    settVisBekreftelseTilbakekrevingModal(false);
                                    navigate('/oppgaver');
                                }}
                                children={'Gå til oppgavebenken'}
                            />,
                        ],
                    }}
                >
                    Tilbakekrevingsbehandling opprettes, men det kan ta litt tid (ca 30 sekunder)
                    før den blir tilgjengelig i saksoversikten og oppgavebenken.
                </UIModalWrapper>
            )}
        </>
    );
};

export default OpprettBehandling;

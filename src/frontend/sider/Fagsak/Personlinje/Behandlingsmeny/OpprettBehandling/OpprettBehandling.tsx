import React, { useState } from 'react';

import { isBefore, subDays } from 'date-fns';
import { useNavigate } from 'react-router';
import styled from 'styled-components';

import { Button, Fieldset, Dropdown, Modal, Alert } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer';

import BehandlingstypeFelt from './BehandlingstypeFelt';
import { BehandlingårsakFelt } from './BehandlingsårsakFelt';
import useOpprettBehandling from './useOpprettBehandling';
import type { IMinimalFagsak } from '../../../../../typer/fagsak';
import { dagensDato } from '../../../../../utils/dato';
import { hentFrontendFeilmelding } from '../../../../../utils/ressursUtils';
import { BehandlingstemaSelect } from '../../../../Felleskomponenter/BehandlingstemaSelect';
import Datovelger from '../../../../Felleskomponenter/Datovelger/Datovelger';

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

            {visModal && (
                <Modal
                    open
                    portal
                    width={'35rem'}
                    header={{
                        heading: 'Opprett ny behandling',
                        size: 'medium',
                    }}
                    onClose={lukkOpprettBehandlingModal}
                >
                    <Modal.Body>
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
                                    behandlingsårsak={
                                        opprettBehandlingSkjema.felter.behandlingsårsak
                                    }
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

                            {opprettBehandlingSkjema.felter.klageMottattDato.erSynlig && (
                                <Datovelger
                                    felt={opprettBehandlingSkjema.felter.klageMottattDato}
                                    visFeilmeldinger={opprettBehandlingSkjema.visFeilmeldinger}
                                    label={'Klage mottatt'}
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
                    </Modal.Body>

                    <Modal.Footer>
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
                        />
                        <Button
                            key={'avbryt'}
                            variant="tertiary"
                            size="small"
                            onClick={lukkOpprettBehandlingModal}
                            children={'Avbryt'}
                        />
                    </Modal.Footer>
                </Modal>
            )}

            {visBekreftelseTilbakekrevingModal && (
                <Modal
                    open
                    onClose={() => settVisBekreftelseTilbakekrevingModal(false)}
                    header={{
                        heading: 'Tilbakekrevingsbehandling opprettes...',
                        size: 'small',
                        closeButton: false,
                    }}
                    portal
                    width={'35rem'}
                >
                    <Modal.Body>
                        Tilbakekrevingsbehandling opprettes, men det kan ta litt tid (ca 30
                        sekunder) før den blir tilgjengelig i saksoversikten og oppgavebenken.
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            key={'oppgavebenk'}
                            variant="primary"
                            size="small"
                            onClick={() => {
                                settVisBekreftelseTilbakekrevingModal(false);
                                navigate('/oppgaver');
                            }}
                            children={'Gå til oppgavebenken'}
                        />
                        <Button
                            key={'saksoversikt'}
                            variant="secondary"
                            size="small"
                            onClick={() => {
                                settVisBekreftelseTilbakekrevingModal(false);
                                navigate(`/fagsak/${minimalFagsak.id}/saksoversikt`);
                            }}
                            children={'Gå til saksoversikten'}
                        />
                    </Modal.Footer>
                </Modal>
            )}
        </>
    );
};

export default OpprettBehandling;

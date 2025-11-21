import { isBefore, subDays } from 'date-fns';
import styled from 'styled-components';

import { Alert, Button, Fieldset, Modal } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer';

import BehandlingstypeFelt from './BehandlingstypeFelt';
import { BehandlingårsakFelt } from './BehandlingsårsakFelt';
import useOpprettBehandling from './useOpprettBehandling';
import { BehandlingstemaSelect } from '../../../../../komponenter/BehandlingstemaSelect';
import Datovelger from '../../../../../komponenter/Datovelger/Datovelger';
import { hentDagensDato } from '../../../../../utils/dato';
import { hentFrontendFeilmelding } from '../../../../../utils/ressursUtils';
import { useFagsakContext } from '../../../FagsakContext';

const StyledFieldset = styled(Fieldset)`
    && > div:not(:last-child):not(:empty) {
        margin-bottom: 1rem;
    }
`;

const StyledAlert = styled(Alert)`
    margin-top: 1.5rem;
`;

interface Props {
    lukkModal: () => void;
    onTilbakekrevingsbehandlingOpprettet: () => void;
}

export function OpprettBehandlingModal({ lukkModal, onTilbakekrevingsbehandlingOpprettet }: Props) {
    const { fagsak } = useFagsakContext();

    const { onBekreft, opprettBehandlingSkjema, nullstillSkjemaStatus } = useOpprettBehandling({
        lukkModal,
        onOpprettTilbakekrevingSuccess: () => {
            lukkModal();
            onTilbakekrevingsbehandlingOpprettet();
        },
    });

    const lukkOpprettBehandlingModal = () => {
        nullstillSkjemaStatus();
        lukkModal();
    };

    const søknadMottattDatoErMerEnn360DagerSiden =
        opprettBehandlingSkjema.felter.søknadMottattDato.verdi &&
        isBefore(opprettBehandlingSkjema.felter.søknadMottattDato.verdi, subDays(hentDagensDato(), 360));

    return (
        <Modal
            open={true}
            portal={true}
            width={'35rem'}
            header={{ heading: 'Opprett ny behandling' }}
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
                        minimalFagsak={fagsak}
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
                    onClick={() => onBekreft(fagsak.søkerFødselsnummer)}
                    children={'Bekreft'}
                    loading={opprettBehandlingSkjema.submitRessurs.status === RessursStatus.HENTER}
                    disabled={opprettBehandlingSkjema.submitRessurs.status === RessursStatus.HENTER}
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
    );
}

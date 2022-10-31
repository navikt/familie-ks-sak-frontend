import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { SkjemaGruppe } from 'nav-frontend-skjema';

import { Button } from '@navikt/ds-react';
import { Dropdown } from '@navikt/ds-react-internal';
import { RessursStatus } from '@navikt/familie-typer';

import type { IMinimalFagsak } from '../../../../../typer/fagsak';
import { hentFrontendFeilmelding } from '../../../../../utils/ressursUtils';
import UIModalWrapper from '../../../../Felleskomponenter/Modal/UIModalWrapper';
import SkjultLegend from '../../../../Felleskomponenter/SkjultLegend';
import OpprettBehandlingValg from './OpprettBehandlingValg';
import useOpprettBehandling from './useOpprettBehandling';

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
    const { behandlingsårsak, behandlingstype, behandlingstema, søknadMottattDato } =
        opprettBehandlingSkjema.felter;

    const lukkOpprettBehandlingModal = () => {
        nullstillSkjemaStatus();
        settVisModal(false);
    };

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
                <SkjemaGruppe feil={hentFrontendFeilmelding(opprettBehandlingSkjema.submitRessurs)}>
                    <SkjultLegend>Opprett ny behandling</SkjultLegend>
                    <OpprettBehandlingValg
                        behandlingstype={behandlingstype}
                        behandlingsårsak={behandlingsårsak}
                        behandlingstema={behandlingstema}
                        søknadMottattDato={søknadMottattDato}
                        minimalFagsak={minimalFagsak}
                        visFeilmeldinger={opprettBehandlingSkjema.visFeilmeldinger}
                    />
                </SkjemaGruppe>
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

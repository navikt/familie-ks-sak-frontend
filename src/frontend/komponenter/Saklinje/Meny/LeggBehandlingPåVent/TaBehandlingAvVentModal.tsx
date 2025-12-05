import { useState } from 'react';

import styled from 'styled-components';

import { Alert, BodyShort, Button, Modal } from '@navikt/ds-react';
import { useHttp } from '@navikt/familie-http';
import type { Ressurs } from '@navikt/familie-typer';
import { byggFeiletRessurs, byggHenterRessurs, byggTomRessurs, RessursStatus } from '@navikt/familie-typer';

import { useBehandlingContext } from '../../../../sider/Fagsak/Behandling/context/BehandlingContext';
import type { IBehandling } from '../../../../typer/behandling';
import { settPåVentÅrsaker } from '../../../../typer/behandling';
import { defaultFunksjonellFeil } from '../../../../typer/feilmeldinger';
import { Datoformat, isoStringTilFormatertString } from '../../../../utils/dato';

const StyledBodyShort = styled(BodyShort)`
    padding-bottom: 1rem;
`;

const StyledAlert = styled(Alert)`
    padding-bottom: 1rem;
`;

interface Props {
    lukkModal: () => void;
}

export function TaBehandlingAvVentModal({ lukkModal }: Props) {
    const { behandling } = useBehandlingContext();
    const { request } = useHttp();

    const [submitRessurs, settSubmitRessurs] = useState(byggTomRessurs());

    const deaktiverVentingPåBehandling = () => {
        settSubmitRessurs(byggHenterRessurs());

        request<undefined, IBehandling>({
            method: 'PUT',
            url: `/familie-ks-sak/api/behandlinger/${behandling.behandlingId}/sett-på-vent/gjenoppta`,
        })
            .then((ressurs: Ressurs<IBehandling>) => {
                settSubmitRessurs(ressurs);
                window.location.reload();
            })
            .catch(() => {
                settSubmitRessurs(byggFeiletRessurs(defaultFunksjonellFeil));
            });
    };

    return (
        <Modal
            header={{ heading: 'Fortsett behandling', size: 'small' }}
            open
            onClose={lukkModal}
            width={'35rem'}
            portal
        >
            <Modal.Body>
                <BodyShort>
                    Behandlingen er satt på vent.
                    {behandling?.behandlingPåVent &&
                        ` Årsak: ${settPåVentÅrsaker[behandling?.behandlingPåVent?.årsak]}. `}
                </BodyShort>
                <StyledBodyShort>
                    {`Frist: ${isoStringTilFormatertString({
                        isoString: behandling?.behandlingPåVent?.frist,
                        tilFormat: Datoformat.DATO,
                    })}. `}
                    Gå via meny for å endre årsak og frist på ventende behandling.
                </StyledBodyShort>

                <StyledBodyShort>Ønsker du å fortsette behandlingen?</StyledBodyShort>

                {submitRessurs.status === RessursStatus.FEILET && (
                    <StyledAlert variant="error">{submitRessurs.frontendFeilmelding}</StyledAlert>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button
                    key={'Bekreft'}
                    variant="primary"
                    size="small"
                    onClick={deaktiverVentingPåBehandling}
                    children={'Ja, fortsett'}
                    loading={submitRessurs.status === RessursStatus.HENTER}
                />
                <Button key={'Nei'} variant="tertiary" onClick={lukkModal} children={'Nei'} />
            </Modal.Footer>
        </Modal>
    );
}

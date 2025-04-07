import React, { useState } from 'react';

import { Button, Fieldset, Dropdown, Modal } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer';

import useEndreBehandlingstema from './useEndreBehandlingstema';
import { useBehandling } from '../../../../../context/behandlingContext/BehandlingContext';
import { BehandlingstemaSelect } from '../../../../../komponenter/BehandlingstemaSelect';
import { hentFrontendFeilmelding } from '../../../../../utils/ressursUtils';

const EndreBehandlingstema: React.FC = () => {
    const [visModal, settVisModal] = useState(false);
    const { skjema, endreBehandlingstema, ressurs, nullstillSkjema } = useEndreBehandlingstema(() =>
        settVisModal(false)
    );

    const { vurderErLesevisning, åpenBehandling } = useBehandling();

    const lukkEndreBehandlingModal = () => {
        nullstillSkjema();
        settVisModal(false);
    };
    return (
        <>
            <Dropdown.Menu.List.Item
                onClick={() => {
                    settVisModal(true);
                }}
            >
                Endre behandlingstema
            </Dropdown.Menu.List.Item>

            {visModal && (
                <Modal
                    open
                    header={{ heading: 'Endre behandlingstema', size: 'small' }}
                    onClose={lukkEndreBehandlingModal}
                    width={'35rem'}
                    portal
                >
                    <Modal.Body>
                        <Fieldset
                            error={hentFrontendFeilmelding(ressurs)}
                            legend={'Endre behandlingstema'}
                            hideLegend
                        >
                            <BehandlingstemaSelect
                                behandlingstema={skjema.felter.behandlingstema}
                                readOnly={vurderErLesevisning()}
                                label="Behandlingstema"
                            />
                        </Fieldset>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            key={'bekreft'}
                            variant="primary"
                            size="small"
                            onClick={() => {
                                if (åpenBehandling.status === RessursStatus.SUKSESS) {
                                    endreBehandlingstema(åpenBehandling.data.behandlingId);
                                }
                            }}
                            children={'Bekreft'}
                            loading={ressurs.status === RessursStatus.HENTER}
                        />
                        <Button
                            key={'avbryt'}
                            variant="secondary"
                            size="small"
                            onClick={lukkEndreBehandlingModal}
                            children={'Avbryt'}
                        />
                    </Modal.Footer>
                </Modal>
            )}
        </>
    );
};

export default EndreBehandlingstema;

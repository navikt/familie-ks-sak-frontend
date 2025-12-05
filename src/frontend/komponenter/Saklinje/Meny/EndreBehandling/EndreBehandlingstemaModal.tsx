import { Button, Fieldset, Modal } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer';

import useEndreBehandlingstema from './useEndreBehandlingstema';
import { useBehandlingContext } from '../../../../sider/Fagsak/Behandling/context/BehandlingContext';
import { hentFrontendFeilmelding } from '../../../../utils/ressursUtils';
import { BehandlingstemaSelect } from '../../../BehandlingstemaSelect';

interface Props {
    lukkModal: () => void;
}

export function EndreBehandlingstemaModal({ lukkModal }: Props) {
    const { skjema, endreBehandlingstema, ressurs, nullstillSkjema } = useEndreBehandlingstema(() => lukkModal());

    const { vurderErLesevisning, behandling } = useBehandlingContext();

    const lukkEndreBehandlingModal = () => {
        nullstillSkjema();
        lukkModal();
    };

    return (
        <Modal
            open
            header={{ heading: 'Endre behandlingstema', size: 'small' }}
            onClose={lukkEndreBehandlingModal}
            width={'35rem'}
            portal
        >
            <Modal.Body>
                <Fieldset error={hentFrontendFeilmelding(ressurs)} legend={'Endre behandlingstema'} hideLegend>
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
                    onClick={() => endreBehandlingstema(behandling.behandlingId)}
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
    );
}

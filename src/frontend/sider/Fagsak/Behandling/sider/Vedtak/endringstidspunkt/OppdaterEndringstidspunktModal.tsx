import { Button, Fieldset, Modal } from '@navikt/ds-react';
import type { Ressurs } from '@navikt/familie-typer';
import { RessursStatus } from '@navikt/familie-typer';

import { useOppdaterEndringstidspunktSkjema } from './useOppdaterEndringstidspunktSkjema';
import Datovelger from '../../../../../../komponenter/Datovelger/Datovelger';
import type { IBehandling } from '../../../../../../typer/behandling';
import type { IRestOverstyrtEndringstidspunkt } from '../../../../../../typer/vedtaksperiode';
import { dateTilIsoDatoString } from '../../../../../../utils/dato';
import { hentFrontendFeilmelding } from '../../../../../../utils/ressursUtils';
import { useBehandlingContext } from '../../../context/BehandlingContext';

interface IProps {
    åpenBehandling: IBehandling;
    lukkModal: () => void;
}

export const OppdaterEndringstidspunktModal: React.FC<IProps> = ({ åpenBehandling, lukkModal }) => {
    const { settÅpenBehandling, vurderErLesevisning } = useBehandlingContext();
    const { skjema, kanSendeSkjema, onSubmit } = useOppdaterEndringstidspunktSkjema(åpenBehandling.endringstidspunkt);

    const erLesevisning = vurderErLesevisning();
    const oppdaterEndringstidspunkt = () => {
        if (kanSendeSkjema()) {
            onSubmit<IRestOverstyrtEndringstidspunkt>(
                {
                    method: 'PUT',
                    data: {
                        overstyrtEndringstidspunkt: dateTilIsoDatoString(skjema.felter.endringstidspunkt.verdi),
                        behandlingId: åpenBehandling.behandlingId,
                    },
                    url: `/familie-ks-sak/api/vedtaksperioder/endringstidspunkt`,
                },
                (response: Ressurs<IBehandling>) => {
                    if (response.status === RessursStatus.SUKSESS) {
                        lukkModal();
                        settÅpenBehandling(response);
                    }
                }
            );
        }
    };

    return (
        <Modal
            open
            onClose={lukkModal}
            width={'35rem'}
            header={{
                heading: 'Oppdater endringstidspunkt',
                size: 'medium',
            }}
            portal
        >
            <Modal.Body>
                <Fieldset
                    error={hentFrontendFeilmelding(skjema.submitRessurs)}
                    errorPropagation={false}
                    legend={'Nytt endringstidspunkt'}
                    hideLegend
                >
                    <Datovelger
                        felt={skjema.felter.endringstidspunkt}
                        label={'Endringstidspunkt'}
                        visFeilmeldinger={skjema.visFeilmeldinger}
                        readOnly={erLesevisning}
                        kanKunVelgeFortid
                    />
                </Fieldset>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant={'primary'}
                    key={'Oppdater'}
                    size={'small'}
                    onClick={oppdaterEndringstidspunkt}
                    children={'Oppdater'}
                    loading={skjema.submitRessurs.status === RessursStatus.HENTER}
                    disabled={skjema.submitRessurs.status === RessursStatus.HENTER}
                />
                <Button variant={'tertiary'} key={'Avbryt'} size={'small'} onClick={lukkModal} children={'Avbryt'} />
            </Modal.Footer>
        </Modal>
    );
};

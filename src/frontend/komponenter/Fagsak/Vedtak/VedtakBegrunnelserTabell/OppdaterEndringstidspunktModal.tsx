import React from 'react';

import { Button, Fieldset, Modal } from '@navikt/ds-react';
import type { ISkjema } from '@navikt/familie-skjema';
import { RessursStatus } from '@navikt/familie-typer';

import type { IBehandling } from '../../../../typer/behandling';
import { hentFrontendFeilmelding } from '../../../../utils/ressursUtils';
import Datovelger from '../../../Felleskomponenter/Datovelger/Datovelger';

interface IProps {
    onAvbryt: () => void;
    oppdaterEndringstidspunkt: () => void;
    skjema: ISkjema<{ endringstidspunkt: Date | undefined }, IBehandling>;
}

export const OppdaterEndringstidspunktModal: React.FC<IProps> = ({
    onAvbryt,
    oppdaterEndringstidspunkt,
    skjema,
}) => {
    return (
        <Modal
            open
            onClose={onAvbryt}
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
                <Button
                    variant={'tertiary'}
                    key={'Avbryt'}
                    size={'small'}
                    onClick={onAvbryt}
                    children={'Avbryt'}
                />
            </Modal.Footer>
        </Modal>
    );
};

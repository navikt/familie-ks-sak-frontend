import React from 'react';

import styled from 'styled-components';

import { SkjemaGruppe } from 'nav-frontend-skjema';

import { Button } from '@navikt/ds-react';
import type { ISkjema } from '@navikt/familie-skjema';
import { RessursStatus } from '@navikt/familie-typer';

import type { IBehandling } from '../../../../typer/behandling';
import { hentFrontendFeilmelding } from '../../../../utils/ressursUtils';
import Datovelger from '../../../Felleskomponenter/Datovelger/Datovelger';
import UIModalWrapper from '../../../Felleskomponenter/Modal/UIModalWrapper';

const Feltmargin = styled.div`
    margin-bottom: 2rem;
`;

interface IProps {
    visModal: boolean;
    onAvbryt: () => void;
    oppdaterEndringstidspunkt: () => void;
    skjema: ISkjema<{ endringstidspunkt: Date | undefined }, IBehandling>;
}

export const OppdaterEndringstidspunktModal: React.FC<IProps> = ({
    visModal,
    onAvbryt,
    oppdaterEndringstidspunkt,
    skjema,
}) => {
    return (
        <UIModalWrapper
            modal={{
                tittel: 'Oppdater endringstidspunkt',
                visModal: visModal,
                lukkKnapp: true,
                onClose: onAvbryt,
                actions: [
                    <Button
                        variant={'tertiary'}
                        key={'Avbryt'}
                        size={'small'}
                        onClick={onAvbryt}
                        children={'Avbryt'}
                    />,
                    <Button
                        variant={'primary'}
                        key={'Oppdater'}
                        size={'small'}
                        onClick={oppdaterEndringstidspunkt}
                        children={'Oppdater'}
                        loading={skjema.submitRessurs.status === RessursStatus.HENTER}
                        disabled={skjema.submitRessurs.status === RessursStatus.HENTER}
                    />,
                ],
            }}
        >
            <SkjemaGruppe
                feil={hentFrontendFeilmelding(skjema.submitRessurs)}
                utenFeilPropagering={true}
            >
                <Feltmargin>
                    <Datovelger
                        felt={skjema.felter.endringstidspunkt}
                        label={'Endringstidspunkt'}
                        visFeilmeldinger={skjema.visFeilmeldinger}
                    />
                </Feltmargin>
            </SkjemaGruppe>
        </UIModalWrapper>
    );
};

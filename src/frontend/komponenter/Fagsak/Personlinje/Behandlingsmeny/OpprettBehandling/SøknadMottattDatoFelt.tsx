import React from 'react';

import styled from 'styled-components';

import { FamilieDatovelger } from '@navikt/familie-form-elements';
import type { Felt } from '@navikt/familie-skjema';

import type { FamilieIsoDate } from '../../../../../utils/kalender';

interface IProps {
    søknadMottattDato: Felt<FamilieIsoDate>;
    visFeilmeldinger: boolean;
}

const FixedDatoVelger = styled(FamilieDatovelger)`
    .nav-datovelger__kalenderPortal__content {
        position: fixed;
    }

    .nav-datovelger__kalenderknapp {
        z-index: 0;
    }

    margin-top: 2rem;
`;

export const SøknadMottattDatoFelt: React.FC<IProps> = ({
    søknadMottattDato,
    visFeilmeldinger,
}) => (
    <FixedDatoVelger
        {...søknadMottattDato.hentNavInputProps(visFeilmeldinger)}
        valgtDato={søknadMottattDato.verdi}
        label={'Mottatt dato'}
        limitations={{
            maxDate: new Date().toISOString(),
        }}
        onChange={input =>
            søknadMottattDato.hentNavInputProps(visFeilmeldinger).onChange(input ?? '')
        }
        feil={visFeilmeldinger && søknadMottattDato.feilmelding}
    />
);

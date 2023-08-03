import React from 'react';

import styled from 'styled-components';

import { FamilieDatovelger } from '@navikt/familie-form-elements';
import type { Felt } from '@navikt/familie-skjema';

import type { FamilieIsoDate } from '../../../../../utils/kalender';

interface IProps {
    kravMottattDato: Felt<FamilieIsoDate>;
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

export const KravDatoFelt: React.FC<IProps> = ({ kravMottattDato, visFeilmeldinger }) => (
    <FixedDatoVelger
        {...kravMottattDato.hentNavInputProps(visFeilmeldinger)}
        value={kravMottattDato.verdi}
        label={'Krav mottatt'}
        limitations={{
            maxDate: new Date().toISOString(),
        }}
        onChange={input =>
            kravMottattDato.hentNavInputProps(visFeilmeldinger).onChange(input ?? '')
        }
        feil={visFeilmeldinger && kravMottattDato.feilmelding}
    />
);

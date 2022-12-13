import React from 'react';

import type { Felt } from '@navikt/familie-skjema';

import type { FamilieIsoDate } from '../../../../../utils/kalender';
import { FixedDatoVelger } from './OpprettBehandlingValg';

interface IProps {
    søknadMottattDato: Felt<FamilieIsoDate>;
    visFeilmeldinger: boolean;
}

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

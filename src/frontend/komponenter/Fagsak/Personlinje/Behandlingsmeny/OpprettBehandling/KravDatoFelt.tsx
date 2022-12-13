import React from 'react';

import type { Felt } from '@navikt/familie-skjema';

import type { FamilieIsoDate } from '../../../../../utils/kalender';
import { FixedDatoVelger } from './OpprettBehandlingValg';

interface IProps {
    kravMottattDato: Felt<FamilieIsoDate>;
    visFeilmeldinger: boolean;
}

export const KravDatoFelt: React.FC<IProps> = ({ kravMottattDato, visFeilmeldinger }) => (
    <FixedDatoVelger
        {...kravMottattDato.hentNavInputProps(visFeilmeldinger)}
        valgtDato={kravMottattDato.verdi}
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

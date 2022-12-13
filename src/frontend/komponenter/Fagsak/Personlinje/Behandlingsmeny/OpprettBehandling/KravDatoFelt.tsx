import React from 'react';

import type { Felt } from '@navikt/familie-skjema';

import type { FamilieIsoDate } from '../../../../../utils/kalender';
import { FixedDatoVelger } from './OpprettBehandlingValg';

interface IProps {
    kravMotattDato: Felt<FamilieIsoDate>;
    visFeilmeldinger: boolean;
}

export const KravDatoFelt: React.FC<IProps> = ({ kravMotattDato, visFeilmeldinger }) => (
    <FixedDatoVelger
        {...kravMotattDato.hentNavInputProps(visFeilmeldinger)}
        valgtDato={kravMotattDato.verdi}
        label={'Krav dato'}
        placeholder={'DD.MM.ÅÅÅÅ'}
        limitations={{
            maxDate: new Date().toISOString(),
        }}
        onChange={input => kravMotattDato.hentNavInputProps(visFeilmeldinger).onChange(input ?? '')}
        feil={visFeilmeldinger && kravMotattDato.feilmelding}
    />
);

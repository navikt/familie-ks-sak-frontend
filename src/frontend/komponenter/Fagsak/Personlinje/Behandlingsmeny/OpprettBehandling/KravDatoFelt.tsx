import React from 'react';

import type { Felt } from '@navikt/familie-skjema';

import type { FamilieIsoDate } from '../../../../../utils/kalender';
import { FeltFeilmelding, FixedDatoVelger } from './OpprettBehandlingValg';

interface IProps {
    kravMotattDato: Felt<FamilieIsoDate>;
    visFeilmeldinger: boolean;
}

export const KravDatoFelt: React.FC<IProps> = ({ kravMotattDato, visFeilmeldinger }) => {
    if (!kravMotattDato.erSynlig) {
        return null;
    }

    return (
        <>
            <FixedDatoVelger
                {...kravMotattDato.hentNavInputProps(visFeilmeldinger)}
                valgtDato={kravMotattDato.verdi}
                label={'Krav dato'}
                placeholder={'DD.MM.ÅÅÅÅ'}
                limitations={{
                    maxDate: new Date().toISOString(),
                }}
                onChange={input =>
                    kravMotattDato.hentNavInputProps(visFeilmeldinger).onChange(input ?? '')
                }
            />

            {kravMotattDato.feilmelding && visFeilmeldinger && (
                <FeltFeilmelding>{kravMotattDato.feilmelding}</FeltFeilmelding>
            )}
        </>
    );
};

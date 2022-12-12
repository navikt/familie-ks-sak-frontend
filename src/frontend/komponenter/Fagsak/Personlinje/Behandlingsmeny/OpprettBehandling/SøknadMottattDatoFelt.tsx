import React from 'react';

import type { Felt } from '@navikt/familie-skjema';

import type { FamilieIsoDate } from '../../../../../utils/kalender';
import { FeltFeilmelding, FixedDatoVelger } from './OpprettBehandlingValg';

interface IProps {
    søknadMottattDato: Felt<FamilieIsoDate>;
    visFeilmeldinger: boolean;
}

export const SøknadMottattDatoFelt: React.FC<IProps> = ({
    søknadMottattDato,
    visFeilmeldinger,
}) => {
    if (!søknadMottattDato.erSynlig) {
        return null;
    }

    return (
        <>
            <FixedDatoVelger
                {...søknadMottattDato.hentNavInputProps(visFeilmeldinger)}
                valgtDato={søknadMottattDato.verdi}
                label={'Mottatt dato'}
                placeholder={'DD.MM.ÅÅÅÅ'}
                limitations={{
                    maxDate: new Date().toISOString(),
                }}
                onChange={input =>
                    søknadMottattDato.hentNavInputProps(visFeilmeldinger).onChange(input ?? '')
                }
            />

            {søknadMottattDato.feilmelding && visFeilmeldinger && (
                <FeltFeilmelding>{søknadMottattDato.feilmelding}</FeltFeilmelding>
            )}
        </>
    );
};

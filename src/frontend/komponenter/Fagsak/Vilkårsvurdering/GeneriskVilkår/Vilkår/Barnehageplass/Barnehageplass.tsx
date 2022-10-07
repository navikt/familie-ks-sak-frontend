import React from 'react';

import { FamilieInput } from '@navikt/familie-form-elements';

import type { IVilkårSkjemaBaseProps } from '../../VilkårSkjema';
import { VilkårSkjema } from '../../VilkårSkjema';
import { useVilkårSkjema } from '../../VilkårSkjemaContext';
import { useBarnehageplass } from './BarnehageplassContext';

type BarnehageplassProps = IVilkårSkjemaBaseProps;

export const Barnehageplass: React.FC<BarnehageplassProps> = ({
    vilkårResultat,
    vilkårFraConfig,
    toggleForm,
    person,
    lesevisning,
}: BarnehageplassProps) => {
    const { felter } = useBarnehageplass(vilkårResultat, person);
    const vilkårSkjemaContext = useVilkårSkjema(vilkårResultat, felter, person, toggleForm);
    return (
        <VilkårSkjema
            vilkårSkjemaContext={vilkårSkjemaContext}
            visVurderesEtter={false}
            vilkårResultat={vilkårResultat}
            vilkårFraConfig={vilkårFraConfig}
            toggleForm={toggleForm}
            person={person}
            lesevisning={lesevisning}
        >
            <FamilieInput
                label={'Antall timer'}
                type={'number'}
                erLesevisning={lesevisning}
                value={vilkårSkjemaContext.skjema.felter.antallTimer.verdi}
                onChange={event =>
                    vilkårSkjemaContext.skjema.felter.antallTimer.validerOgSettFelt(
                        event.target.value
                    )
                }
                feil={
                    vilkårSkjemaContext.skjema.visFeilmeldinger
                        ? vilkårSkjemaContext.skjema.felter.antallTimer.feilmelding
                        : ''
                }
            />
        </VilkårSkjema>
    );
};

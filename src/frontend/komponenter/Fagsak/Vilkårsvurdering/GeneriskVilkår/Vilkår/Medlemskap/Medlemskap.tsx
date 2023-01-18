import React from 'react';

import styled from 'styled-components';

import { Alert } from '@navikt/ds-react';

import type { IVilkårSkjemaBaseProps } from '../../VilkårSkjema';
import { VilkårSkjema } from '../../VilkårSkjema';
import { useVilkårSkjema } from '../../VilkårSkjemaContext';
import { useMedlemskap } from './MedlemskapContext';

type MedlemskapProps = IVilkårSkjemaBaseProps;

const StyledAlert = styled(Alert)`
    margin-top: 1rem;
`;

export const Medlemskap: React.FC<MedlemskapProps> = ({
    vilkårResultat,
    vilkårFraConfig,
    toggleForm,
    person,
    lesevisning,
}: MedlemskapProps) => {
    const { felter, skalViseDatoVarsel } = useMedlemskap(vilkårResultat, person);
    const vilkårSkjemaContext = useVilkårSkjema(vilkårResultat, felter, person, toggleForm);
    return (
        <VilkårSkjema
            vilkårSkjemaContext={vilkårSkjemaContext}
            visVurderesEtter={true}
            visSpørsmål={true}
            vilkårResultat={vilkårResultat}
            vilkårFraConfig={vilkårFraConfig}
            toggleForm={toggleForm}
            person={person}
            lesevisning={lesevisning}
            periodeChildren={
                skalViseDatoVarsel && (
                    <StyledAlert inline variant={'warning'} size={'small'}>
                        Du må dobbeltsjekke at foreslått f.o.m dato er korrekt
                    </StyledAlert>
                )
            }
        />
    );
};

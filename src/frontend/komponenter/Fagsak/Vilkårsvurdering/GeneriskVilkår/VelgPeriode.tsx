import React from 'react';

import styled from 'styled-components';

import navFarger from 'nav-frontend-core';
import { SkjemaGruppe } from 'nav-frontend-skjema';
import { Element } from 'nav-frontend-typografi';

import { HelpText } from '@navikt/ds-react';
import type { ISODateString } from '@navikt/familie-form-elements';
import { FamilieDatovelger } from '@navikt/familie-form-elements';
import type { Felt } from '@navikt/familie-skjema';

import { useBehandling } from '../../../../context/behandlingContext/BehandlingContext';
import type { IVilkårResultat } from '../../../../typer/vilkår';
import { Resultat } from '../../../../typer/vilkår';
import { datoformatNorsk } from '../../../../utils/formatter';
import type { IPeriode } from '../../../../utils/kalender';
import { nyPeriode } from '../../../../utils/kalender';
import { vilkårPeriodeFeilmeldingId } from './VilkårTabell';

interface IProps {
    vilkår: IVilkårResultat;
    periode: Felt<IPeriode>;
    erEksplisittAvslagPåSøknad: Felt<boolean>;
    resultat: Felt<Resultat>;
    visFeilmeldinger: boolean;
}

const StyledLegend = styled.legend`
    && {
        display: flex;
        margin-bottom: 0;
    }
`;

const StyledElement = styled(Element)`
    margin-right: 0.5rem;
`;

const MarginSkjemaGruppe = styled(SkjemaGruppe)`
    margin-bottom: 1rem !important;
`;

const FlexDiv = styled.div`
    width: 23rem;
    display: flex;
    justify-content: space-between;
    & .lese-element {
        width: 50%;
    }
    .skjemaelement__label {
        color: ${navFarger.navMorkGra};
        font-size: 16px;
        font-weight: normal;
        height: 22px;
        line-height: 22px;
    }
`;

const VelgPeriode: React.FC<IProps> = ({
    periode,
    erEksplisittAvslagPåSøknad,
    resultat,
    visFeilmeldinger,
    vilkår,
    children,
}) => {
    const { erLesevisning } = useBehandling();
    const lesevisning = erLesevisning();

    return (
        <MarginSkjemaGruppe feil={visFeilmeldinger ? periode.feilmelding : ''}>
            {!lesevisning && (
                <StyledLegend>
                    <StyledElement>Velg periode</StyledElement>
                    <HelpText title="Hvordan fastsette periode">
                        Oppgi startdato/periode hvor vilkåret er oppfylt/ikke oppfylt.
                        Virkningstidspunktet vil bli beregnet ut fra dette. Dersom vurderingen
                        gjelder et avslag er ikke periode påkrevd.
                    </HelpText>
                </StyledLegend>
            )}

            <FlexDiv>
                {(!lesevisning || periode.verdi.fom) && (
                    <div>
                        <FamilieDatovelger
                            allowInvalidDateSelection={false}
                            limitations={{
                                maxDate: new Date().toISOString(),
                            }}
                            erLesesvisning={lesevisning}
                            id={`${vilkårPeriodeFeilmeldingId(vilkår)}__fastsett-periode-fom`}
                            label={
                                resultat.verdi === Resultat.IKKE_OPPFYLT &&
                                erEksplisittAvslagPåSøknad.verdi
                                    ? 'F.o.m (valgfri)'
                                    : 'F.o.m'
                            }
                            placeholder={datoformatNorsk.DATO}
                            onChange={(dato?: ISODateString) => {
                                periode.validerOgSettFelt(nyPeriode(dato, periode.verdi.tom));
                            }}
                            valgtDato={periode.verdi.fom}
                        />
                    </div>
                )}
                {(!lesevisning || periode.verdi.tom) && (
                    <div>
                        <FamilieDatovelger
                            erLesesvisning={lesevisning}
                            id={`${vilkårPeriodeFeilmeldingId(vilkår)}__fastsett-periode-tom`}
                            label={'T.o.m (valgfri)'}
                            placeholder={datoformatNorsk.DATO}
                            onChange={(dato?: ISODateString) => {
                                periode.validerOgSettFelt(nyPeriode(periode.verdi.fom, dato));
                            }}
                            valgtDato={periode.verdi.tom}
                        />
                    </div>
                )}
            </FlexDiv>
            {children}
        </MarginSkjemaGruppe>
    );
};

export default VelgPeriode;

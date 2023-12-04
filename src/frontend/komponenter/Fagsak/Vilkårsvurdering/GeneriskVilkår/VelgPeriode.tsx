import React from 'react';

import styled from 'styled-components';

import navFarger from 'nav-frontend-core';
import { SkjemaGruppe } from 'nav-frontend-skjema';

import { HelpText, Label } from '@navikt/ds-react';
import type { ISODateString } from '@navikt/familie-datovelger';
import type { Felt } from '@navikt/familie-skjema';

import { useBehandling } from '../../../../context/behandlingContext/BehandlingContext';
import { Resultat } from '../../../../typer/vilkår';
import type { IsoDatoString } from '../../../../utils/dato';
import type { IPeriode } from '../../../../utils/kalender';
import { nyPeriode } from '../../../../utils/kalender';
import DatovelgerForGammelSkjemaløsning from '../../../Felleskomponenter/Datovelger/DatovelgerForGammelSkjemaløsning';

interface IProps {
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

const StyledLabel = styled(Label)`
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
    children,
}) => {
    const { vurderErLesevisning } = useBehandling();
    const lesevisning = vurderErLesevisning();

    return (
        <MarginSkjemaGruppe feil={visFeilmeldinger ? periode.feilmelding : ''}>
            {!lesevisning && (
                <StyledLegend>
                    <StyledLabel>Velg periode</StyledLabel>
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
                        <DatovelgerForGammelSkjemaløsning
                            label={
                                resultat.verdi === Resultat.IKKE_OPPFYLT &&
                                erEksplisittAvslagPåSøknad.verdi
                                    ? 'F.o.m (valgfri)'
                                    : 'F.o.m'
                            }
                            value={periode.verdi.fom}
                            onDateChange={(dato?: IsoDatoString) => {
                                periode.validerOgSettFelt(nyPeriode(dato, periode.verdi.tom));
                            }}
                            visFeilmeldinger={false}
                            readOnly={lesevisning}
                            kanKunVelgeFortid
                        />
                    </div>
                )}
                {(!lesevisning || periode.verdi.tom) && (
                    <div>
                        <DatovelgerForGammelSkjemaløsning
                            label={'T.o.m (valgfri)'}
                            value={periode.verdi.tom}
                            readOnly={lesevisning}
                            onDateChange={(dato?: ISODateString) => {
                                periode.validerOgSettFelt(nyPeriode(periode.verdi.fom, dato));
                            }}
                            visFeilmeldinger={false}
                        />
                    </div>
                )}
            </FlexDiv>
            {children}
        </MarginSkjemaGruppe>
    );
};

export default VelgPeriode;

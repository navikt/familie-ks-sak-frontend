import type { PropsWithChildren } from 'react';
import React from 'react';

import styled from 'styled-components';

import { Fieldset, HelpText, Label } from '@navikt/ds-react';
import type { Felt } from '@navikt/familie-skjema';

import { useBehandling } from '../../../../../context/behandlingContext/BehandlingContext';
import DatovelgerForGammelSkjemaløsning from '../../../../../komponenter/Datovelger/DatovelgerForGammelSkjemaløsning';
import { Resultat } from '../../../../../typer/vilkår';
import type { IIsoDatoPeriode, IsoDatoString } from '../../../../../utils/dato';
import { nyIsoDatoPeriode } from '../../../../../utils/dato';

interface IProps extends PropsWithChildren {
    periode: Felt<IIsoDatoPeriode>;
    erEksplisittAvslagPåSøknad: Felt<boolean>;
    resultat: Felt<Resultat>;
    visFeilmeldinger: boolean;
    tomErPåkrevd: boolean;
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

const MarginFieldset = styled(Fieldset)`
    margin-bottom: 1rem !important;
`;

const FlexDiv = styled.div`
    display: flex;
    gap: 1.125rem;
`;

const VelgPeriode: React.FC<IProps> = ({
    periode,
    erEksplisittAvslagPåSøknad,
    resultat,
    visFeilmeldinger,
    children,
    tomErPåkrevd,
}) => {
    const { vurderErLesevisning } = useBehandling();
    const lesevisning = vurderErLesevisning();

    return (
        <MarginFieldset
            error={visFeilmeldinger ? periode.feilmelding : ''}
            legend={'Periode for vurderingen'}
            hideLegend
        >
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
                <DatovelgerForGammelSkjemaløsning
                    label={
                        resultat.verdi === Resultat.IKKE_OPPFYLT && erEksplisittAvslagPåSøknad.verdi
                            ? 'F.o.m (valgfri)'
                            : 'F.o.m'
                    }
                    value={periode.verdi.fom}
                    onDateChange={(dato?: IsoDatoString) => {
                        periode.validerOgSettFelt(nyIsoDatoPeriode(dato, periode.verdi.tom));
                    }}
                    visFeilmeldinger={false}
                    readOnly={lesevisning}
                />
                <DatovelgerForGammelSkjemaløsning
                    label={tomErPåkrevd ? 'T.o.m' : 'T.o.m (valgfri)'}
                    value={periode.verdi.tom}
                    readOnly={lesevisning}
                    onDateChange={(dato?: IsoDatoString) => {
                        periode.validerOgSettFelt(nyIsoDatoPeriode(periode.verdi.fom, dato));
                    }}
                    visFeilmeldinger={false}
                />
            </FlexDiv>
            {children}
        </MarginFieldset>
    );
};

export default VelgPeriode;

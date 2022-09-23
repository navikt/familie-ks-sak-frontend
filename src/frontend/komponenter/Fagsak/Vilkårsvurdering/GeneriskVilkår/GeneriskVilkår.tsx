import React, { useState } from 'react';

import styled from 'styled-components';

import { SkjemaGruppe } from 'nav-frontend-skjema';

import { AddCircle } from '@navikt/ds-icons';
import { Button, Heading } from '@navikt/ds-react';
import { NavdsSpacing5, NavdsSpacing8, NavdsSpacing16 } from '@navikt/ds-tokens/dist/tokens';

import { useBehandling } from '../../../../context/behandlingContext/BehandlingContext';
import type { IGrunnlagPerson } from '../../../../typer/person';
import { PersonType } from '../../../../typer/person';
import type { IVilkårConfig, IVilkårResultat } from '../../../../typer/vilkår';
import { Resultat, VilkårType } from '../../../../typer/vilkår';
import { useVilkårsvurderingApi } from '../useVilkårsvurderingApi';
import FjernUtvidetBarnetrygdVilkår from './FjernUtvidetBarnetrygdVilkår';
import VilkårTabell from './VilkårTabell';

interface IProps {
    person: IGrunnlagPerson;
    vilkårResultater: IVilkårResultat[];
    vilkårFraConfig: IVilkårConfig;
    generiskVilkårKey: string;
}

const Container = styled.div`
    margin-top: ${NavdsSpacing16};
    &:last-child {
        margin-bottom: ${NavdsSpacing8};
    }
`;

const UtførKnapp = styled(Button)`
    margin-top: ${NavdsSpacing5};
`;

const GeneriskVilkår: React.FC<IProps> = ({
    person,
    vilkårFraConfig,
    vilkårResultater,
    generiskVilkårKey,
}) => {
    const { erLesevisning } = useBehandling();
    const vilkårsvurderingApi = useVilkårsvurderingApi();

    const [visFeilmeldingerForVilkår, settVisFeilmeldingerForVilkår] = useState(false);

    const leggTilPeriodeKnappId = generiskVilkårKey + '__legg_til_periode';

    const settFokusPåLeggTilPeriodeKnapp = () => {
        document.getElementById(leggTilPeriodeKnappId)?.focus();
    };

    const skalViseLeggTilKnapp = () => {
        if (erLesevisning()) {
            return false;
        }
        const uvurdertPeriodePåVilkår = vilkårResultater.find(
            vilkår => vilkår.resultat === Resultat.IKKE_VURDERT
        );
        return uvurdertPeriodePåVilkår === undefined;
    };

    const skalViseFjernUtvidetBarnetrygdKnapp = () => {
        if (erLesevisning()) {
            return false;
        }
        const utvidetVilkår = vilkårResultater.filter(
            vilkårResultat => vilkårResultat.vilkårType === VilkårType.UTVIDET_BARNETRYGD
        );
        return (
            person.type === PersonType.SØKER &&
            vilkårFraConfig.key === VilkårType.UTVIDET_BARNETRYGD &&
            utvidetVilkår.length !== 0
        );
    };

    return (
        <Container>
            <SkjemaGruppe
                feil={
                    visFeilmeldingerForVilkår
                        ? vilkårsvurderingApi.opprettVilkårFeilmelding
                        : undefined
                }
            >
                <Heading size="medium" level="3">
                    {vilkårFraConfig.tittel}
                </Heading>
                <VilkårTabell
                    person={person}
                    vilkårFraConfig={vilkårFraConfig}
                    vilkårResultater={vilkårResultater}
                    settFokusPåKnapp={settFokusPåLeggTilPeriodeKnapp}
                />
                {skalViseLeggTilKnapp() && (
                    <UtførKnapp
                        onClick={() => {
                            vilkårsvurderingApi.opprettVilkår(
                                person.personIdent,
                                vilkårFraConfig.key as VilkårType,
                                () => {
                                    settVisFeilmeldingerForVilkår(true);
                                }
                            );
                        }}
                        id={leggTilPeriodeKnappId}
                        loading={vilkårsvurderingApi.oppretterVilkår}
                        disabled={vilkårsvurderingApi.oppretterVilkår}
                        variant="tertiary"
                        size="small"
                    >
                        <AddCircle />
                        Legg til periode
                    </UtførKnapp>
                )}
                {skalViseFjernUtvidetBarnetrygdKnapp() && (
                    <FjernUtvidetBarnetrygdVilkår
                        personIdent={person.personIdent}
                        slettVilkårId={generiskVilkårKey + '__slett-vilkår-utvidet'}
                    />
                )}
            </SkjemaGruppe>
        </Container>
    );
};

export default GeneriskVilkår;

import React, { useState } from 'react';

import deepEqual from 'deep-equal';
import styled from 'styled-components';

import { Normaltekst } from 'nav-frontend-typografi';

import { RessursStatus } from '@navikt/familie-typer';

import { useBehandling } from '../../../../context/behandlingContext/BehandlingContext';
import FamilieChevron from '../../../../ikoner/FamilieChevron';
import ManuellVurdering from '../../../../ikoner/ManuellVurdering';
import VilkårResultatIkon from '../../../../ikoner/VilkårResultatIkon';
import type { IGrunnlagPerson } from '../../../../typer/person';
import type { IAnnenVurderingConfig, IAnnenVurdering } from '../../../../typer/vilkår';
import { Resultat, uiResultat } from '../../../../typer/vilkår';
import IkonKnapp from '../../../Felleskomponenter/IkonKnapp/IkonKnapp';
import { AnnenVurderingSkjema } from './AnnenVurderingSkjema';
import { annenVurderingFeilmeldingId } from './AnnenVurderingTabell';

interface IProps {
    person: IGrunnlagPerson;
    annenVurderingConfig: IAnnenVurderingConfig;
    annenVurdering: IAnnenVurdering;
    visFeilmeldinger: boolean;
}

interface IEkspanderbarTrProps {
    ekspandert?: boolean;
}

const BeskrivelseCelle = styled(Normaltekst)`
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const VurderingCelle = styled.div`
    display: flex;
    svg {
        margin-right: 1rem;
    }
`;

const EkspanderbarTr = styled.tr`
    td {
        border-bottom: ${(props: IEkspanderbarTrProps) =>
            props.ekspandert ? 'none' : '1px solid rgba(0, 0, 0, 0.15)'} !important;
    }
`;

const EkspandertTd = styled.td`
    padding: 0 1rem 1rem 1.6rem;
`;

const AnnenVurderingTabellRad: React.FC<IProps> = ({
    person,
    annenVurderingConfig,
    annenVurdering,
}) => {
    const { erLesevisning, åpenBehandling } = useBehandling();

    const [ekspandertAnnenVurdering, settEkspandertAnnenVurdering] = useState(
        erLesevisning() || false || annenVurdering.resultat === Resultat.IKKE_VURDERT
    );
    const [redigerbartAnnenVurdering, settRedigerbartAnnenVurdering] =
        useState<IAnnenVurdering>(annenVurdering);

    const toggleForm = (visAlert: boolean) => {
        if (
            ekspandertAnnenVurdering &&
            visAlert &&
            !deepEqual(annenVurdering, redigerbartAnnenVurdering)
        ) {
            alert('Vurderingen har endringer som ikke er lagret!');
        } else {
            settEkspandertAnnenVurdering(!ekspandertAnnenVurdering);
            settRedigerbartAnnenVurdering(annenVurdering);
        }
    };

    return (
        <>
            <EkspanderbarTr {...{ ekspandert: ekspandertAnnenVurdering }}>
                <td>
                    <VurderingCelle>
                        <VilkårResultatIkon
                            resultat={annenVurdering.resultat}
                            width={20}
                            height={20}
                        />
                        <Normaltekst children={uiResultat[annenVurdering.resultat]} />
                    </VurderingCelle>
                </td>
                <td />
                <td>
                    <BeskrivelseCelle children={annenVurdering.begrunnelse} />
                </td>
                <td>
                    <IkonKnapp
                        erLesevisning={erLesevisning()}
                        onClick={() => toggleForm(true)}
                        id={annenVurderingFeilmeldingId(annenVurdering)}
                        label={
                            !ekspandertAnnenVurdering
                                ? annenVurdering.resultat === Resultat.IKKE_VURDERT
                                    ? 'Vurder'
                                    : 'Endre'
                                : 'Lukk'
                        }
                        mini={true}
                        ikon={<FamilieChevron retning={ekspandertAnnenVurdering ? 'opp' : 'ned'} />}
                    />
                </td>
                <td>
                    <ManuellVurdering />
                </td>
                <td>
                    <i>
                        {åpenBehandling.status === RessursStatus.SUKSESS && annenVurdering.erVurdert
                            ? 'Vurdert i denne behandlingen'
                            : ''}
                    </i>
                </td>
            </EkspanderbarTr>
            {ekspandertAnnenVurdering && (
                <tr>
                    <EkspandertTd colSpan={6}>
                        <AnnenVurderingSkjema
                            person={person}
                            annenVurderingConfig={annenVurderingConfig}
                            annenVurdering={annenVurdering}
                            toggleForm={toggleForm}
                            lesevinsing={erLesevisning()}
                        />
                    </EkspandertTd>
                </tr>
            )}
        </>
    );
};

export default AnnenVurderingTabellRad;

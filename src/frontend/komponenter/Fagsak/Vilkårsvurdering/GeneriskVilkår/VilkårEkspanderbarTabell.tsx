import React, { type ReactElement } from 'react';

import styled from 'styled-components';

import { CogIcon, CogRotationIcon, PersonIcon } from '@navikt/aksel-icons';
import { BodyShort, Table } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer';

import { useBehandling } from '../../../../context/behandlingContext/BehandlingContext';
import VilkårResultatIkon from '../../../../ikoner/VilkårResultatIkon';
import type { IVilkårResultat } from '../../../../typer/vilkår';
import { uiResultat } from '../../../../typer/vilkår';
import {
    Datoformat,
    isoStringTilFormatertString,
    isoDatoPeriodeTilFormatertString,
} from '../../../../utils/dato';
import { alleRegelverk } from '../../../../utils/vilkår';

interface IProps {
    toggleForm: (visAlert: boolean) => void;
    vilkårResultat: IVilkårResultat;
    ekspandertVilkår: boolean;
    children: ReactElement;
}

const BeskrivelseCelle = styled(BodyShort)`
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 20rem;
`;

const VurderingCelle = styled.div`
    display: flex;
    svg {
        margin-right: 1rem;
    }
`;

const FlexDiv = styled.div`
    display: flex;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;
    > div:nth-child(n + 2) {
        padding-left: 0.5rem;
    }
`;

const StyledCogIcon = styled(CogIcon)`
    font-size: 1.5rem;
    min-width: 1.5rem;
`;

const StyledCogRotationIcon = styled(CogRotationIcon)`
    font-size: 1.5rem;
    min-width: 1.5rem;
`;

const StyledPersonIcon = styled(PersonIcon)`
    font-size: 1.5rem;
    min-width: 1.5rem;
`;

const VilkårEkspanderbarTabell: React.FC<IProps> = ({
    toggleForm,
    children,
    vilkårResultat,
    ekspandertVilkår,
}) => {
    const { åpenBehandling } = useBehandling();

    const periodeErTom = !vilkårResultat.periode.fom && !vilkårResultat.periode.tom;

    return (
        <Table.ExpandableRow
            open={ekspandertVilkår}
            togglePlacement="right"
            onOpenChange={() => toggleForm(true)}
            content={children}
        >
            <Table.DataCell>
                <VurderingCelle>
                    <VilkårResultatIkon resultat={vilkårResultat.resultat} />
                    <BodyShort>{uiResultat[vilkårResultat.resultat]}</BodyShort>
                </VurderingCelle>
            </Table.DataCell>
            <Table.DataCell>
                <BodyShort>
                    {periodeErTom ? '-' : isoDatoPeriodeTilFormatertString(vilkårResultat.periode)}
                </BodyShort>
            </Table.DataCell>
            <Table.DataCell>
                <BeskrivelseCelle children={vilkårResultat.begrunnelse} />
            </Table.DataCell>
            <Table.DataCell>
                {vilkårResultat.vurderesEtter ? (
                    <FlexDiv>
                        {alleRegelverk[vilkårResultat.vurderesEtter].symbol}
                        <div>{alleRegelverk[vilkårResultat.vurderesEtter].tekst}</div>
                    </FlexDiv>
                ) : (
                    <FlexDiv>
                        <StyledCogIcon title={'Generell vurdering'} />
                        <div>Generell vurdering</div>
                    </FlexDiv>
                )}
            </Table.DataCell>
            <Table.DataCell>
                <FlexDiv>
                    {vilkårResultat.erAutomatiskVurdert ? (
                        <StyledCogRotationIcon title={'Automatisk Vurdering'} />
                    ) : (
                        <StyledPersonIcon title={'Manuell vurdering'} />
                    )}
                    <div>
                        {åpenBehandling.status === RessursStatus.SUKSESS && vilkårResultat.erVurdert
                            ? vilkårResultat.behandlingId === åpenBehandling.data.behandlingId
                                ? 'Vurdert i denne behandlingen'
                                : `Vurdert ${isoStringTilFormatertString({
                                      isoString: vilkårResultat.endretTidspunkt,
                                      tilFormat: Datoformat.DATO_FORKORTTET,
                                  })}`
                            : ''}
                    </div>
                </FlexDiv>
            </Table.DataCell>
        </Table.ExpandableRow>
    );
};

export default VilkårEkspanderbarTabell;

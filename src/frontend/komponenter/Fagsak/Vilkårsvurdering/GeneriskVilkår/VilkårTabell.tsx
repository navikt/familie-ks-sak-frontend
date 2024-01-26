import React from 'react';

import styled from 'styled-components';

import { Table } from '@navikt/ds-react';

import VilkårTabellRad from './VilkårTabellRad';
import type { IGrunnlagPerson } from '../../../../typer/person';
import type { IVilkårConfig, IVilkårResultat } from '../../../../typer/vilkår';

export const vilkårFeilmeldingId = (vilkårResultat: IVilkårResultat) =>
    `vilkår_${vilkårResultat.vilkårType}_${vilkårResultat.id}`;

export const vilkårBegrunnelseFeilmeldingId = (vilkårResultat: IVilkårResultat) =>
    `vilkår-begrunnelse_${vilkårResultat.vilkårType}_${vilkårResultat.id}`;

export const vilkårPeriodeFeilmeldingId = (vilkårResultat: IVilkårResultat) =>
    `vilkår-periode_${vilkårResultat.vilkårType}_${vilkårResultat.id}`;

interface IProps {
    person: IGrunnlagPerson;
    vilkårResultater: IVilkårResultat[];
    vilkårFraConfig: IVilkårConfig;
    settFokusPåKnapp: () => void;
}

const TabellHeader = styled(Table.HeaderCell)`
    &:nth-of-type(1) {
        width: 10rem;
    }
    &:nth-of-type(2) {
        width: 12rem;
    }
    &:nth-of-type(4) {
        width: 12rem;
    }
    &:nth-of-type(5) {
        width: 17rem;
    }
    &:nth-of-type(6) {
        width: 2.25rem;
    }
`;

const VilkårTabell: React.FC<IProps> = ({
    person,
    vilkårFraConfig,
    vilkårResultater,
    settFokusPåKnapp,
}) => {
    return (
        <Table>
            <Table.Header>
                <Table.Row>
                    <TabellHeader scope="col">Vurdering</TabellHeader>
                    <TabellHeader scope="col">Periode</TabellHeader>
                    <TabellHeader scope="col">Begrunnelse</TabellHeader>
                    <TabellHeader scope="col">Vurderes etter</TabellHeader>
                    <TabellHeader scope="col">Vurdert av</TabellHeader>
                    <TabellHeader />
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {vilkårResultater.map((vilkårResultat: IVilkårResultat, index: number) => {
                    return (
                        <VilkårTabellRad
                            key={`${index}_${person.fødselsdato}_${vilkårResultat.vilkårType}_${vilkårResultat.id}`}
                            vilkårFraConfig={vilkårFraConfig}
                            person={person}
                            vilkårResultat={vilkårResultat}
                            settFokusPåKnapp={settFokusPåKnapp}
                        />
                    );
                })}
            </Table.Body>
        </Table>
    );
};

export default VilkårTabell;

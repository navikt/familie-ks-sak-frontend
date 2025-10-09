import styled from 'styled-components';

import { Table } from '@navikt/ds-react';

import { Barnehageplass } from './Vilkår/Barnehageplass/Barnehageplass';
import { BarnetsAlder } from './Vilkår/BarnetsAlder/BarnetsAlder';
import { BorMedSøker } from './Vilkår/BorMedSøker/BorMedSøker';
import { BosattIRiket } from './Vilkår/BosattIRiket/BosattIRiket';
import { LovligOpphold } from './Vilkår/LovligOpphold/LovligOpphold';
import { Medlemskap } from './Vilkår/Medlemskap/Medlemskap';
import { MedlemskapAnnenForelder } from './Vilkår/MedlemskapAnnenForelder/MedlemskapAnnenForelder';
import type { IGrunnlagPerson } from '../../../../../../typer/person';
import { VilkårType, type IVilkårConfig, type IVilkårResultat } from '../../../../../../typer/vilkår';

export const vilkårFeilmeldingId = (vilkårResultat: IVilkårResultat) =>
    `vilkår_${vilkårResultat.vilkårType}_${vilkårResultat.id}`;

export const vilkårBegrunnelseFeilmeldingId = (vilkårResultat: IVilkårResultat) =>
    `vilkår-begrunnelse_${vilkårResultat.vilkårType}_${vilkårResultat.id}`;

interface IProps {
    person: IGrunnlagPerson;
    vilkårResultater: IVilkårResultat[];
    vilkårFraConfig: IVilkårConfig;
    settFokusPåLeggTilPeriodeKnapp: () => void;
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
    settFokusPåLeggTilPeriodeKnapp,
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
                    switch (vilkårResultat.vilkårType) {
                        case VilkårType.BOSATT_I_RIKET:
                            return (
                                <BosattIRiket
                                    key={`${index}_${person.fødselsdato}_${vilkårResultat.vilkårType}_${vilkårResultat.id}`}
                                    lagretVilkårResultat={vilkårResultat}
                                    vilkårFraConfig={vilkårFraConfig}
                                    person={person}
                                    settFokusPåLeggTilPeriodeKnapp={settFokusPåLeggTilPeriodeKnapp}
                                />
                            );
                        case VilkårType.LOVLIG_OPPHOLD:
                            return (
                                <LovligOpphold
                                    key={`${index}_${person.fødselsdato}_${vilkårResultat.vilkårType}_${vilkårResultat.id}`}
                                    lagretVilkårResultat={vilkårResultat}
                                    vilkårFraConfig={vilkårFraConfig}
                                    person={person}
                                    settFokusPåLeggTilPeriodeKnapp={settFokusPåLeggTilPeriodeKnapp}
                                />
                            );
                        case VilkårType.MEDLEMSKAP:
                            return (
                                <Medlemskap
                                    key={`${index}_${person.fødselsdato}_${vilkårResultat.vilkårType}_${vilkårResultat.id}`}
                                    lagretVilkårResultat={vilkårResultat}
                                    vilkårFraConfig={vilkårFraConfig}
                                    person={person}
                                    settFokusPåLeggTilPeriodeKnapp={settFokusPåLeggTilPeriodeKnapp}
                                />
                            );
                        case VilkårType.BARNEHAGEPLASS:
                            return (
                                <Barnehageplass
                                    key={`${index}_${person.fødselsdato}_${vilkårResultat.vilkårType}_${vilkårResultat.id}`}
                                    lagretVilkårResultat={vilkårResultat}
                                    vilkårFraConfig={vilkårFraConfig}
                                    person={person}
                                    settFokusPåLeggTilPeriodeKnapp={settFokusPåLeggTilPeriodeKnapp}
                                />
                            );
                        case VilkårType.MEDLEMSKAP_ANNEN_FORELDER:
                            return (
                                <MedlemskapAnnenForelder
                                    key={`${index}_${person.fødselsdato}_${vilkårResultat.vilkårType}_${vilkårResultat.id}`}
                                    lagretVilkårResultat={vilkårResultat}
                                    vilkårFraConfig={vilkårFraConfig}
                                    person={person}
                                    settFokusPåLeggTilPeriodeKnapp={settFokusPåLeggTilPeriodeKnapp}
                                />
                            );
                        case VilkårType.BOR_MED_SØKER:
                            return (
                                <BorMedSøker
                                    key={`${index}_${person.fødselsdato}_${vilkårResultat.vilkårType}_${vilkårResultat.id}`}
                                    lagretVilkårResultat={vilkårResultat}
                                    vilkårFraConfig={vilkårFraConfig}
                                    person={person}
                                    settFokusPåLeggTilPeriodeKnapp={settFokusPåLeggTilPeriodeKnapp}
                                />
                            );
                        case VilkårType.BARNETS_ALDER:
                            return (
                                <BarnetsAlder
                                    key={`${index}_${person.fødselsdato}_${vilkårResultat.vilkårType}_${vilkårResultat.id}`}
                                    lagretVilkårResultat={vilkårResultat}
                                    vilkårFraConfig={vilkårFraConfig}
                                    person={person}
                                    settFokusPåLeggTilPeriodeKnapp={settFokusPåLeggTilPeriodeKnapp}
                                />
                            );
                    }
                })}
            </Table.Body>
        </Table>
    );
};

export default VilkårTabell;

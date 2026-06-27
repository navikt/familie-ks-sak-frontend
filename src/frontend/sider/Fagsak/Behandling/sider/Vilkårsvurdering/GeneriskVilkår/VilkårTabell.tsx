import type { IGrunnlagPerson } from '@typer/person';
import { type IVilkårConfig, type IVilkårResultat, VilkårType } from '@typer/vilkår';

import { Box, Table } from '@navikt/ds-react';

import { Barnehageplass } from './Vilkår/Barnehageplass/Barnehageplass';
import { BarnetsAlder } from './Vilkår/BarnetsAlder/BarnetsAlder';
import { BorMedSøker } from './Vilkår/BorMedSøker/BorMedSøker';
import { BosattIRiket } from './Vilkår/BosattIRiket/BosattIRiket';
import { LovligOpphold } from './Vilkår/LovligOpphold/LovligOpphold';
import { Medlemskap } from './Vilkår/Medlemskap/Medlemskap';
import { MedlemskapAnnenForelder } from './Vilkår/MedlemskapAnnenForelder/MedlemskapAnnenForelder';
import Styles from './VilkårTabell.module.css';

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

const VilkårTabell = ({ person, vilkårFraConfig, vilkårResultater, settFokusPåLeggTilPeriodeKnapp }: IProps) => {
    return (
        <Box className={Styles.wrapper}>
            <Table className={Styles.table}>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell className={Styles.col1} scope={'col'}>
                            Vurdering
                        </Table.HeaderCell>
                        <Table.HeaderCell className={Styles.col2} scope={'col'}>
                            Periode
                        </Table.HeaderCell>
                        <Table.HeaderCell className={Styles.col3} scope={'col'}>
                            Begrunnelse
                        </Table.HeaderCell>
                        <Table.HeaderCell className={Styles.col4} scope={'col'}>
                            Vurderes etter
                        </Table.HeaderCell>
                        <Table.HeaderCell className={Styles.col5} scope={'col'}>
                            Vurdert av
                        </Table.HeaderCell>
                        <Table.HeaderCell className={Styles.col6} scope={'col'} />
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {vilkårResultater.map(vilkårResultat => {
                        switch (vilkårResultat.vilkårType) {
                            case VilkårType.BOSATT_I_RIKET:
                                return (
                                    <BosattIRiket
                                        key={vilkårResultat.id}
                                        lagretVilkårResultat={vilkårResultat}
                                        vilkårFraConfig={vilkårFraConfig}
                                        person={person}
                                        settFokusPåLeggTilPeriodeKnapp={settFokusPåLeggTilPeriodeKnapp}
                                    />
                                );
                            case VilkårType.LOVLIG_OPPHOLD:
                                return (
                                    <LovligOpphold
                                        key={vilkårResultat.id}
                                        lagretVilkårResultat={vilkårResultat}
                                        vilkårFraConfig={vilkårFraConfig}
                                        person={person}
                                        settFokusPåLeggTilPeriodeKnapp={settFokusPåLeggTilPeriodeKnapp}
                                    />
                                );
                            case VilkårType.MEDLEMSKAP:
                                return (
                                    <Medlemskap
                                        key={vilkårResultat.id}
                                        lagretVilkårResultat={vilkårResultat}
                                        vilkårFraConfig={vilkårFraConfig}
                                        person={person}
                                        settFokusPåLeggTilPeriodeKnapp={settFokusPåLeggTilPeriodeKnapp}
                                    />
                                );
                            case VilkårType.BARNEHAGEPLASS:
                                return (
                                    <Barnehageplass
                                        key={vilkårResultat.id}
                                        lagretVilkårResultat={vilkårResultat}
                                        vilkårFraConfig={vilkårFraConfig}
                                        person={person}
                                        settFokusPåLeggTilPeriodeKnapp={settFokusPåLeggTilPeriodeKnapp}
                                    />
                                );
                            case VilkårType.MEDLEMSKAP_ANNEN_FORELDER:
                                return (
                                    <MedlemskapAnnenForelder
                                        key={vilkårResultat.id}
                                        lagretVilkårResultat={vilkårResultat}
                                        vilkårFraConfig={vilkårFraConfig}
                                        person={person}
                                        settFokusPåLeggTilPeriodeKnapp={settFokusPåLeggTilPeriodeKnapp}
                                    />
                                );
                            case VilkårType.BOR_MED_SØKER:
                                return (
                                    <BorMedSøker
                                        key={vilkårResultat.id}
                                        lagretVilkårResultat={vilkårResultat}
                                        vilkårFraConfig={vilkårFraConfig}
                                        person={person}
                                        settFokusPåLeggTilPeriodeKnapp={settFokusPåLeggTilPeriodeKnapp}
                                    />
                                );
                            case VilkårType.BARNETS_ALDER:
                                return (
                                    <BarnetsAlder
                                        key={vilkårResultat.id}
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
        </Box>
    );
};

export default VilkårTabell;

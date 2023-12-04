import React, { useEffect, useState } from 'react';

import deepEqual from 'deep-equal';
import styled from 'styled-components';

import { AutomaticSystem, People, Settings } from '@navikt/ds-icons';
import { BodyShort, Table } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer';

import { Barnehageplass } from './Vilkår/Barnehageplass/Barnehageplass';
import { BarnetsAlder } from './Vilkår/BarnetsAlder/BarnetsAlder';
import { BorMedSøker } from './Vilkår/BorMedSøker/BorMedSøker';
import { BosattIRiket } from './Vilkår/BosattIRiket/BosattIRiket';
import { LovligOpphold } from './Vilkår/LovligOpphold/LovligOpphold';
import { Medlemskap } from './Vilkår/Medlemskap/Medlemskap';
import { MedlemskapAnnenForelder } from './Vilkår/MedlemskapAnnenForelder/MedlemskapAnnenForelder';
import { vilkårFeilmeldingId } from './VilkårTabell';
import { useApp } from '../../../../context/AppContext';
import { useBehandling } from '../../../../context/behandlingContext/BehandlingContext';
import VilkårResultatIkon from '../../../../ikoner/VilkårResultatIkon';
import type { IGrunnlagPerson } from '../../../../typer/person';
import { ToggleNavn } from '../../../../typer/toggles';
import type { IVilkårConfig, IVilkårResultat } from '../../../../typer/vilkår';
import { Resultat, uiResultat, VilkårType } from '../../../../typer/vilkår';
import { Datoformat } from '../../../../utils/dato';
import { formaterIsoDato } from '../../../../utils/formatter';
import { periodeToString } from '../../../../utils/kalender';
import { alleRegelverk } from '../../../../utils/vilkår';

interface IProps {
    person: IGrunnlagPerson;
    vilkårFraConfig: IVilkårConfig;
    vilkårResultat: IVilkårResultat;
    settFokusPåKnapp: () => void;
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

const VilkårTabellRad: React.FC<IProps> = ({ person, vilkårFraConfig, vilkårResultat }) => {
    const { toggles } = useApp();
    const { vurderErLesevisning, åpenBehandling, behandlingPåVent } = useBehandling();
    const erLesevisning = vurderErLesevisning();

    const hentInitiellEkspandering = () =>
        erLesevisning || vilkårResultat.resultat === Resultat.IKKE_VURDERT;

    const [ekspandertVilkår, settEkspandertVilkår] = useState(hentInitiellEkspandering());
    const [redigerbartVilkår, settRedigerbartVilkår] = useState<IVilkårResultat>(vilkårResultat);

    useEffect(() => {
        settEkspandertVilkår(hentInitiellEkspandering());
    }, [behandlingPåVent]);

    const periodeErTom = !redigerbartVilkår.periode.fom && !redigerbartVilkår.periode.tom;

    const toggleForm = (visAlert: boolean) => {
        if (ekspandertVilkår && visAlert && !deepEqual(vilkårResultat, redigerbartVilkår)) {
            alert('Vurderingen har endringer som ikke er lagret!');
        } else {
            settEkspandertVilkår(!ekspandertVilkår);
            settRedigerbartVilkår(vilkårResultat);
        }
    };

    const VilkårSkjema = () => {
        switch (vilkårResultat.vilkårType) {
            case VilkårType.BOSATT_I_RIKET:
                return (
                    <BosattIRiket
                        vilkårResultat={vilkårResultat}
                        vilkårFraConfig={vilkårFraConfig}
                        toggleForm={toggleForm}
                        person={person}
                        lesevisning={erLesevisning}
                    />
                );
            case VilkårType.LOVLIG_OPPHOLD:
                return (
                    <LovligOpphold
                        vilkårResultat={vilkårResultat}
                        vilkårFraConfig={vilkårFraConfig}
                        toggleForm={toggleForm}
                        person={person}
                        lesevisning={erLesevisning}
                    />
                );
            case VilkårType.MEDLEMSKAP:
                return (
                    <Medlemskap
                        vilkårResultat={vilkårResultat}
                        vilkårFraConfig={vilkårFraConfig}
                        toggleForm={toggleForm}
                        person={person}
                        lesevisning={erLesevisning}
                    />
                );
            case VilkårType.BARNEHAGEPLASS:
                return (
                    <Barnehageplass
                        vilkårResultat={vilkårResultat}
                        vilkårFraConfig={vilkårFraConfig}
                        toggleForm={toggleForm}
                        person={person}
                        lesevisning={erLesevisning}
                    />
                );
            case VilkårType.MEDLEMSKAP_ANNEN_FORELDER:
                return (
                    <MedlemskapAnnenForelder
                        vilkårResultat={vilkårResultat}
                        vilkårFraConfig={vilkårFraConfig}
                        toggleForm={toggleForm}
                        person={person}
                        lesevisning={erLesevisning}
                    />
                );
            case VilkårType.BOR_MED_SØKER:
                return (
                    <BorMedSøker
                        vilkårResultat={vilkårResultat}
                        vilkårFraConfig={vilkårFraConfig}
                        toggleForm={toggleForm}
                        person={person}
                        lesevisning={erLesevisning}
                    />
                );
            case VilkårType.BARNETS_ALDER:
                return (
                    <BarnetsAlder
                        vilkårResultat={vilkårResultat}
                        vilkårFraConfig={vilkårFraConfig}
                        toggleForm={toggleForm}
                        person={person}
                        lesevisning={erLesevisning}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <Table.ExpandableRow
            open={ekspandertVilkår}
            togglePlacement="right"
            onOpenChange={() => toggleForm(true)}
            id={vilkårFeilmeldingId(vilkårResultat)}
            content={VilkårSkjema()}
        >
            <Table.DataCell>
                <VurderingCelle>
                    <VilkårResultatIkon resultat={vilkårResultat.resultat} width={20} height={20} />
                    <BodyShort>{uiResultat[vilkårResultat.resultat]}</BodyShort>
                </VurderingCelle>
            </Table.DataCell>
            <Table.DataCell>
                <BodyShort>
                    {periodeErTom ? '-' : periodeToString(vilkårResultat.periode)}
                </BodyShort>
            </Table.DataCell>
            <Table.DataCell>
                <BeskrivelseCelle children={vilkårResultat.begrunnelse} />
            </Table.DataCell>
            <Table.DataCell>
                {toggles[ToggleNavn.brukEøs] &&
                    (redigerbartVilkår.vurderesEtter ? (
                        <FlexDiv>
                            {alleRegelverk[redigerbartVilkår.vurderesEtter].symbol}
                            <div>{alleRegelverk[redigerbartVilkår.vurderesEtter].tekst}</div>
                        </FlexDiv>
                    ) : (
                        <FlexDiv>
                            <Settings width={24} height={24} viewBox={'0 0 24 24'} />
                            <div>Generell vurdering</div>
                        </FlexDiv>
                    ))}
            </Table.DataCell>
            <Table.DataCell>
                <FlexDiv>
                    {vilkårResultat.erAutomatiskVurdert ? (
                        <AutomaticSystem
                            width={24}
                            height={24}
                            aria-labelledby={'Automatisk Vurdering'}
                            viewBox={'0 0 24 24'}
                        />
                    ) : (
                        <People
                            width={24}
                            height={24}
                            aria-labelledby={'ManuellVurdering'}
                            viewBox={'0 0 24 24'}
                        />
                    )}
                    <div>
                        {åpenBehandling.status === RessursStatus.SUKSESS && vilkårResultat.erVurdert
                            ? vilkårResultat.behandlingId === åpenBehandling.data.behandlingId
                                ? 'Vurdert i denne behandlingen'
                                : `Vurdert ${formaterIsoDato(
                                      vilkårResultat.endretTidspunkt,
                                      Datoformat.DATO_FORKORTTET
                                  )}`
                            : ''}
                    </div>
                </FlexDiv>
            </Table.DataCell>
        </Table.ExpandableRow>
    );
};

export default VilkårTabellRad;

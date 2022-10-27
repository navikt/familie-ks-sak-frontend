import React, { useEffect, useState } from 'react';

import { Collapse } from 'react-collapse';
import styled from 'styled-components';

import { ExpandFilled, CollapseFilled } from '@navikt/ds-icons';
import { Alert, Button } from '@navikt/ds-react';
import { NavdsSpacing14, NavdsSpacing8 } from '@navikt/ds-tokens/dist/tokens';

import { useBehandling } from '../../../context/behandlingContext/BehandlingContext';
import { useVilkårsvurdering } from '../../../context/Vilkårsvurdering/VilkårsvurderingContext';
import { PersonType } from '../../../typer/person';
import type { IPersonResultat, IVilkårConfig, IVilkårResultat } from '../../../typer/vilkår';
import { vilkårConfig, Resultat, annenVurderingConfig } from '../../../typer/vilkår';
import PersonInformasjon from '../../Felleskomponenter/PersonInformasjon/PersonInformasjon';
import GeneriskAnnenVurdering from './GeneriskAnnenVurdering/GeneriskAnnenVurdering';
import GeneriskVilkår from './GeneriskVilkår/GeneriskVilkår';
import Registeropplysninger from './Registeropplysninger/Registeropplysninger';

const PersonLinje = styled.div`
    display: flex;
    justify-content: space-between;
    position: -webkit-sticky;
    position: sticky;
    top: -1px;
    z-index: 3;
    background-color: white;
    padding: ${NavdsSpacing8} 0;
`;

const IndentertInnhold = styled.div`
    padding-left: ${NavdsSpacing14};
`;

const VilkårsvurderingSkjema: React.FunctionComponent = () => {
    const { vilkårsvurdering } = useVilkårsvurdering();
    const { erLesevisning, behandlingPåVent } = useBehandling();

    const personHarIkkevurdertVilkår = (personResultat: IPersonResultat) =>
        personResultat.vilkårResultater.some(
            vilkårResultatFelt => vilkårResultatFelt.resultat === Resultat.IKKE_VURDERT
        );

    const hentEkspantdertePersoner = () =>
        vilkårsvurdering.reduce(
            (personMapEkspandert, personResultat) => ({
                ...personMapEkspandert,
                [personResultat.personIdent]:
                    erLesevisning() || personHarIkkevurdertVilkår(personResultat),
            }),
            {}
        );

    const [personErEkspandert, settPersonErEkspandert] = useState<{ [key: string]: boolean }>(
        hentEkspantdertePersoner()
    );

    useEffect(() => {
        settPersonErEkspandert(hentEkspantdertePersoner());
    }, [behandlingPåVent]);

    return (
        <>
            {vilkårsvurdering.map((personResultat: IPersonResultat, index: number) => {
                const andreVurderinger = personResultat.andreVurderinger;
                return (
                    <div
                        key={`${index}_${personResultat.person.fødselsdato}`}
                        id={`${index}_${personResultat.person.fødselsdato}`}
                    >
                        <PersonLinje>
                            <PersonInformasjon person={personResultat.person} somOverskrift />
                            <Button
                                id={`vis-skjul-vilkårsvurdering-${index}_${personResultat.person.fødselsdato}}`}
                                variant="tertiary"
                                onClick={() =>
                                    settPersonErEkspandert({
                                        ...personErEkspandert,
                                        [personResultat.personIdent]:
                                            !personErEkspandert[personResultat.personIdent],
                                    })
                                }
                            >
                                {personErEkspandert[personResultat.personIdent] ? (
                                    <>
                                        Skjul vilkårsvurdering
                                        <CollapseFilled />
                                    </>
                                ) : (
                                    <>
                                        Vis vilkårsvurdering
                                        <ExpandFilled />
                                    </>
                                )}
                            </Button>
                        </PersonLinje>

                        <Collapse isOpened={personErEkspandert[personResultat.personIdent]}>
                            <IndentertInnhold>
                                <>
                                    {personResultat.person.registerhistorikk ? (
                                        <Registeropplysninger
                                            opplysninger={personResultat.person.registerhistorikk}
                                        />
                                    ) : (
                                        <Alert
                                            variant="warning"
                                            children={'Klarte ikke hente registeropplysninger'}
                                        />
                                    )}
                                </>
                                {Object.values(vilkårConfig)
                                    .filter((vc: IVilkårConfig) =>
                                        vc.parterDetteGjelderFor.includes(
                                            personResultat.person.type
                                        )
                                    )
                                    .map((vc: IVilkårConfig) => {
                                        const vilkårResultater: IVilkårResultat[] =
                                            personResultat.vilkårResultater.filter(
                                                (vilkårResultat: IVilkårResultat) =>
                                                    vilkårResultat.vilkårType === vc.key
                                            );

                                        if (
                                            vilkårResultater.length === 0 &&
                                            personResultat.person.type === PersonType.SØKER
                                        )
                                            return undefined;
                                        // For barn ønsker vi alltid å rendre alle vilkår slik at man evt kan legge til tom periode
                                        else
                                            return (
                                                <GeneriskVilkår
                                                    key={`${index}_${personResultat.person.fødselsdato}_${vc.key}`}
                                                    generiskVilkårKey={`${index}_${personResultat.person.fødselsdato}_${vc.key}`}
                                                    person={personResultat.person}
                                                    vilkårResultater={vilkårResultater}
                                                    vilkårFraConfig={vc}
                                                />
                                            );
                                    })}
                                {andreVurderinger.length > 0 &&
                                    Object.values(annenVurderingConfig)
                                        .filter(annenVurderingConfig =>
                                            annenVurderingConfig.parterDetteGjelderFor.includes(
                                                personResultat.person.type
                                            )
                                        )
                                        .map(annenVurderingConfig => (
                                            <GeneriskAnnenVurdering
                                                key={`${index}_${personResultat.person.fødselsdato}_${annenVurderingConfig.key}`}
                                                person={personResultat.person}
                                                andreVurderinger={personResultat.andreVurderinger}
                                                annenVurderingConfig={annenVurderingConfig}
                                            />
                                        ))}
                            </IndentertInnhold>
                        </Collapse>
                    </div>
                );
            })}
        </>
    );
};

export default VilkårsvurderingSkjema;

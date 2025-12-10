import { Activity, useEffect, useState } from 'react';

import { ChevronDownIcon, ChevronUpIcon } from '@navikt/aksel-icons';
import { Alert, Box, Button, HStack } from '@navikt/ds-react';

import GeneriskAnnenVurdering from './GeneriskAnnenVurdering/GeneriskAnnenVurdering';
import GeneriskVilkår from './GeneriskVilkår/GeneriskVilkår';
import Registeropplysninger from './Registeropplysninger/Registeropplysninger';
import { useVilkårsvurderingContext } from './VilkårsvurderingContext';
import styles from './VilkårsvurderingSkjema.module.css';
import PersonInformasjon from '../../../../../komponenter/PersonInformasjon/PersonInformasjon';
import { PersonType } from '../../../../../typer/person';
import type { IPersonResultat, IVilkårConfig, IVilkårResultat } from '../../../../../typer/vilkår';
import { annenVurderingConfig, Resultat, vilkårConfig } from '../../../../../typer/vilkår';
import { useBehandlingContext } from '../../context/BehandlingContext';

const VilkårsvurderingSkjema = () => {
    const { vilkårsvurdering } = useVilkårsvurderingContext();
    const { vurderErLesevisning, behandlingPåVent } = useBehandlingContext();

    const personHarIkkevurdertVilkår = (personResultat: IPersonResultat) =>
        personResultat.vilkårResultater.some(
            vilkårResultatFelt => vilkårResultatFelt.resultat === Resultat.IKKE_VURDERT
        );

    const hentEkspantdertePersoner = () =>
        vilkårsvurdering.reduce(
            (personMapEkspandert, personResultat) => ({
                ...personMapEkspandert,
                [personResultat.personIdent]: vurderErLesevisning() || personHarIkkevurdertVilkår(personResultat),
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
                        <HStack
                            paddingBlock={'space-32'}
                            className={styles.personlinje}
                            justify={'space-between'}
                            wrap={false}
                        >
                            <PersonInformasjon person={personResultat.person} somOverskrift />
                            <Button
                                id={`vis-skjul-vilkårsvurdering-${index}_${personResultat.person.fødselsdato}}`}
                                variant="tertiary"
                                onClick={() =>
                                    settPersonErEkspandert({
                                        ...personErEkspandert,
                                        [personResultat.personIdent]: !personErEkspandert[personResultat.personIdent],
                                    })
                                }
                                icon={
                                    personErEkspandert[personResultat.personIdent] ? (
                                        <ChevronUpIcon aria-hidden />
                                    ) : (
                                        <ChevronDownIcon aria-hidden />
                                    )
                                }
                                iconPosition="right"
                            >
                                {personErEkspandert[personResultat.personIdent]
                                    ? 'Skjul vilkårsvurdering'
                                    : 'Vis vilkårsvurdering'}
                            </Button>
                        </HStack>
                        <Activity mode={personErEkspandert[personResultat.personIdent] ? 'visible' : 'hidden'}>
                            <Box paddingInline={'space-56 space-0'}>
                                <>
                                    {personResultat.person.registerhistorikk ? (
                                        <Registeropplysninger
                                            opplysninger={personResultat.person.registerhistorikk}
                                            fødselsdato={personResultat.person.fødselsdato}
                                        />
                                    ) : (
                                        <Alert variant="warning" children={'Klarte ikke hente registeropplysninger'} />
                                    )}
                                </>
                                {Object.values(vilkårConfig)
                                    .filter((vc: IVilkårConfig) =>
                                        vc.parterDetteGjelderFor.includes(personResultat.person.type)
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
                            </Box>
                        </Activity>
                    </div>
                );
            })}
        </>
    );
};

export default VilkårsvurderingSkjema;

import { Activity } from 'react';

import { useErLesevisning } from '@hooks/useErLesevisning';
import { Skjermstørrelse, useSkjermstørrelse } from '@hooks/useSkjermstørrelse';
import { PersonInformasjon } from '@komponenter/PersonInformasjon/PersonInformasjon';
import { EkspanderVilkårsvurderingProvider } from '@sider/Fagsak/Behandling/sider/Vilkårsvurdering/EkspanderVilkårsvurderingContext';
import { PersonType } from '@typer/person';
import {
    annenVurderingConfig,
    harPersonIkkeVurdertVilkår,
    type IVilkårConfig,
    type IVilkårResultat,
    vilkårConfig,
} from '@typer/vilkår';

import { ChevronDownIcon, ChevronUpIcon } from '@navikt/aksel-icons';
import { Box, Button, HStack, LocalAlert } from '@navikt/ds-react';

import GeneriskAnnenVurdering from './GeneriskAnnenVurdering/GeneriskAnnenVurdering';
import GeneriskVilkår from './GeneriskVilkår/GeneriskVilkår';
import Registeropplysninger from './Registeropplysninger/Registeropplysninger';
import { useVilkårsvurderingContext } from './VilkårsvurderingContext';
import styles from './VilkårsvurderingSkjema.module.css';

const VilkårsvurderingSkjema = () => {
    const { vilkårsvurdering } = useVilkårsvurderingContext();

    const skjermstørrelse = useSkjermstørrelse();
    const erLesevisning = useErLesevisning();

    return (
        <>
            {vilkårsvurdering.map((personResultat, index) => {
                const andreVurderinger = personResultat.andreVurderinger;
                return (
                    <EkspanderVilkårsvurderingProvider
                        key={personResultat.person.personIdent}
                        starterEkspandert={erLesevisning || harPersonIkkeVurdertVilkår(personResultat)}
                    >
                        {({ ekspandert, ekspander }) => (
                            <div id={`${index}_${personResultat.person.fødselsdato}`}>
                                <HStack
                                    gap={'space-8'}
                                    justify={'space-between'}
                                    wrap={true}
                                    className={styles.personlinje}
                                    paddingBlock={'space-32'}
                                >
                                    <PersonInformasjon person={personResultat.person} />
                                    <Button
                                        variant={'tertiary'}
                                        size={skjermstørrelse > Skjermstørrelse.XL ? 'medium' : 'small'}
                                        onClick={ekspander}
                                        icon={
                                            ekspandert ? <ChevronUpIcon aria-hidden /> : <ChevronDownIcon aria-hidden />
                                        }
                                        iconPosition={'right'}
                                    >
                                        {ekspandert ? 'Skjul vilkårsvurdering' : 'Vis vilkårsvurdering'}
                                    </Button>
                                </HStack>
                                <Activity mode={ekspandert ? 'visible' : 'hidden'}>
                                    <Box
                                        paddingInline={
                                            skjermstørrelse > Skjermstørrelse.XL ? 'space-56 space-0' : 'space-0'
                                        }
                                    >
                                        {' '}
                                        <>
                                            {personResultat.person.registerhistorikk ? (
                                                <Registeropplysninger
                                                    opplysninger={personResultat.person.registerhistorikk}
                                                    fødselsdato={personResultat.person.fødselsdato}
                                                />
                                            ) : (
                                                <LocalAlert status="warning">
                                                    <LocalAlert.Header>
                                                        <LocalAlert.Title>
                                                            Klarte ikke hente registeropplysninger
                                                        </LocalAlert.Title>
                                                    </LocalAlert.Header>
                                                </LocalAlert>
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
                        )}
                    </EkspanderVilkårsvurderingProvider>
                );
            })}
        </>
    );
};

export default VilkårsvurderingSkjema;

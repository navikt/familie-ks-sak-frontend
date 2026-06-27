import { Activity } from 'react';

import { Skjermstørrelse, useSkjermstørrelse } from '@hooks/useSkjermstørrelse';
import { PersonInformasjon } from '@komponenter/PersonInformasjon/PersonInformasjon';
import { useEkspanderbareVilkårsvurderingPaneler } from '@sider/Fagsak/Behandling/sider/Vilkårsvurdering/EkspanderbareVilkårsvurderingPanelerContext';
import { PersonType } from '@typer/person';
import { annenVurderingConfig, type IVilkårConfig, type IVilkårResultat, vilkårConfig } from '@typer/vilkår';

import { ChevronDownIcon, ChevronUpIcon } from '@navikt/aksel-icons';
import { Box, Button, LocalAlert, Stack } from '@navikt/ds-react';

import GeneriskAnnenVurdering from './GeneriskAnnenVurdering/GeneriskAnnenVurdering';
import GeneriskVilkår from './GeneriskVilkår/GeneriskVilkår';
import Registeropplysninger from './Registeropplysninger/Registeropplysninger';
import { useVilkårsvurderingContext } from './VilkårsvurderingContext';
import styles from './VilkårsvurderingSkjema.module.css';

const VilkårsvurderingSkjema = () => {
    const { vilkårsvurdering } = useVilkårsvurderingContext();

    const { erPanelEkspandert, togglePanel } = useEkspanderbareVilkårsvurderingPaneler();
    const skjermstørrelse = useSkjermstørrelse();

    const erStorSkjerm = skjermstørrelse > Skjermstørrelse['2XL'];

    return (
        <>
            {vilkårsvurdering.map((personResultat, index) => {
                const skrollHash = `${index}_${personResultat.person.fødselsdato}`;
                const ident = personResultat.person.personIdent;
                const andreVurderinger = personResultat.andreVurderinger;
                const erEkspandert = erPanelEkspandert(ident);
                return (
                    <div key={ident} id={skrollHash}>
                        <Stack
                            direction={erStorSkjerm ? 'row' : 'column'}
                            gap={'space-8'}
                            justify={'space-between'}
                            wrap={true}
                            className={styles.personlinje}
                            paddingBlock={'space-32'}
                        >
                            <PersonInformasjon person={personResultat.person} />
                            <div>
                                <Button
                                    variant={'tertiary'}
                                    size={erStorSkjerm ? 'medium' : 'small'}
                                    onClick={() => togglePanel(ident)}
                                    icon={
                                        erEkspandert ? <ChevronUpIcon aria-hidden /> : <ChevronDownIcon aria-hidden />
                                    }
                                    iconPosition={'right'}
                                >
                                    {erEkspandert ? 'Skjul vilkårsvurdering' : 'Vis vilkårsvurdering'}
                                </Button>
                            </div>
                        </Stack>
                        <Activity mode={erEkspandert ? 'visible' : 'hidden'}>
                            <Box paddingInline={erStorSkjerm ? 'space-56 space-0' : 'space-0'}>
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
                                                    key={vc.key}
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
                                                key={annenVurderingConfig.key}
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

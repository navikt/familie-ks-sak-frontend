import type { PropsWithChildren, ReactNode } from 'react';

import { useBehandling } from '@hooks/useBehandling';
import { useErLesevisning } from '@hooks/useErLesevisning';
import { useSlettVilkårResultatError } from '@hooks/useSlettVilkårResultatError';
import { useEkspanderbarVilkårResultatRad } from '@sider/Fagsak/Behandling/sider/Vilkårsvurdering/EkspanderbareVilkårResultatRaderContext';
import { BehandlingÅrsak } from '@typer/behandling';
import type { IGrunnlagPerson } from '@typer/person';
import {
    type IVilkårConfig,
    type IVilkårResultat,
    type Regelverk,
    Resultat,
    type UtdypendeVilkårsvurdering,
} from '@typer/vilkår';
import type { IIsoDatoPeriode, IsoDatoString } from '@utils/dato';
import { useFormContext, useWatch } from 'react-hook-form';

import { Button, ErrorMessage, Fieldset, HStack, VStack } from '@navikt/ds-react';

import { AvslagBegrunnelserFelt } from './AvslagBegrunnelserFelt';
import { BegrunnelseFelt } from './BegrunnelseFelt';
import { ErEksplisittAvslagPåSøknadFelt } from './ErEksplisittAvslagPåSøknadFelt';
import { PeriodeFelt } from './PeriodeFelt';
import { ResultatFelt } from './ResultatFelt';
import { SlettVilkårResultat } from './SlettVilkårResultat';
import { VilkårResultatFelt, type VilkårResultatFormValues } from './useVilkårResultatSkjema';
import { UtdypendeVilkårsvurderingerFelt } from './UtdypendeVilkårsvurderingerFelt';
import { VurderesEtterFelt } from './VurderesEtterFelt';
import { SkjemaRamme } from '../SkjemaRamme';

export interface VilkårProps {
    lagretVilkårResultat: IVilkårResultat;
    vilkårFraConfig: IVilkårConfig;
    person: IGrunnlagPerson;
    settFokusPåLeggTilPeriodeKnapp: () => void;
}

interface Props extends PropsWithChildren {
    lagretVilkårResultat: IVilkårResultat;
    vilkårFraConfig: IVilkårConfig;
    person: IGrunnlagPerson;
    visVurderesEtter?: boolean;
    onVurderesEtterEndret?: (vurderesEtter: Regelverk) => void;
    visSpørsmål?: boolean;
    muligeUtdypendeVilkårsvurderinger?: UtdypendeVilkårsvurdering[];
    onUtdypendeVilkårsvurderingerEndret?: (utdypendeVilkårsvurderinger: UtdypendeVilkårsvurdering[]) => void;
    utdypendeVilkårsvurderingChildren?: ReactNode;
    periodeChildren?: ReactNode;
    onPeriodeEndret?: (periode: IIsoDatoPeriode) => void;
    førsteLagredeFom?: IsoDatoString;
    validerBegrunnelse?: (begrunnelse: string, formValues: VilkårResultatFormValues) => string | undefined;
}

export function VilkårSkjema({
    lagretVilkårResultat,
    vilkårFraConfig,
    person,
    visVurderesEtter = false,
    onVurderesEtterEndret,
    visSpørsmål = false,
    muligeUtdypendeVilkårsvurderinger = [],
    onUtdypendeVilkårsvurderingerEndret,
    utdypendeVilkårsvurderingChildren,
    periodeChildren,
    onPeriodeEndret,
    førsteLagredeFom,
    validerBegrunnelse,
    children,
}: Props) {
    const behandling = useBehandling();
    const erLesevisning = useErLesevisning();

    const slettVilkårResultatError = useSlettVilkårResultatError(lagretVilkårResultat.id);
    const { kollapsRad } = useEkspanderbarVilkårResultatRad(lagretVilkårResultat.id);

    const {
        control,
        reset,
        formState: { isSubmitting, errors },
    } = useFormContext<VilkårResultatFormValues>();

    const resultat = useWatch({ control, name: VilkårResultatFelt.RESULTAT });
    const erEksplisittAvslagPåSøknad = useWatch({ control, name: VilkårResultatFelt.ER_EKSPLISITT_AVSLAG_PÅ_SØKNAD });

    const årsakErSøknad = behandling.årsak === BehandlingÅrsak.SØKNAD;

    const feilmeldinger = [
        { id: 'lagre', feilmelding: errors.root?.message },
        { id: 'slett', feilmelding: slettVilkårResultatError?.message },
    ].filter(({ feilmelding }) => !!feilmelding);

    return (
        <Fieldset
            legend={'Endre vilkår'}
            hideLegend
            error={
                feilmeldinger.length > 0 ? (
                    <VStack gap={'space-16'}>
                        {feilmeldinger.map(({ id, feilmelding }) => (
                            <ErrorMessage key={id}>{feilmelding}</ErrorMessage>
                        ))}
                    </VStack>
                ) : undefined
            }
            errorPropagation={false}
        >
            <SkjemaRamme lesevisning={erLesevisning} resultat={lagretVilkårResultat.resultat}>
                {visVurderesEtter && <VurderesEtterFelt onEndret={onVurderesEtterEndret} />}
                {visSpørsmål && (
                    <ResultatFelt
                        legend={vilkårFraConfig.spørsmål ? vilkårFraConfig.spørsmål(person.type.toLowerCase()) : ''}
                    />
                )}
                {children}
                <UtdypendeVilkårsvurderingerFelt
                    vilkårType={lagretVilkårResultat.vilkårType}
                    muligeUtdypendeVilkårsvurderinger={muligeUtdypendeVilkårsvurderinger}
                    onEndret={onUtdypendeVilkårsvurderingerEndret}
                />
                {utdypendeVilkårsvurderingChildren}
                {resultat === Resultat.IKKE_OPPFYLT && årsakErSøknad && (
                    <>
                        <ErEksplisittAvslagPåSøknadFelt />
                        {erEksplisittAvslagPåSøknad && (
                            <AvslagBegrunnelserFelt
                                vilkårResultatId={lagretVilkårResultat.id}
                                vilkårType={lagretVilkårResultat.vilkårType}
                            />
                        )}
                    </>
                )}
                <PeriodeFelt
                    key={`${lagretVilkårResultat.endretTidspunkt}_${lagretVilkårResultat.periode.fom}_${lagretVilkårResultat.periode.tom}`}
                    person={person}
                    vilkårType={lagretVilkårResultat.vilkårType}
                    førsteLagredeFom={førsteLagredeFom}
                    onEndret={onPeriodeEndret}
                >
                    {periodeChildren}
                </PeriodeFelt>
                <BegrunnelseFelt
                    personType={person.type}
                    vilkårType={lagretVilkårResultat.vilkårType}
                    valider={validerBegrunnelse}
                />
                {!erLesevisning && (
                    <HStack justify={'space-between'} marginBlock={'space-16'}>
                        <HStack gap={'space-16'}>
                            <Button type={'submit'} size={'medium'} variant={'secondary'} loading={isSubmitting}>
                                Ferdig
                            </Button>
                            <Button
                                type={'button'}
                                onClick={() => {
                                    reset();
                                    kollapsRad();
                                }}
                                size={'medium'}
                                variant={'tertiary'}
                            >
                                Avbryt
                            </Button>
                        </HStack>
                        <SlettVilkårResultat personIdent={person.personIdent} vilkårResultat={lagretVilkårResultat} />
                    </HStack>
                )}
            </SkjemaRamme>
        </Fieldset>
    );
}

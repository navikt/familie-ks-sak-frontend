import { useMemo } from 'react';

import { useConfirmBrowserRefresh } from '@hooks/useConfirmBrowserRefresh';
import { useOnFormSubmitSuccessful } from '@hooks/useOnFormSubmitSuccessful';
import { useOppdaterVilkårResultat } from '@hooks/useOppdaterVilkårResultat';
import { useBehandlingContext } from '@sider/Fagsak/Behandling/context/BehandlingContext';
import { useEkspanderbarVilkårResultatRad } from '@sider/Fagsak/Behandling/sider/Vilkårsvurdering/EkspanderbareVilkårResultatRaderContext';
import type { IGrunnlagPerson } from '@typer/person';
import type { Begrunnelse } from '@typer/vedtak';
import {
    type IEndreVilkårResultat,
    type IVilkårResultat,
    type Regelverk,
    type Resultat,
    type UtdypendeVilkårsvurdering,
    UtdypendeVilkårsvurderingGenerell,
    VilkårType,
} from '@typer/vilkår';
import { dateTilIsoDatoStringEllerUndefined, type IIsoDatoPeriode } from '@utils/dato';
import { startOfDay } from 'date-fns';
import { useForm } from 'react-hook-form';

import { byggSuksessRessurs } from '@navikt/familie-typer';

import { utledHarBarnehageplass } from './Vilkår/Barnehageplass/BarnehageplassUtils';

export enum VilkårResultatFelt {
    VURDERES_ETTER = 'vurderesEtter',
    RESULTAT = 'resultat',
    UTDYPENDE_VILKÅRSVURDERINGER = 'utdypendeVilkårsvurderinger',
    ER_EKSPLISITT_AVSLAG_PÅ_SØKNAD = 'erEksplisittAvslagPåSøknad',
    AVSLAG_BEGRUNNELSER = 'avslagBegrunnelser',
    PERIODE = 'periode',
    BEGRUNNELSE = 'begrunnelse',
    ANTALL_TIMER = 'antallTimer',
    HAR_BARNEHAGEPLASS = 'harBarnehageplass',
    SØKER_HAR_MELDT_FRA_OM_BARNEHAGEPLASS = 'søkerHarMeldtFraOmBarnehageplass',
    ADOPSJONSDATO = 'adopsjonsdato',
}

export interface VilkårResultatFormValues {
    [VilkårResultatFelt.VURDERES_ETTER]: Regelverk | null;
    [VilkårResultatFelt.RESULTAT]: Resultat;
    [VilkårResultatFelt.UTDYPENDE_VILKÅRSVURDERINGER]: UtdypendeVilkårsvurdering[];
    [VilkårResultatFelt.ER_EKSPLISITT_AVSLAG_PÅ_SØKNAD]: boolean;
    [VilkårResultatFelt.AVSLAG_BEGRUNNELSER]: Begrunnelse[];
    [VilkårResultatFelt.PERIODE]: IIsoDatoPeriode;
    [VilkårResultatFelt.BEGRUNNELSE]: string;
    [VilkårResultatFelt.ANTALL_TIMER]: string;
    [VilkårResultatFelt.HAR_BARNEHAGEPLASS]: boolean | null;
    [VilkårResultatFelt.SØKER_HAR_MELDT_FRA_OM_BARNEHAGEPLASS]: boolean;
    [VilkårResultatFelt.ADOPSJONSDATO]: Date | null;
}

export function utledAdopsjonsdatoFraPerson(person: IGrunnlagPerson): Date | null {
    return person.adopsjonsdato ? startOfDay(new Date(person.adopsjonsdato)) : null;
}

export function lagVilkårResultatFormValues(
    lagretVilkårResultat: IVilkårResultat,
    person: IGrunnlagPerson
): VilkårResultatFormValues {
    return {
        [VilkårResultatFelt.VURDERES_ETTER]: lagretVilkårResultat.vurderesEtter ?? null,
        [VilkårResultatFelt.RESULTAT]: lagretVilkårResultat.resultat,
        [VilkårResultatFelt.UTDYPENDE_VILKÅRSVURDERINGER]: lagretVilkårResultat.utdypendeVilkårsvurderinger,
        [VilkårResultatFelt.ER_EKSPLISITT_AVSLAG_PÅ_SØKNAD]: lagretVilkårResultat.erEksplisittAvslagPåSøknad ?? false,
        [VilkårResultatFelt.AVSLAG_BEGRUNNELSER]: lagretVilkårResultat.avslagBegrunnelser,
        [VilkårResultatFelt.PERIODE]: lagretVilkårResultat.periode,
        [VilkårResultatFelt.BEGRUNNELSE]: lagretVilkårResultat.begrunnelse ?? '',
        [VilkårResultatFelt.ANTALL_TIMER]: lagretVilkårResultat.antallTimer?.toString() ?? '',
        [VilkårResultatFelt.HAR_BARNEHAGEPLASS]: utledHarBarnehageplass(lagretVilkårResultat),
        [VilkårResultatFelt.SØKER_HAR_MELDT_FRA_OM_BARNEHAGEPLASS]:
            lagretVilkårResultat.søkerHarMeldtFraOmBarnehageplass ?? false,
        [VilkårResultatFelt.ADOPSJONSDATO]: utledAdopsjonsdatoFraPerson(person),
    };
}

export function tilEndreVilkårResultat(
    lagretVilkårResultat: IVilkårResultat,
    person: IGrunnlagPerson,
    values: VilkårResultatFormValues
): IEndreVilkårResultat {
    const erAdopsjon = values.utdypendeVilkårsvurderinger.includes(UtdypendeVilkårsvurderingGenerell.ADOPSJON);
    const erBarnehageplass = lagretVilkårResultat.vilkårType === VilkårType.BARNEHAGEPLASS;
    return {
        personIdent: person.personIdent,
        adopsjonsdato: erAdopsjon ? dateTilIsoDatoStringEllerUndefined(values.adopsjonsdato) : undefined,
        endretVilkårResultat: {
            id: lagretVilkårResultat.id,
            behandlingId: lagretVilkårResultat.behandlingId,
            endretAv: lagretVilkårResultat.endretAv,
            endretTidspunkt: lagretVilkårResultat.endretTidspunkt,
            erAutomatiskVurdert: lagretVilkårResultat.erAutomatiskVurdert,
            erVurdert: lagretVilkårResultat.erVurdert,
            vilkårType: lagretVilkårResultat.vilkårType,
            begrunnelse: values.begrunnelse,
            periodeFom: values.periode.fom,
            periodeTom: values.periode.tom,
            resultat: values.resultat,
            erEksplisittAvslagPåSøknad: values.erEksplisittAvslagPåSøknad,
            avslagBegrunnelser: values.avslagBegrunnelser,
            vurderesEtter: values.vurderesEtter ?? undefined,
            utdypendeVilkårsvurderinger: values.utdypendeVilkårsvurderinger,
            antallTimer: erBarnehageplass && values.antallTimer !== '' ? Number(values.antallTimer) : undefined,
            søkerHarMeldtFraOmBarnehageplass: erBarnehageplass ? values.søkerHarMeldtFraOmBarnehageplass : undefined,
        },
    };
}

interface Props {
    lagretVilkårResultat: IVilkårResultat;
    person: IGrunnlagPerson;
    settFokusPåLeggTilPeriodeKnapp: () => void;
}

export function useVilkårResultatSkjema({ lagretVilkårResultat, person, settFokusPåLeggTilPeriodeKnapp }: Props) {
    const { behandling, settÅpenBehandling } = useBehandlingContext();
    const { kollapsRad } = useEkspanderbarVilkårResultatRad(lagretVilkårResultat.id);
    const { mutateAsync: oppdaterVilkårResultat } = useOppdaterVilkårResultat();

    const values = useMemo(
        () => lagVilkårResultatFormValues(lagretVilkårResultat, person),
        [lagretVilkårResultat, person]
    );

    const form = useForm<VilkårResultatFormValues>({ values });

    const {
        control,
        setError,
        reset,
        formState: { isDirty },
    } = form;

    useConfirmBrowserRefresh({ enabled: isDirty });

    useOnFormSubmitSuccessful(control, () => reset());

    const onSubmit = async (values: VilkårResultatFormValues) => {
        return oppdaterVilkårResultat({
            behandlingId: behandling.behandlingId,
            endreVilkårResultat: tilEndreVilkårResultat(lagretVilkårResultat, person, values),
        })
            .then(oppdatertBehandling => {
                settÅpenBehandling(byggSuksessRessurs(oppdatertBehandling));
                kollapsRad();
                settFokusPåLeggTilPeriodeKnapp();
            })
            .catch((error: unknown) => {
                setError('root', {
                    message:
                        error instanceof Error
                            ? error.message
                            : 'En ukjent feil har oppstått, vi har ikke klart å lagre vilkåret.',
                });
            });
    };

    return { form, onSubmit };
}

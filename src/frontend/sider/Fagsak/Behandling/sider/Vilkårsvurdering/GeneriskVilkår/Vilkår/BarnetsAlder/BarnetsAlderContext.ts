import { useEffect, useState } from 'react';

import { startOfDay } from 'date-fns';

import { useFelt, type Avhengigheter } from '@navikt/familie-skjema';

import {
    erAdopsjonsdatoGyldig,
    erBegrunnelseGyldig,
    erUtdypendeVilkårsvurderingerGyldig,
} from './BarnetsAlderValidering';
import type { IGrunnlagPerson } from '../../../../../../../../typer/person';
import type { Begrunnelse } from '../../../../../../../../typer/vedtak';
import {
    UtdypendeVilkårsvurderingGenerell,
    VilkårType,
} from '../../../../../../../../typer/vilkår';
import type { UtdypendeVilkårsvurdering } from '../../../../../../../../typer/vilkår';
import type { IVilkårResultat } from '../../../../../../../../typer/vilkår';
import type { Regelverk as RegelverkType, Resultat } from '../../../../../../../../typer/vilkår';
import type { IsoDatoString } from '../../../../../../../../utils/dato';
import { isoStringTilDate, type IIsoDatoPeriode } from '../../../../../../../../utils/dato';
import { sorterPåDato } from '../../../../../../../../utils/formatter';
import {
    erAvslagBegrunnelserGyldig,
    erPeriodeGyldig,
    erResultatGyldig,
} from '../../../../../../../../utils/validators';
import { useVilkårsvurderingContext } from '../../../VilkårsvurderingContext';
import { useVilkårSkjema, type IVilkårSkjemaContext } from '../../VilkårSkjemaContext';

export const muligeUtdypendeVilkårsvurderinger: UtdypendeVilkårsvurdering[] = [
    UtdypendeVilkårsvurderingGenerell.ADOPSJON,
];

export const useBarnetsAlder = (lagretVilkår: IVilkårResultat, person: IGrunnlagPerson) => {
    const vilkårSkjemaMedLagredeVerdier: IVilkårSkjemaContext = {
        vurderesEtter: lagretVilkår.vurderesEtter ?? undefined,
        resultat: lagretVilkår.resultat,
        utdypendeVilkårsvurdering: lagretVilkår.utdypendeVilkårsvurderinger,
        periode: lagretVilkår.periode,
        begrunnelse: lagretVilkår.begrunnelse,
        erEksplisittAvslagPåSøknad: lagretVilkår.erEksplisittAvslagPåSøknad ?? false,
        avslagBegrunnelser: lagretVilkår.avslagBegrunnelser,
        adopsjonsdato: person.adopsjonsdato
            ? startOfDay(new Date(person.adopsjonsdato))
            : undefined,
    };

    const { personResultater } = useVilkårsvurderingContext();

    const alleBarnetsAlderVilkårsResultaterSortert =
        personResultater
            .find(personResultat => person.personIdent === personResultat.personIdent)
            ?.vilkårResultater.filter(
                vilkårResultat => vilkårResultat.vilkårType === VilkårType.BARNETS_ALDER
            )
            .sort((a, b) => {
                if (!a.periodeFom || !b.periodeFom) {
                    return 1; //Perioder som ikke har fom skal sorteres sist i lista
                } else {
                    return sorterPåDato(b.periodeFom, a.periodeFom);
                }
            }) || [];

    const førsteLagredeFom = alleBarnetsAlderVilkårsResultaterSortert[0].periodeFom;

    const vurderesEtter = useFelt<RegelverkType | undefined>({
        verdi: vilkårSkjemaMedLagredeVerdier.vurderesEtter,
    });

    const resultat = useFelt<Resultat>({
        verdi: vilkårSkjemaMedLagredeVerdier.resultat,
        valideringsfunksjon: erResultatGyldig,
    });

    const erEksplisittAvslagPåSøknad = useFelt<boolean>({
        verdi: vilkårSkjemaMedLagredeVerdier.erEksplisittAvslagPåSøknad,
    });

    const utdypendeVilkårsvurdering = useFelt<UtdypendeVilkårsvurdering[]>({
        verdi: vilkårSkjemaMedLagredeVerdier.utdypendeVilkårsvurdering,
        valideringsfunksjon: erUtdypendeVilkårsvurderingerGyldig,
    });

    const adopsjonsdato = useFelt<Date | undefined>({
        verdi: undefined,
        valideringsfunksjon: felt =>
            erAdopsjonsdatoGyldig(felt, isoStringTilDate(person.fødselsdato)),
        avhengigheter: { utdypendeVilkårsvurdering: utdypendeVilkårsvurdering.verdi },
        nullstillVedAvhengighetEndring: false,
        skalFeltetVises: (avhengigheter: Avhengigheter) =>
            avhengigheter?.utdypendeVilkårsvurdering.includes(
                UtdypendeVilkårsvurderingGenerell.ADOPSJON
            ),
    });

    const felter = {
        vurderesEtter,
        resultat,
        utdypendeVilkårsvurdering,
        periode: useFelt<IIsoDatoPeriode>({
            verdi: vilkårSkjemaMedLagredeVerdier.periode,
            avhengigheter: {
                person,
                erEksplisittAvslagPåSøknad: erEksplisittAvslagPåSøknad.verdi,
                utdypendeVilkårsvurdering: utdypendeVilkårsvurdering.verdi,
                førsteLagredeFom,
                adopsjonsdato: adopsjonsdato.verdi,
            },
            valideringsfunksjon: (felt, avhengigheter) =>
                erPeriodeGyldig(felt, VilkårType.BARNETS_ALDER, avhengigheter),
        }),
        begrunnelse: useFelt<string>({
            verdi: vilkårSkjemaMedLagredeVerdier.begrunnelse,
            valideringsfunksjon: erBegrunnelseGyldig,
            avhengigheter: {
                vurderesEtter: vurderesEtter.verdi,
                utdypendeVilkårsvurdering: utdypendeVilkårsvurdering.verdi,
            },
        }),
        erEksplisittAvslagPåSøknad,
        avslagBegrunnelser: useFelt<Begrunnelse[]>({
            verdi: vilkårSkjemaMedLagredeVerdier.avslagBegrunnelser,
            valideringsfunksjon: erAvslagBegrunnelserGyldig,
            avhengigheter: {
                erEksplisittAvslagPåSøknad: erEksplisittAvslagPåSøknad.verdi,
            },
        }),
        adopsjonsdato: adopsjonsdato,
    };

    const [forrigeAdopsjonsdato, settForrigeAdopsjonsdato] = useState<IsoDatoString | undefined>();

    const settAdopsjonsdatoFraBackend = () => {
        felter.adopsjonsdato.validerOgSettFelt(vilkårSkjemaMedLagredeVerdier.adopsjonsdato);
    };

    if (person.adopsjonsdato !== forrigeAdopsjonsdato) {
        settForrigeAdopsjonsdato(person.adopsjonsdato);
        settAdopsjonsdatoFraBackend();
    }

    useEffect(() => {
        const utdypendeInneholderAdopsjon = felter.utdypendeVilkårsvurdering.verdi.includes(
            UtdypendeVilkårsvurderingGenerell.ADOPSJON
        );
        if (utdypendeInneholderAdopsjon && !felter.adopsjonsdato.verdi) {
            settAdopsjonsdatoFraBackend();
        }
        if (!utdypendeInneholderAdopsjon && felter.adopsjonsdato.verdi) {
            felter.adopsjonsdato.nullstill();
        }
    }, [felter.utdypendeVilkårsvurdering.verdi]);

    const {
        skjema,
        lagreVilkår,
        lagrerVilkår,
        slettVilkår,
        sletterVilkår,
        feilmelding,
        finnesEndringerSomIkkeErLagret,
    } = useVilkårSkjema(lagretVilkår, felter, person);

    return {
        vilkårSkjemaContext: {
            skjema,
            lagreVilkår,
            lagrerVilkår,
            slettVilkår,
            sletterVilkår,
            feilmelding,
            nullstillSkjema: () => {
                felter.avslagBegrunnelser.nullstill();
                felter.begrunnelse.nullstill();
                felter.periode.nullstill();
                felter.erEksplisittAvslagPåSøknad.nullstill();
                felter.resultat.nullstill();
                felter.utdypendeVilkårsvurdering.nullstill();
                felter.vurderesEtter.nullstill();
                settAdopsjonsdatoFraBackend();
            },
        },
        finnesEndringerSomIkkeErLagret: () =>
            finnesEndringerSomIkkeErLagret(vilkårSkjemaMedLagredeVerdier),
    };
};

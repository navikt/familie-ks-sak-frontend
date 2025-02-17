import { useEffect, useState } from 'react';

import { isBefore, isValid, startOfDay } from 'date-fns';

import { feil, ok, useFelt, type Avhengigheter } from '@navikt/familie-skjema';

import { erBegrunnelseGyldig, erUtdypendeVilkårsvurderingerGyldig } from './BarnetsAlderValidering';
import { useVilkårsvurdering } from '../../../../../../context/Vilkårsvurdering/VilkårsvurderingContext';
import type { IGrunnlagPerson } from '../../../../../../typer/person';
import type { Begrunnelse } from '../../../../../../typer/vedtak';
import { UtdypendeVilkårsvurderingGenerell, VilkårType } from '../../../../../../typer/vilkår';
import type { UtdypendeVilkårsvurdering } from '../../../../../../typer/vilkår';
import type { IVilkårResultat } from '../../../../../../typer/vilkår';
import type { Regelverk as RegelverkType, Resultat } from '../../../../../../typer/vilkår';
import type { IsoDatoString } from '../../../../../../utils/dato';
import { type IIsoDatoPeriode } from '../../../../../../utils/dato';
import { sorterPåDato } from '../../../../../../utils/formatter';
import {
    erAvslagBegrunnelserGyldig,
    erPeriodeGyldig,
    erResultatGyldig,
} from '../../../../../../utils/validators';
import type { IVilkårSkjemaContext } from '../../VilkårSkjemaContext';

export const muligeUtdypendeVilkårsvurderinger: UtdypendeVilkårsvurdering[] = [
    UtdypendeVilkårsvurderingGenerell.ADOPSJON,
];

export const useBarnetsAlder = (
    vilkår: IVilkårResultat,
    person: IGrunnlagPerson,
    støtterAdopsjon: boolean
) => {
    const vilkårSkjema: IVilkårSkjemaContext = {
        vurderesEtter: vilkår.vurderesEtter ? vilkår.vurderesEtter : undefined,
        resultat: vilkår.resultat,
        utdypendeVilkårsvurdering: vilkår.utdypendeVilkårsvurderinger,
        periode: vilkår.periode,
        begrunnelse: vilkår.begrunnelse,
        erEksplisittAvslagPåSøknad: vilkår.erEksplisittAvslagPåSøknad ?? false,
        avslagBegrunnelser: vilkår.avslagBegrunnelser,
    };

    const { personResultater } = useVilkårsvurdering();

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
        verdi: vilkårSkjema.vurderesEtter,
    });

    const resultat = useFelt<Resultat>({
        verdi: vilkårSkjema.resultat,
        valideringsfunksjon: erResultatGyldig,
    });

    const erEksplisittAvslagPåSøknad = useFelt<boolean>({
        verdi: vilkårSkjema.erEksplisittAvslagPåSøknad,
    });

    const utdypendeVilkårsvurdering = useFelt<UtdypendeVilkårsvurdering[]>({
        verdi: vilkårSkjema.utdypendeVilkårsvurdering,
        valideringsfunksjon: erUtdypendeVilkårsvurderingerGyldig,
    });

    const adopsjonsdato = useFelt<Date | undefined>({
        verdi: undefined,
        valideringsfunksjon: felt => {
            if (!felt.verdi || !isValid(felt.verdi)) {
                return feil(felt, 'Adopsjonsdato må fylles ut når adopsjon er valgt');
            } else if (isBefore(felt.verdi, person.fødselsdato)) {
                return feil(felt, 'Adopsjonsdato kan ikke være tidligere enn fødselsdato');
            } else {
                return ok(felt);
            }
        },
        avhengigheter: { utdypendeVilkårsvurdering: utdypendeVilkårsvurdering.verdi },
        nullstillVedAvhengighetEndring: false,
        skalFeltetVises: (avhengigheter: Avhengigheter) =>
            avhengigheter?.utdypendeVilkårsvurdering.includes(
                UtdypendeVilkårsvurderingGenerell.ADOPSJON
            ) &&
            (støtterAdopsjon || true),
    });

    const felter = {
        vurderesEtter,
        resultat,
        utdypendeVilkårsvurdering,
        periode: useFelt<IIsoDatoPeriode>({
            verdi: vilkårSkjema.periode,
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
            verdi: vilkårSkjema.begrunnelse,
            valideringsfunksjon: erBegrunnelseGyldig,
            avhengigheter: {
                vurderesEtter: vurderesEtter.verdi,
                utdypendeVilkårsvurdering: utdypendeVilkårsvurdering.verdi,
            },
        }),
        erEksplisittAvslagPåSøknad,
        avslagBegrunnelser: useFelt<Begrunnelse[]>({
            verdi: vilkårSkjema.avslagBegrunnelser,
            valideringsfunksjon: erAvslagBegrunnelserGyldig,
            avhengigheter: {
                erEksplisittAvslagPåSøknad: erEksplisittAvslagPåSøknad.verdi,
            },
        }),
        adopsjonsdato: adopsjonsdato,
    };

    const [forrigeAdopsjonsdato, settForrigeAdopsjonsdato] = useState<IsoDatoString | undefined>();

    const settAdopsjonsdatoFraBackend = () => {
        felter.adopsjonsdato.validerOgSettFelt(
            person.adopsjonsdato ? startOfDay(new Date(person.adopsjonsdato)) : undefined
        );
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

    return {
        felter,
    };
};

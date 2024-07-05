import { useFelt } from '@navikt/familie-skjema';

import { erBegrunnelseGyldig, erUtdypendeVilkårsvurderingerGyldig } from './BarnetsAlderValidering';
import { useApp } from '../../../../../../context/AppContext';
import { useVilkårsvurdering } from '../../../../../../context/Vilkårsvurdering/VilkårsvurderingContext';
import type { IGrunnlagPerson } from '../../../../../../typer/person';
import { ToggleNavn } from '../../../../../../typer/toggles';
import type { Begrunnelse } from '../../../../../../typer/vedtak';
import { UtdypendeVilkårsvurderingGenerell, VilkårType } from '../../../../../../typer/vilkår';
import type { UtdypendeVilkårsvurdering } from '../../../../../../typer/vilkår';
import type { IVilkårResultat } from '../../../../../../typer/vilkår';
import type { Regelverk as RegelverkType, Resultat } from '../../../../../../typer/vilkår';
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

export const useBarnetsAlder = (vilkår: IVilkårResultat, person: IGrunnlagPerson) => {
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

    const { toggles } = useApp();
    const erLovendringTogglePå = toggles[ToggleNavn.lovendring7MndNyeBehandlinger];

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
            },
            valideringsfunksjon: (felt, avhengigheter) =>
                erPeriodeGyldig(
                    felt,
                    VilkårType.BARNETS_ALDER,
                    erLovendringTogglePå,
                    avhengigheter
                ),
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
    };

    return {
        felter,
    };
};

import { lagGrunnlagPerson } from '@testutils/testdata/personTestdata';
import type { IGrunnlagPerson } from '@typer/person';
import { PersonType } from '@typer/person';
import {
    Regelverk,
    Resultat,
    UtdypendeVilkårsvurderingEøsSøkerBosattIRiket,
    UtdypendeVilkårsvurderingGenerell,
    VilkårType,
} from '@typer/vilkår';
import { nyIsoDatoPeriode } from '@utils/dato';
import { addDays, addMonths, formatISO } from 'date-fns';
import { describe, expect, test } from 'vitest';

import {
    validerAntallTimer,
    validerBegrunnelse,
    validerBegrunnelseForBarnetsAlder,
    validerPeriode,
    validerResultat,
    validerUtdypendeVilkårsvurderinger,
} from './validering';

const lagBarn = (person: Partial<IGrunnlagPerson> = {}) =>
    lagGrunnlagPerson({ personIdent: '12345678930', fødselsdato: '2000-05-17', type: PersonType.BARN, ...person });

const ikkeAvslag = { person: lagBarn(), erEksplisittAvslagPåSøknad: false };

describe('vilkårsvurdering/validering', () => {
    describe('validerPeriode', () => {
        test('Periode med ugyldig fom gir feil', () => {
            expect(
                validerPeriode(nyIsoDatoPeriode('400220', undefined), VilkårType.LOVLIG_OPPHOLD, ikkeAvslag)
            ).toEqual('Ugyldig f.o.m.');
        });

        test('Periode med ugyldig tom gir feil', () => {
            expect(
                validerPeriode(nyIsoDatoPeriode('2020-06-17', '400220'), VilkårType.LOVLIG_OPPHOLD, ikkeAvslag)
            ).toEqual('Ugyldig t.o.m.');
        });

        test('Periode uten datoer gir feil hvis ikke avslag', () => {
            expect(
                validerPeriode(nyIsoDatoPeriode(undefined, undefined), VilkårType.LOVLIG_OPPHOLD, ikkeAvslag)
            ).toEqual('F.o.m. må settes før du kan gå videre');
        });

        test('Periode uten fom-dato gir feil hvis avslag og tom-dato er satt', () => {
            expect(
                validerPeriode(nyIsoDatoPeriode(undefined, '2010-05-17'), VilkårType.LOVLIG_OPPHOLD, {
                    person: lagBarn(),
                    erEksplisittAvslagPåSøknad: true,
                })
            ).toEqual('F.o.m. må settes eller t.o.m. må fjernes før du kan gå videre');
        });

        test('Periode uten fom-dato, tom-dato og som er avslag gir ok', () => {
            expect(
                validerPeriode(nyIsoDatoPeriode(undefined, undefined), VilkårType.LOVLIG_OPPHOLD, {
                    person: lagBarn(),
                    erEksplisittAvslagPåSøknad: true,
                })
            ).toBeUndefined();
        });

        test('Periode med fom-dato på oppfylt periode senere enn tom', () => {
            expect(
                validerPeriode(nyIsoDatoPeriode('2010-06-17', '2010-01-17'), VilkårType.LOVLIG_OPPHOLD, {
                    person: lagBarn(),
                    erEksplisittAvslagPåSøknad: true,
                })
            ).toEqual('F.o.m må settes tidligere enn t.o.m');
        });

        test('Periode med fom-dato før barnets fødselsdato på oppfylt periode gir feil', () => {
            expect(
                validerPeriode(nyIsoDatoPeriode('1999-05-17', '2018-05-17'), VilkårType.LOVLIG_OPPHOLD, ikkeAvslag)
            ).toEqual('Du kan ikke legge til periode før barnets fødselsdato');
        });

        test('Periode med tom-dato etter barnets dødsfalldato gir feil', () => {
            expect(
                validerPeriode(nyIsoDatoPeriode('2000-05-17', '2021-05-17'), VilkårType.LOVLIG_OPPHOLD, {
                    person: lagBarn({ dødsfallDato: '2020-12-12' }),
                    erEksplisittAvslagPåSøknad: false,
                })
            ).toEqual('Du kan ikke sette til og med dato etter dødsfalldato');
        });

        test('Periode med fom-dato lik som tom-dato skal ikke være mulig dersom det ikke er barnets dødsfallsdato', () => {
            expect(
                validerPeriode(nyIsoDatoPeriode('2020-12-12', '2020-12-12'), VilkårType.LOVLIG_OPPHOLD, ikkeAvslag)
            ).toEqual('F.o.m må settes tidligere enn t.o.m');
        });

        test('Periode med fom-dato lik som tom-dato skal være mulig dersom det er barnets dødsfallsdato', () => {
            expect(
                validerPeriode(nyIsoDatoPeriode('2020-12-12', '2020-12-12'), VilkårType.LOVLIG_OPPHOLD, {
                    person: lagBarn({ dødsfallDato: '2020-12-12' }),
                    erEksplisittAvslagPåSøknad: false,
                })
            ).toBeUndefined();
        });

        test('Periode etter barnets fødselsdato pluss 2 år gir feil på BarnetsAlder-vilkåret dersom vilkår er før lovendring 2024', () => {
            expect(
                validerPeriode(nyIsoDatoPeriode('2001-05-17', '2018-05-17'), VilkårType.BARNETS_ALDER, ikkeAvslag)
            ).toEqual('T.o.m datoen må være lik barnets 2 års dag');
        });

        test('Periode etter barnets fødselsdato pluss 19 måneder gir feil på BarnetsAlder-vilkåret dersom vilkår er etter lovendring-2024', () => {
            expect(
                validerPeriode(nyIsoDatoPeriode('2024-08-01', '2024-12-01'), VilkårType.BARNETS_ALDER, {
                    person: lagBarn({ fødselsdato: '2023-05-17' }),
                    erEksplisittAvslagPåSøknad: false,
                })
            ).toEqual('T.o.m datoen må være lik datoen barnet fyller 19 måneder');
        });

        test('Periode etter barnets fødselsdato gir ok på andre vilkår', () => {
            expect(
                validerPeriode(nyIsoDatoPeriode('2001-05-17', '2018-05-18'), VilkårType.LOVLIG_OPPHOLD, ikkeAvslag)
            ).toBeUndefined();
        });

        test('Fom som settes til senere enn inneværende måned på barnehageplass vilkår skal gi OK', () => {
            const inneværendeMåned = new Date().setDate(1);
            const nesteMåned = addMonths(inneværendeMåned, 1);
            const nesteMånedOgEnDag = addDays(nesteMåned, 1);

            const periode = nyIsoDatoPeriode(
                formatISO(nesteMåned, { representation: 'date' }),
                formatISO(nesteMånedOgEnDag, { representation: 'date' })
            );

            expect(validerPeriode(periode, VilkårType.BARNEHAGEPLASS, ikkeAvslag)).toBeUndefined();
        });

        test('Fom som settes til senere enn inneværende måned på andre vilkår enn barnehageplass skal gi FEIL', () => {
            const nesteMåned = addMonths(new Date(), 1);
            const nesteMånedOgEnDag = addDays(nesteMåned, 1);

            const periode = nyIsoDatoPeriode(
                formatISO(nesteMåned, { representation: 'date' }),
                formatISO(nesteMånedOgEnDag, { representation: 'date' })
            );

            expect(validerPeriode(periode, VilkårType.MEDLEMSKAP_ANNEN_FORELDER, ikkeAvslag)).toBeDefined();
        });

        test('Medlemskap annen forelder krever ikke periode når resultatet er ikke aktuelt', () => {
            expect(
                validerPeriode(nyIsoDatoPeriode(undefined, undefined), VilkårType.MEDLEMSKAP_ANNEN_FORELDER, {
                    ...ikkeAvslag,
                    resultat: Resultat.IKKE_AKTUELT,
                })
            ).toBeUndefined();
        });

        test('Periode med innenfor 1-2 år gir ok på BarnetsAlder-vilkåret dersom vilkår er før lovendring 2024', () => {
            expect(
                validerPeriode(nyIsoDatoPeriode('2001-05-17', '2002-05-17'), VilkårType.BARNETS_ALDER, ikkeAvslag)
            ).toBeUndefined();
        });

        test('Periode innenfor 6mnd etter lovendring 2024 gir ok for adopsjon', () => {
            expect(
                validerPeriode(nyIsoDatoPeriode('2024-10-28', '2025-04-28'), VilkårType.BARNETS_ALDER, {
                    person: lagBarn({ fødselsdato: '2023-05-17' }),
                    erEksplisittAvslagPåSøknad: false,
                    utdypendeVilkårsvurderinger: [UtdypendeVilkårsvurderingGenerell.ADOPSJON],
                })
            ).toBeUndefined();
        });

        test('Adopsjonsdato fra folkeregisteret påvirker ikke lovverk når adopsjon ikke er valgt', () => {
            const periode = nyIsoDatoPeriode('2024-06-17', '2024-12-17');
            const avhengigheter = {
                person: lagBarn({ fødselsdato: '2023-05-17' }),
                erEksplisittAvslagPåSøknad: false,
                adopsjonsdato: new Date(2024, 5, 1),
            };

            expect(
                validerPeriode(periode, VilkårType.BARNETS_ALDER, { ...avhengigheter, utdypendeVilkårsvurderinger: [] })
            ).toBeUndefined();
        });

        test('Periode lengre enn 6mnd etter lovendring 2024 gir feil for adopsjon', () => {
            expect(
                validerPeriode(nyIsoDatoPeriode('2024-10-28', '2025-05-28'), VilkårType.BARNETS_ALDER, {
                    person: lagBarn({ fødselsdato: '2023-05-17' }),
                    erEksplisittAvslagPåSøknad: false,
                    utdypendeVilkårsvurderinger: [UtdypendeVilkårsvurderingGenerell.ADOPSJON],
                })
            ).toBeDefined();
        });
    });

    describe('validerResultat', () => {
        test('Ikke vurdert gir feil, andre resultater er ok', () => {
            expect(validerResultat(Resultat.IKKE_VURDERT)).toBe('Resultat er ikke satt');
            expect(validerResultat(Resultat.OPPFYLT)).toBeUndefined();
            expect(validerResultat(Resultat.IKKE_AKTUELT)).toBeUndefined();
        });
    });

    describe('validerBegrunnelse', () => {
        test('Begrunnelse er påkrevd for søker på bosatt i riket etter EØS-forordningen', () => {
            const avhengigheter = {
                vilkårType: VilkårType.BOSATT_I_RIKET,
                vurderesEtter: Regelverk.EØS_FORORDNINGEN,
                utdypendeVilkårsvurderinger: [],
                personType: PersonType.SØKER,
                søkerHarMeldtFraOmBarnehageplass: false,
            };
            expect(validerBegrunnelse('', avhengigheter)).toBe('Du må fylle inn en begrunnelse');
            expect(validerBegrunnelse('Begrunnelse', avhengigheter)).toBeUndefined();
        });

        test('Begrunnelse er påkrevd når søker har meldt fra om barnehageplass', () => {
            expect(
                validerBegrunnelse('', {
                    vilkårType: VilkårType.BARNEHAGEPLASS,
                    vurderesEtter: undefined,
                    utdypendeVilkårsvurderinger: [],
                    personType: PersonType.BARN,
                    søkerHarMeldtFraOmBarnehageplass: true,
                })
            ).toBe('Du må fylle inn en begrunnelse');
        });

        test('Barnets alder krever begrunnelse når adopsjon er valgt', () => {
            expect(
                validerBegrunnelseForBarnetsAlder('', {
                    vurderesEtter: undefined,
                    utdypendeVilkårsvurderinger: [UtdypendeVilkårsvurderingGenerell.ADOPSJON],
                })
            ).toBe(
                'Du har gjort ett eller flere valg under "Utdypende vilkårsvurdering" og må derfor fylle inn en begrunnelse'
            );
            expect(
                validerBegrunnelseForBarnetsAlder('', { vurderesEtter: undefined, utdypendeVilkårsvurderinger: [] })
            ).toBeUndefined();
        });
    });

    describe('validerUtdypendeVilkårsvurderinger', () => {
        const mulige = [
            UtdypendeVilkårsvurderingEøsSøkerBosattIRiket.OMFATTET_AV_NORSK_LOVGIVNING,
            UtdypendeVilkårsvurderingEøsSøkerBosattIRiket.OMFATTET_AV_NORSK_LOVGIVNING_UTLAND,
        ];

        test('EØS krever nøyaktig ett valg på bosatt i riket', () => {
            const avhengigheter = {
                vilkårType: VilkårType.BOSATT_I_RIKET,
                muligeUtdypendeVilkårsvurderinger: mulige,
                vurderesEtter: Regelverk.EØS_FORORDNINGEN,
            };
            expect(validerUtdypendeVilkårsvurderinger([], avhengigheter)).toBe('Du må velge ett alternativ');
            expect(validerUtdypendeVilkårsvurderinger(mulige, avhengigheter)).toBe('Du kan kun velge ett alternativ');
            expect(validerUtdypendeVilkårsvurderinger([mulige[0]], avhengigheter)).toBeUndefined();
        });

        test('Valg som ikke er mulige gir feil', () => {
            expect(
                validerUtdypendeVilkårsvurderinger([UtdypendeVilkårsvurderingGenerell.SOMMERFERIE], {
                    vilkårType: VilkårType.BOSATT_I_RIKET,
                    muligeUtdypendeVilkårsvurderinger: mulige,
                    vurderesEtter: Regelverk.NASJONALE_REGLER,
                })
            ).toBe('Du har valgt en ugyldig kombinasjon');
        });

        test('Bor med søker gir feil uten regelverk', () => {
            expect(
                validerUtdypendeVilkårsvurderinger([], {
                    vilkårType: VilkårType.BOR_MED_SØKER,
                    muligeUtdypendeVilkårsvurderinger: mulige,
                    vurderesEtter: null,
                })
            ).toBe('Utdypende vilkårsvurdering er ugyldig');
        });
    });

    describe('validerAntallTimer', () => {
        const ikkeOppfyltUtenUtdypende = { resultat: Resultat.IKKE_OPPFYLT, utdypendeVilkårsvurderinger: [] };

        test('Antall timer må fylles ut når vilkåret ikke er oppfylt uten utdypende vilkårsvurdering', () => {
            expect(validerAntallTimer('', ikkeOppfyltUtenUtdypende)).toBe(
                'Antall timer med barnehageplass må fylles ut'
            );
            expect(
                validerAntallTimer('', { resultat: Resultat.OPPFYLT, utdypendeVilkårsvurderinger: [] })
            ).toBeUndefined();
        });

        test('Antall timer må være mellom 0 og 122 med maks to desimaler', () => {
            expect(validerAntallTimer('0', ikkeOppfyltUtenUtdypende)).toBe(
                'Antall timer med barnehageplass må være større enn 0'
            );
            expect(validerAntallTimer('123', ikkeOppfyltUtenUtdypende)).toBe(
                'Antall timer med barnehageplass kan ikke overstige 122'
            );
            expect(validerAntallTimer('10.123', ikkeOppfyltUtenUtdypende)).toBe(
                'Antall timer med barnehageplass kan maksimalt oppgis med 2 desimaler'
            );
            expect(validerAntallTimer('40', ikkeOppfyltUtenUtdypende)).toBeUndefined();
        });
    });
});

import { lagGrunnlagPerson } from '@testutils/testdata/personTestdata';
import { lagVilkårResultatUi } from '@testutils/testdata/vilkårResultatTestdata';
import { PersonType } from '@typer/person';
import type { IRestVilkårResultat } from '@typer/vilkår';
import { Resultat, UtdypendeVilkårsvurderingGenerell, VilkårType } from '@typer/vilkår';
import { describe, expect, test } from 'vitest';

import { lagVilkårResultatFormValues, tilEndreVilkårResultat, VilkårResultatFelt } from './useVilkårResultatSkjema';

const barn = lagGrunnlagPerson({
    personIdent: '12345678910',
    fødselsdato: '2023-05-17',
    type: PersonType.BARN,
    adopsjonsdato: '2023-08-01',
});

const lagVilkårResultat = (vilkårResultat: Partial<IRestVilkårResultat> = {}) =>
    lagVilkårResultatUi({
        behandlingId: 100,
        erVurdert: true,
        begrunnelse: 'En begrunnelse',
        periodeFom: '2024-05-17',
        periodeTom: '2025-01-17',
        resultat: Resultat.OPPFYLT,
        vilkårType: VilkårType.BARNETS_ALDER,
        ...vilkårResultat,
    });

describe('useVilkårResultatSkjema', () => {
    describe('lagVilkårResultatFormValues', () => {
        test('mapper lagret vilkårresultat og adopsjonsdato fra person til skjemaverdier', () => {
            const values = lagVilkårResultatFormValues(lagVilkårResultat({ antallTimer: 20 }), barn);

            expect(values[VilkårResultatFelt.RESULTAT]).toBe(Resultat.OPPFYLT);
            expect(values[VilkårResultatFelt.PERIODE]).toEqual({ fom: '2024-05-17', tom: '2025-01-17' });
            expect(values[VilkårResultatFelt.ANTALL_TIMER]).toBe('20');
            expect(values[VilkårResultatFelt.ADOPSJONSDATO]).toEqual(new Date(2023, 7, 1));
        });

        test('har barnehageplass er ikke satt når vilkåret ikke er vurdert', () => {
            const values = lagVilkårResultatFormValues(
                lagVilkårResultat({ vilkårType: VilkårType.BARNEHAGEPLASS, resultat: Resultat.IKKE_VURDERT }),
                barn
            );
            expect(values[VilkårResultatFelt.HAR_BARNEHAGEPLASS]).toBeNull();
        });

        test('har barnehageplass avledes av lagret resultat og antall timer', () => {
            const medPlass = lagVilkårResultatFormValues(
                lagVilkårResultat({
                    vilkårType: VilkårType.BARNEHAGEPLASS,
                    resultat: Resultat.OPPFYLT,
                    antallTimer: 20,
                }),
                barn
            );
            const utenPlass = lagVilkårResultatFormValues(
                lagVilkårResultat({ vilkårType: VilkårType.BARNEHAGEPLASS, resultat: Resultat.OPPFYLT }),
                barn
            );
            expect(medPlass[VilkårResultatFelt.HAR_BARNEHAGEPLASS]).toBe(true);
            expect(utenPlass[VilkårResultatFelt.HAR_BARNEHAGEPLASS]).toBe(false);
        });
    });

    describe('tilEndreVilkårResultat', () => {
        test('sender adopsjonsdato kun når adopsjon er valgt', () => {
            const vilkårResultat = lagVilkårResultat();
            const values = lagVilkårResultatFormValues(vilkårResultat, barn);

            const utenAdopsjon = tilEndreVilkårResultat(vilkårResultat, barn, values);
            const medAdopsjon = tilEndreVilkårResultat(vilkårResultat, barn, {
                ...values,
                [VilkårResultatFelt.UTDYPENDE_VILKÅRSVURDERINGER]: [UtdypendeVilkårsvurderingGenerell.ADOPSJON],
            });

            expect(utenAdopsjon.adopsjonsdato).toBeUndefined();
            expect(medAdopsjon.adopsjonsdato).toBe('2023-08-01');
            expect(medAdopsjon.personIdent).toBe(barn.personIdent);
        });

        test('sender ikke barnehagefelter for andre vilkår enn barnehageplass', () => {
            const vilkårResultat = lagVilkårResultat({ vilkårType: VilkårType.MEDLEMSKAP });
            const values = lagVilkårResultatFormValues(vilkårResultat, barn);

            const { endretVilkårResultat } = tilEndreVilkårResultat(vilkårResultat, barn, {
                ...values,
                [VilkårResultatFelt.ANTALL_TIMER]: '20',
                [VilkårResultatFelt.SØKER_HAR_MELDT_FRA_OM_BARNEHAGEPLASS]: true,
            });

            expect(endretVilkårResultat.antallTimer).toBeUndefined();
            expect(endretVilkårResultat.søkerHarMeldtFraOmBarnehageplass).toBeUndefined();
        });

        test('mapper antall timer til tall og tom streng til undefined', () => {
            const vilkårResultat = lagVilkårResultat({ vilkårType: VilkårType.BARNEHAGEPLASS });
            const values = lagVilkårResultatFormValues(vilkårResultat, barn);

            expect(
                tilEndreVilkårResultat(vilkårResultat, barn, { ...values, [VilkårResultatFelt.ANTALL_TIMER]: '20.5' })
                    .endretVilkårResultat.antallTimer
            ).toBe(20.5);
            expect(
                tilEndreVilkårResultat(vilkårResultat, barn, values).endretVilkårResultat.antallTimer
            ).toBeUndefined();
            expect(tilEndreVilkårResultat(vilkårResultat, barn, values).endretVilkårResultat.id).toBe(
                vilkårResultat.id
            );
        });
    });
});

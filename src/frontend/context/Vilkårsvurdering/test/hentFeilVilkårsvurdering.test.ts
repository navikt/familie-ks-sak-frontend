import barnehageperiodeStarterEtter2årEllerSkole from './testcaser/barnehageperiodeStarterEtter2årEllerSkole.json';
import bosattIRiketIkkeUtfylt from './testcaser/bosattIRiketIkkeUtfylt.json';
import happyCase from './testcaser/happyCase.json';
import manglerBarnehageplassBarnetsAlderVilkårsvurdering from './testcaser/manglerBarnehageplassBarnetsAlderVilkårsvurdering.json';
import type { IPersonResultat } from '../../../typer/vilkår';
import { hentFeilIVilkårsvurdering } from '../hentFeilIVilkårsvurdering';

describe('hentFeilIVilkårsvurdering', () => {
    test('Skal gi feilmelding dersom "Barnets alder"-vilkåret ikke har en barnehageperiode i samme tidsrom', () => {
        const feilIVilkåarsvurdering = hentFeilIVilkårsvurdering(
            manglerBarnehageplassBarnetsAlderVilkårsvurdering as unknown as IPersonResultat[]
        );

        expect(feilIVilkåarsvurdering.length).toEqual(1);
        expect(feilIVilkåarsvurdering[0].skjemaelementId.includes('BARNETS_ALDER')).toBe(true);
    });

    test('Skal gi feilmelding dersom en barnehageperiode starter etter siste periode for "mellom 1 og 2 år"-vilkåret', () => {
        const feilIVilkåarsvurdering = hentFeilIVilkårsvurdering(
            barnehageperiodeStarterEtter2årEllerSkole as unknown as IPersonResultat[]
        );

        expect(feilIVilkåarsvurdering.length).toEqual(1);
        expect(feilIVilkåarsvurdering[0].skjemaelementId.includes('BARNEHAGEPLASS')).toBe(true);
    });

    test('Skal gi feilmelding dersom ett av vilkårene ikke er utfylt', () => {
        const feilIVilkåarsvurdering = hentFeilIVilkårsvurdering(
            bosattIRiketIkkeUtfylt as unknown as IPersonResultat[]
        );

        expect(feilIVilkåarsvurdering.length).toEqual(1);
        expect(feilIVilkåarsvurdering[0].skjemaelementId.includes('BOSATT_I_RIKET')).toBe(true);
    });

    test('Skal ikke gi feilmelding dersom ingenting er galt', () => {
        const feilIVilkåarsvurdering = hentFeilIVilkårsvurdering(
            happyCase as unknown as IPersonResultat[]
        );

        expect(feilIVilkåarsvurdering.length).toEqual(0);
    });
});

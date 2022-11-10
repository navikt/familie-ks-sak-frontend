import type { ISkjema } from '@navikt/familie-skjema';

import type { IBehandling } from '../../../../../../typer/behandling';
import { Resultat, UtdypendeVilkårsvurdering } from '../../../../../../typer/vilkår';
import type { IBarnehageplassVilkårSkjemaContext } from './BarnehageplassContext';

export const antallTimerKvalifiserer = (antallTimer: number) => {
    const kvalifiserer = antallTimer > 0 && antallTimer < 33;
    return kvalifiserer;
};

export const vilkårIkkeOppfyltOgUtdypendeIkkeSommerferie = (
    skjema: ISkjema<IBarnehageplassVilkårSkjemaContext, IBehandling>
) =>
    skjema.felter.resultat.verdi === Resultat.IKKE_OPPFYLT &&
    !skjema.felter.utdypendeVilkårsvurdering.verdi.find(
        utdypende => utdypende === UtdypendeVilkårsvurdering.SOMMERFERIE
    );

export const vilkårOppfyltOgAntallTimerKvalifiserer = (
    skjema: ISkjema<IBarnehageplassVilkårSkjemaContext, IBehandling>
) =>
    skjema.felter.resultat.verdi === Resultat.OPPFYLT &&
    antallTimerKvalifiserer(Number(skjema.felter.antallTimer.verdi));

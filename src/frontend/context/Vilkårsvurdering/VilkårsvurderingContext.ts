import constate from 'constate';

import type { FeiloppsummeringFeil } from '@navikt/familie-skjema';

import type { IBehandling } from '../../typer/behandling';
import { hentFeilIVilkårsvurdering } from './hentFeilIVilkårsvurdering';
import { mapFraRestVilkårsvurderingTilUi } from './vilkårsvurdering';

interface IProps {
    åpenBehandling: IBehandling;
}

const [VilkårsvurderingProvider, useVilkårsvurdering] = constate(({ åpenBehandling }: IProps) => {
    const vilkårsvurdering = åpenBehandling
        ? mapFraRestVilkårsvurderingTilUi(åpenBehandling.personResultater, åpenBehandling.personer)
        : [];

    const personResultater = åpenBehandling.personResultater;

    const feiloppsummeringFeil: FeiloppsummeringFeil[] =
        hentFeilIVilkårsvurdering(vilkårsvurdering);

    return {
        feiloppsummeringFeil,
        vilkårsvurdering,
        personResultater,
    };
});
export { VilkårsvurderingProvider, useVilkårsvurdering };

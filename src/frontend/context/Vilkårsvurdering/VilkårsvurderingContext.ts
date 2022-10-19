import * as React from 'react';

import constate from 'constate';

import type { IBehandling } from '../../typer/behandling';
import type { IAnnenVurdering, IPersonResultat, IVilkårResultat } from '../../typer/vilkår';
import { Resultat } from '../../typer/vilkår';
import { mapFraRestVilkårsvurderingTilUi } from './vilkårsvurdering';

interface IProps {
    åpenBehandling: IBehandling;
}

const [VilkårsvurderingProvider, useVilkårsvurdering] = constate(({ åpenBehandling }: IProps) => {
    const [vilkårsvurdering, settVilkårsvurdering] = React.useState<IPersonResultat[]>(
        åpenBehandling
            ? mapFraRestVilkårsvurderingTilUi(
                  åpenBehandling.personResultater,
                  åpenBehandling.personer
              )
            : []
    );

    React.useEffect(() => {
        settVilkårsvurdering(
            åpenBehandling
                ? mapFraRestVilkårsvurderingTilUi(
                      åpenBehandling.personResultater,
                      åpenBehandling.personer
                  )
                : []
        );
    }, [åpenBehandling]);

    const erVilkårsvurderingenGyldig = (): boolean => {
        return (
            vilkårsvurdering.filter((personResultat: IPersonResultat) => {
                return (
                    personResultat.vilkårResultater.filter(
                        (vilkårResultat: IVilkårResultat) =>
                            vilkårResultat.resultat === Resultat.IKKE_VURDERT
                    ).length > 0 ||
                    personResultat.andreVurderinger.filter(
                        (annenVurdering: IAnnenVurdering) =>
                            annenVurdering.resultat === Resultat.IKKE_VURDERT
                    ).length > 0
                );
            }).length === 0
        );
    };

    const hentVilkårMedFeil = (): IVilkårResultat[] => {
        return vilkårsvurdering.reduce(
            (accVilkårMedFeil: IVilkårResultat[], personResultat: IPersonResultat) => {
                return [
                    ...accVilkårMedFeil,
                    ...personResultat.vilkårResultater
                        .filter(
                            (vilkårResultat: IVilkårResultat) =>
                                vilkårResultat.resultat !== Resultat.OPPFYLT
                        )
                        .map((vilkårResultat: IVilkårResultat) => vilkårResultat),
                ];
            },
            []
        );
    };

    const hentAndreVurderingerMedFeil = (): IAnnenVurdering[] => {
        return vilkårsvurdering.reduce(
            (accAndreVurderingerMedFeil: IAnnenVurdering[], personResultat: IPersonResultat) => {
                return [
                    ...accAndreVurderingerMedFeil,
                    ...personResultat.andreVurderinger
                        .filter(
                            (vilkårResultat: IAnnenVurdering) =>
                                vilkårResultat.resultat !== Resultat.OPPFYLT
                        )
                        .map((annenVurdering: IAnnenVurdering) => annenVurdering),
                ];
            },
            []
        );
    };

    const personResultater = åpenBehandling.personResultater;

    return {
        erVilkårsvurderingenGyldig,
        hentVilkårMedFeil,
        hentAndreVurderingerMedFeil,
        settVilkårsvurdering,
        vilkårsvurdering,
        personResultater,
    };
});

export { VilkårsvurderingProvider, useVilkårsvurdering };

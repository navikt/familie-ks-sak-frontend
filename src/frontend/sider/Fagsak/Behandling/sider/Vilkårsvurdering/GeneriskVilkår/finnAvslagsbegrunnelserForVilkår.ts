import type { OptionType } from '@typer/common';
import { BegrunnelseType } from '@typer/vedtak';
import { type AlleBegrunnelser, Regelverk, type VilkårType } from '@typer/vilkår';

export function finnAvslagsbegrunnelserForVilkår(
    vilkårType: VilkårType,
    regelverk: Regelverk | null | undefined,
    alleBegrunnelser: AlleBegrunnelser | undefined
): OptionType[] {
    if (alleBegrunnelser === undefined) {
        return [];
    }

    const tilOptions = (begrunnelseType: BegrunnelseType) =>
        (alleBegrunnelser[begrunnelseType] ?? [])
            .filter(begrunnelse => begrunnelse.vilkår === vilkårType)
            .map(begrunnelse => ({ label: begrunnelse.navn, value: begrunnelse.id }));

    const eøsAvslagsbegrunnelser =
        regelverk === Regelverk.EØS_FORORDNINGEN ? tilOptions(BegrunnelseType.EØS_AVSLAG) : [];

    // Vilkår uten EØS-avslagsbegrunnelser (f.eks. medlemskap) må fortsatt kunne avslås eksplisitt under EØS,
    // siden eksplisitt avslag krever minst én avslagsbegrunnelse.
    return eøsAvslagsbegrunnelser.length > 0 ? eøsAvslagsbegrunnelser : tilOptions(BegrunnelseType.AVSLAG);
}

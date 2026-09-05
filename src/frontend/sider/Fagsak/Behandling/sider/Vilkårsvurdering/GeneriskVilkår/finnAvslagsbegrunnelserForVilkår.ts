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

    const gyldigeBegrunnelseTyper = [BegrunnelseType.AVSLAG];

    if (regelverk === Regelverk.EØS_FORORDNINGEN) {
        gyldigeBegrunnelseTyper.push(BegrunnelseType.EØS_AVSLAG);
    }

    return gyldigeBegrunnelseTyper.flatMap(begrunnelseType =>
        (alleBegrunnelser[begrunnelseType] ?? [])
            .filter(begrunnelse => begrunnelse.vilkår === vilkårType)
            .map(begrunnelse => ({ label: begrunnelse.navn, value: begrunnelse.id }))
    );
}

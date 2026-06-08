import type { OptionType } from '@typer/common';
import type { IRestBegrunnelseTilknyttetVilkår } from '@typer/vedtak';
import { BegrunnelseType } from '@typer/vedtak';
import type { AlleBegrunnelser, VilkårType } from '@typer/vilkår';
import { Regelverk } from '@typer/vilkår';

const useAvslagBegrunnelseMultiselect = (
    vilkårType: VilkårType,
    alleBegrunnelser: AlleBegrunnelser | undefined,
    regelverk?: Regelverk
) => {
    if (alleBegrunnelser === undefined) {
        return {
            grupperteAvslagsbegrunnelser: [],
        };
    }

    const gyldigeBegrunnelseTyper = [BegrunnelseType.AVSLAG];

    if (regelverk == Regelverk.EØS_FORORDNINGEN) {
        gyldigeBegrunnelseTyper.push(BegrunnelseType.EØS_AVSLAG);
    }

    const grupperteBegrunnelser = Object.keys(alleBegrunnelser)
        .map((type: string) => type as BegrunnelseType)
        .filter((begrunnelseType: BegrunnelseType) => gyldigeBegrunnelseTyper.includes(begrunnelseType))
        .reduce((acc: OptionType[], begrunnelseType: BegrunnelseType) => {
            return [
                ...acc,
                ...(alleBegrunnelser[begrunnelseType]
                    .filter((begrunnelse: IRestBegrunnelseTilknyttetVilkår) => begrunnelse.vilkår === vilkårType)
                    .map((begrunnelse: IRestBegrunnelseTilknyttetVilkår) => ({
                        label: begrunnelse.navn,
                        value: begrunnelse.id,
                    })) as OptionType[]),
            ];
        }, []);

    return {
        grupperteAvslagsbegrunnelser: grupperteBegrunnelser,
    };
};

export default useAvslagBegrunnelseMultiselect;

import type { GroupBase } from 'react-select';

import { RessursStatus } from '@navikt/familie-typer';

import type { OptionType } from '../../../../../../typer/common';
import type { IRestBegrunnelseTilknyttetVilkår } from '../../../../../../typer/vedtak';
import { BegrunnelseType, begrunnelseTyper } from '../../../../../../typer/vedtak';
import type { VilkårType } from '../../../../../../typer/vilkår';
import { Regelverk } from '../../../../../../typer/vilkår';
import { useVedtaksbegrunnelseTekster } from '../../Vedtak/Vedtaksperioder/VedtaksbegrunnelseTeksterContext';

const useAvslagBegrunnelseMultiselect = (vilkårType: VilkårType, regelverk?: Regelverk) => {
    const { vedtaksbegrunnelseTekster } = useVedtaksbegrunnelseTekster();

    if (vedtaksbegrunnelseTekster.status !== RessursStatus.SUKSESS) {
        return { grupperteAvslagsbegrunnelser: [] };
    }

    const gyldigeBegrunnelseTyper = [BegrunnelseType.AVSLAG];

    if (regelverk == Regelverk.EØS_FORORDNINGEN) {
        gyldigeBegrunnelseTyper.push(BegrunnelseType.EØS_AVSLAG);
    }

    const grupperteBegrunnelser = Object.keys(vedtaksbegrunnelseTekster.data)
        .map((type: string) => type as BegrunnelseType)
        .filter((begrunnelseType: BegrunnelseType) =>
            gyldigeBegrunnelseTyper.includes(begrunnelseType)
        )
        .reduce((acc: GroupBase<OptionType>[], begrunnelseType: BegrunnelseType) => {
            return [
                ...acc,
                {
                    label: begrunnelseTyper[begrunnelseType],
                    options: vedtaksbegrunnelseTekster.data[begrunnelseType]
                        .filter(
                            (begrunnelse: IRestBegrunnelseTilknyttetVilkår) =>
                                begrunnelse.vilkår === vilkårType
                        )
                        .map((begrunnelse: IRestBegrunnelseTilknyttetVilkår) => ({
                            label: begrunnelse.navn,
                            value: begrunnelse.id,
                        })),
                },
            ];
        }, []);

    return {
        grupperteAvslagsbegrunnelser: grupperteBegrunnelser,
    };
};

export default useAvslagBegrunnelseMultiselect;

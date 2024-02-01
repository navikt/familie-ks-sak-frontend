import { RessursStatus } from '@navikt/familie-typer';

import type { IRestBegrunnelseTilknyttetVilkår } from '../../../../typer/vedtak';
import type { VilkårType } from '../../../../typer/vilkår';
import { Regelverk } from '../../../../typer/vilkår';
import { useVedtaksbegrunnelseTekster } from '../../Vedtak/VedtakBegrunnelserTabell/Context/VedtaksbegrunnelseTeksterContext';

const useAvslagBegrunnelseMultiselect = (vilkårType: VilkårType, regelverk?: Regelverk) => {
    const { vedtaksbegrunnelseTekster } = useVedtaksbegrunnelseTekster();

    if (vedtaksbegrunnelseTekster.status !== RessursStatus.SUKSESS) {
        return { avslagBegrunnelseTeksterForGjeldendeVilkår: [] };
    }

    const nasjonaleBegrunnelser = vedtaksbegrunnelseTekster.data.AVSLAG.filter(
        (begrunnelse: IRestBegrunnelseTilknyttetVilkår) => begrunnelse.vilkår === vilkårType
    );

    const avslagBegrunnelseTeksterForGjeldendeVilkår =
        regelverk == Regelverk.EØS_FORORDNINGEN
            ? nasjonaleBegrunnelser.concat(
                  vedtaksbegrunnelseTekster.data.EØS_AVSLAG.filter(
                      (begrunnelse: IRestBegrunnelseTilknyttetVilkår) =>
                          begrunnelse.vilkår === vilkårType
                  )
              )
            : nasjonaleBegrunnelser;

    return {
        avslagBegrunnelseTeksterForGjeldendeVilkår,
    };
};

export default useAvslagBegrunnelseMultiselect;

import { RessursStatus } from '@navikt/familie-typer';

import type { IRestBegrunnelseTilknyttetVilkår } from '../../../../typer/vedtak';
import type { VilkårType } from '../../../../typer/vilkår';
import { useVedtaksbegrunnelseTekster } from '../../Vedtak/VedtakBegrunnelserTabell/Context/VedtaksbegrunnelseTeksterContext';

const useAvslagBegrunnelseMultiselect = (vilkårType: VilkårType) => {
    const { vedtaksbegrunnelseTekster } = useVedtaksbegrunnelseTekster();

    const avslagBegrunnelseTeksterForGjeldendeVilkår =
        vedtaksbegrunnelseTekster.status === RessursStatus.SUKSESS
            ? vedtaksbegrunnelseTekster.data.AVSLAG.filter(
                  (begrunnelse: IRestBegrunnelseTilknyttetVilkår) =>
                      begrunnelse.vilkår === vilkårType
              )
            : [];

    return {
        avslagBegrunnelseTeksterForGjeldendeVilkår,
    };
};

export default useAvslagBegrunnelseMultiselect;

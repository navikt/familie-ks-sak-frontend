import {
    ABorderDanger,
    ABorderDefault,
    ABorderSubtle,
    ABorderSuccess,
    ABorderWarning,
    ASurfaceActionSubtle,
    ASurfaceDangerSubtle,
    ASurfaceNeutralSubtle,
    ASurfaceSuccessSubtle,
    ASurfaceWarningSubtle,
} from '@navikt/ds-tokens/dist/tokens';
import type { Ressurs } from '@navikt/familie-typer';
import { RessursStatus } from '@navikt/familie-typer';

import { BehandlingResultat } from '../typer/behandling';
import type { Begrunnelse, IRestBegrunnelseTilknyttetVilkår } from '../typer/vedtak';
import { BegrunnelseType } from '../typer/vedtak';
import type { AlleBegrunnelser } from '../typer/vilkår';

export const finnBegrunnelseType = (
    vilkårBegrunnelser: Ressurs<AlleBegrunnelser>,
    begrunnelse: Begrunnelse
): BegrunnelseType | undefined => {
    return vilkårBegrunnelser.status === RessursStatus.SUKSESS
        ? (Object.keys(vilkårBegrunnelser.data).find(begrunnelseType => {
              return (
                  vilkårBegrunnelser.data[begrunnelseType as BegrunnelseType].find(
                      (begrunnelseTilknyttetVilkår: IRestBegrunnelseTilknyttetVilkår) =>
                          begrunnelseTilknyttetVilkår.id === begrunnelse
                  ) !== undefined
              );
          }) as BegrunnelseType)
        : undefined;
};

export const hentBakgrunnsfarge = (begrunnelseType?: BegrunnelseType) => {
    switch (begrunnelseType) {
        case BegrunnelseType.INNVILGET:
        case BegrunnelseType.FORTSATT_INNVILGET:
            return ASurfaceSuccessSubtle;
        case BegrunnelseType.AVSLAG:
            return ASurfaceDangerSubtle;
        case BegrunnelseType.REDUKSJON:
            return ASurfaceWarningSubtle;
        case BegrunnelseType.OPPHØR:
            return ASurfaceNeutralSubtle;
        default:
            return ASurfaceActionSubtle;
    }
};

export const hentBorderfarge = (begrunnelseType?: BegrunnelseType) => {
    switch (begrunnelseType) {
        case BegrunnelseType.INNVILGET:
        case BegrunnelseType.FORTSATT_INNVILGET:
            return ABorderSuccess;
        case BegrunnelseType.AVSLAG:
            return ABorderDanger;
        case BegrunnelseType.REDUKSJON:
            return ABorderWarning;
        case BegrunnelseType.OPPHØR:
            return ABorderDefault;
        default:
            return ABorderSubtle;
    }
};

export const vedtakHarFortsattUtbetaling = (behandlingResultat: BehandlingResultat) =>
    [
        BehandlingResultat.INNVILGET,
        BehandlingResultat.INNVILGET_OG_OPPHØRT,
        BehandlingResultat.INNVILGET_OG_ENDRET,
        BehandlingResultat.INNVILGET_ENDRET_OG_OPPHØRT,
        BehandlingResultat.DELVIS_INNVILGET,
        BehandlingResultat.DELVIS_INNVILGET_OG_OPPHØRT,
        BehandlingResultat.DELVIS_INNVILGET_OG_ENDRET,
        BehandlingResultat.DELVIS_INNVILGET_ENDRET_OG_OPPHØRT,
        BehandlingResultat.AVSLÅTT_OG_ENDRET,
        BehandlingResultat.AVSLÅTT_ENDRET_OG_OPPHØRT,
        BehandlingResultat.ENDRET_UTBETALING,
        BehandlingResultat.ENDRET_OG_OPPHØRT,
        BehandlingResultat.FORTSATT_INNVILGET,
    ].includes(behandlingResultat);

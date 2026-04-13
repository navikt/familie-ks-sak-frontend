import {
    BgAccentSoft,
    BgDangerSoft,
    BgNeutralSoft,
    BgSuccessSoft,
    BgWarningSoft,
    BorderDanger,
    BorderNeutral,
    BorderNeutralSubtle,
    BorderSuccess,
    BorderWarning,
} from '@navikt/ds-tokens/dist/tokens';

import { BehandlingResultat } from '../typer/behandling';
import type { Begrunnelse, IRestBegrunnelseTilknyttetVilkår } from '../typer/vedtak';
import { BegrunnelseType } from '../typer/vedtak';
import type { AlleBegrunnelser } from '../typer/vilkår';

export const finnBegrunnelseType = (
    vilkårBegrunnelser: AlleBegrunnelser,
    begrunnelse: Begrunnelse
): BegrunnelseType | undefined => {
    return Object.keys(vilkårBegrunnelser).find(begrunnelseType => {
        return (
            vilkårBegrunnelser[begrunnelseType as BegrunnelseType].find(
                (begrunnelseTilknyttetVilkår: IRestBegrunnelseTilknyttetVilkår) =>
                    begrunnelseTilknyttetVilkår.id === begrunnelse
            ) !== undefined
        );
    }) as BegrunnelseType;
};

export const hentBakgrunnsfarge = (begrunnelseType?: BegrunnelseType) => {
    switch (begrunnelseType) {
        case BegrunnelseType.INNVILGET:
        case BegrunnelseType.FORTSATT_INNVILGET:
            return BgSuccessSoft;
        case BegrunnelseType.AVSLAG:
            return BgDangerSoft;
        case BegrunnelseType.REDUKSJON:
            return BgWarningSoft;
        case BegrunnelseType.OPPHØR:
            return BgNeutralSoft;
        default:
            return BgAccentSoft;
    }
};

export const hentBorderfarge = (begrunnelseType?: BegrunnelseType) => {
    switch (begrunnelseType) {
        case BegrunnelseType.INNVILGET:
        case BegrunnelseType.FORTSATT_INNVILGET:
            return BorderSuccess;
        case BegrunnelseType.AVSLAG:
            return BorderDanger;
        case BegrunnelseType.REDUKSJON:
            return BorderWarning;
        case BegrunnelseType.OPPHØR:
            return BorderNeutral;
        default:
            return BorderNeutralSubtle;
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

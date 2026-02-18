import type {
    BehandlingResultat,
    BehandlingStatus,
    Behandlingstype,
    BehandlingÅrsak,
    IBehandling,
} from '../../../typer/behandling';
import type { BehandlingKategori } from '../../../typer/behandlingstema';

export interface VisningBehandling {
    aktiv: boolean;
    behandlingId: number | string;
    opprettetTidspunkt: string;
    aktivertTidspunkt: string;
    resultat?: BehandlingResultat;
    status: BehandlingStatus;
    type: Behandlingstype;
    kategori: BehandlingKategori;
    vedtaksdato?: string;
    årsak?: BehandlingÅrsak;
}

export function lagVisningsBehandlingFraBehandling(behandling: IBehandling): VisningBehandling {
    return {
        aktiv: behandling.aktiv,
        aktivertTidspunkt: behandling.aktivertTidspunkt,
        behandlingId: behandling.behandlingId,
        kategori: behandling.kategori,
        opprettetTidspunkt: behandling.opprettetTidspunkt,
        resultat: behandling.resultat,
        status: behandling.status,
        type: behandling.type,
        vedtaksdato: behandling.vedtak?.vedtaksdato,
        årsak: behandling.årsak,
    };
}

import type {
    BehandlingResultat,
    BehandlingStatus,
    Behandlingstype,
    BehandlingÅrsak,
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

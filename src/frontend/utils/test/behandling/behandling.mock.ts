import type { VisningBehandling } from '../../../sider/Fagsak/Saksoversikt/visningBehandling';
import type { IBehandling } from '../../../typer/behandling';
import {
    BehandlingResultat,
    BehandlingStatus,
    BehandlingSteg,
    BehandlingStegStatus,
    Behandlingstype,
    BehandlingÅrsak,
} from '../../../typer/behandling';
import { BehandlingKategori } from '../../../typer/behandlingstema';
import type { IRestPersonResultat, IRestStegTilstand } from '../../../typer/vilkår';
import { mockBarn, mockSøker } from '../person/person.mock';
import { mockRestPersonResultat } from '../vilkårsvurdering/vilkår.mock';

interface IMockBehandling {
    behandlingId?: number;
    aktiv?: boolean;
    steg?: BehandlingSteg;
    status?: BehandlingStatus;
    opprettetTidspunkt?: string;
    årsak?: BehandlingÅrsak;
    type?: Behandlingstype;
    skalBehandlesAutomatisk?: boolean;
    stegTilstand?: IRestStegTilstand[];
}

export const mockBehandling = ({
    behandlingId = 1,
    opprettetTidspunkt = '2020-03-19T09:08:56.8',
    steg = BehandlingSteg.VILKÅRSVURDERING,
    status = BehandlingStatus.FATTER_VEDTAK,
    årsak = BehandlingÅrsak.SØKNAD,
    type = Behandlingstype.FØRSTEGANGSBEHANDLING,
    stegTilstand = [
        {
            behandlingSteg: BehandlingSteg.REGISTRERE_SØKNAD,
            behandlingStegStatus: BehandlingStegStatus.UTFØRT,
        },
        {
            behandlingSteg: BehandlingSteg.REGISTRERE_PERSONGRUNNLAG,
            behandlingStegStatus: BehandlingStegStatus.UTFØRT,
        },
    ],
}: IMockBehandling = {}): IBehandling => {
    const barn = mockBarn;

    const søker = mockSøker();

    const søkerRestPersonResultat: IRestPersonResultat = mockRestPersonResultat({
        personIdent: søker.personIdent,
    });

    const barnRestPersonResultat: IRestPersonResultat = mockRestPersonResultat({
        personIdent: barn.personIdent,
    });

    return {
        behandlingId,
        endretAv: 'VL',
        arbeidsfordelingPåBehandling: {
            behandlendeEnhetId: '4820',
            behandlendeEnhetNavn: 'enhet navn',
            manueltOverstyrt: false,
        },
        steg: steg,
        stegTilstand: stegTilstand,
        type: type,
        personer: [barn, søker],
        resultat: BehandlingResultat.INNVILGET,
        opprettetTidspunkt,
        kategori: BehandlingKategori.NASJONAL,
        status,
        personResultater: [søkerRestPersonResultat, barnRestPersonResultat],
        vedtak: undefined,
        totrinnskontroll: {
            saksbehandler: 'Saksbehandler',
            saksbehandlerId: 'VL',
            beslutter: 'Beslutter',
            godkjent: true,
            opprettetTidspunkt,
        },
        utbetalingsperioder: [],
        endretUtbetalingAndeler: [],
        overgangsordningAndeler: [],
        personerMedAndelerTilkjentYtelse: [],
        årsak: årsak,
        kompetanser: [],
        utenlandskePeriodebeløp: [],
        valutakurser: [],
        feilutbetaltValuta: [],
        refusjonEøs: [],
        brevmottakere: [],
    };
};

export const mockVisningBehandling = ({
    behandlingId = 1,
    opprettetTidspunkt = '2020-03-19T09:08:56.8',
    status = BehandlingStatus.FATTER_VEDTAK,
    aktiv = true,
    årsak = BehandlingÅrsak.SØKNAD,
    type = Behandlingstype.FØRSTEGANGSBEHANDLING,
}: IMockBehandling = {}): VisningBehandling => {
    return {
        behandlingId,
        aktiv,
        type: type,
        resultat: BehandlingResultat.INNVILGET,
        opprettetTidspunkt,
        aktivertTidspunkt: opprettetTidspunkt,
        kategori: BehandlingKategori.NASJONAL,
        status,
        årsak,
        vedtaksdato: undefined,
    };
};

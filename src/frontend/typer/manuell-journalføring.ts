import type { IJournalpost } from '@navikt/familie-typer';

import type { Behandlingstype, BehandlingÅrsak } from './behandling';
import type { BehandlingKategori } from './behandlingstema';
import type { IMinimalFagsak } from './fagsak';
import type { Journalføringsbehandlingstype } from './journalføringsbehandling';
import type { IKlagebehandling } from './klage';
import type { IOppgave } from './oppgave';
import type { IPersonInfo } from './person';

export interface IDataForManuellJournalføring {
    journalpost: IJournalpost;
    oppgave: IOppgave;
    person?: IPersonInfo;
    minimalFagsak?: IMinimalFagsak;
    klagebehandlinger: IKlagebehandling[];
}

interface IRestJournalpostDokument {
    dokumentTittel?: string;
    dokumentInfoId: string;
    brevkode?: string;
    logiskeVedlegg?: ILogiskVedlegg[];
    eksisterendeLogiskeVedlegg?: ILogiskVedlegg[];
}

export interface IRestJournalføring {
    avsender: INavnOgIdent;
    bruker: INavnOgIdent;
    datoMottatt?: string;
    journalpostTittel?: string;
    kategori: BehandlingKategori | null;
    knyttTilFagsak: boolean;
    opprettOgKnyttTilNyBehandling: boolean;
    tilknyttedeBehandlinger: TilknyttetBehandling[];
    tilknyttedeBehandlingIder: string[];
    dokumenter?: IRestJournalpostDokument[];
    navIdent: string;
    nyBehandlingstype: Behandlingstype;
    nyBehandlingsårsak: BehandlingÅrsak;
    journalførendeEnhet: string;
    fagsakId?: number;
}

interface ILogiskVedlegg {
    logiskVedleggId: string;
    tittel: string;
}

export interface INavnOgIdent {
    navn: string;
    id: string;
}

export enum JournalpostTittel {
    SØKNAD_OM_KONTANTSTØTTE = 'Søknad om kontantstøtte',
    ETTERSENDELSE_TIL_SØKNAD_OM_KONTANTSTØTTE = 'Ettersendelse til søknad om kontantstøtte',
    TILLEGGSSKJEMA_EØS = 'Tilleggsskjema EØS',
}

export const BrevkodeMap = new Map<string | undefined, string>([
    [JournalpostTittel.SØKNAD_OM_KONTANTSTØTTE.toString(), 'NAV 34-00.08'],
    [JournalpostTittel.ETTERSENDELSE_TIL_SØKNAD_OM_KONTANTSTØTTE.toString(), 'NAVe 33-00.08'],
    [JournalpostTittel.TILLEGGSSKJEMA_EØS.toString(), 'NAV 34-00.15'],
]);

export enum DokumentTittel {
    AVTALE_OM_DELT_BOSTED = 'Avtale om delt bosted',
    ARBEIDSAVTALE = 'Arbeidsavtale',
    DOKUMENTASJON_PÅ_BARNEHAGEPLASS = 'Dokumentasjon på barnehageplass',
    DOKUMENTASJON_PÅ_DATO_FOR_OVERTAKELSE_AV_OMSORG = 'Dokumentasjon på dato for overtakelse av omsorg',
    EØS_REGISTRERINGSBEVIS = 'EØS registreringsbevis',
    EØS_VARIG_OPPHOLDSBEVIS = 'EØS varig oppholdsbevis',
    F001 = 'F001',
    F002 = 'F002',
    FULLMAKT = 'Fullmakt',
    FØDSELSATTEST = 'Fødselsattest',
    H001 = 'H001',
    H002 = 'H002',
    KLAGE = 'Klage',
    KLAGE_PÅ_TILBAKEKREVING = 'Klage på tilbakekreving',
    KONTOOPPLYSNINGER = 'Kontoopplysninger',
    LØNNSSLIPPER = 'Lønnsslipper',
    OPPHOLDSTILLATELSE_LOVLIG_OPPHOLD = 'Oppholdstillatelse/lovlig opphold',
    PASS_ID_PAPIRER = 'Pass/ID-papirer',
    REGISTRERUTSKRIFT_FRA_BRØNNØYSUNDREGISTRENE = 'Registerutskrift fra Brønnøysundregistrene',
    UTENLANDSOPPHOLD = 'Utenlandsopphold',
    UTTALELSE = 'Uttalelse',
    UTTALELSE_TILBAKEKREVING = 'Uttalelse tilbakekreving',
    VIGSELSATTEST = 'Vigselsattest',
}

export enum JournalpostKanal {
    NAV_NO = 'NAV_NO',
    SCAN_IM = 'SCAN_IM',
}

export type TilknyttetBehandling = {
    behandlingstype: Journalføringsbehandlingstype;
    behandlingId: string;
};

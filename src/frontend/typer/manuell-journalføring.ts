import type { IJournalpost } from '@navikt/familie-typer';

import type { Behandlingstype, BehandlingÅrsak } from './behandling';
import type { BehandlingKategori } from './behandlingstema';
import type { INøkkelPar } from './common';
import type { IMinimalFagsak } from './fagsak';
import type { IOppgave } from './oppgave';
import type { IPersonInfo } from './person';
import type { Tilbakekrevingsbehandlingstype } from './tilbakekrevingsbehandling';

export interface IDataForManuellJournalføring {
    journalpost: IJournalpost;
    oppgave: IOppgave;
    person?: IPersonInfo;
    minimalFagsak?: IMinimalFagsak;
}

export enum LogiskeVedleggTyper {
    OPPHOLDSTILLATELSE = 'OPPHOLDSTILLATELSE',
    PASS_OG_ID_PAPIRER = 'PASS_OG_ID_PAPIRER',
}

export const logiskeVedleggTyper: INøkkelPar = {
    OPPHOLDSTILLATELSE: {
        id: 'OPPHOLDSTILLATELSE',
        navn: 'Oppholdstillatelse',
    },
    PASS_OG_ID_PAPIRER: {
        id: 'PASS_OG_ID_PAPIRER',
        navn: 'Pass/ID-papirer og annet',
    },
};

export interface IRestJournalpostDokument {
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
    tilknyttedeBehandlingIder: number[];
    dokumenter?: IRestJournalpostDokument[];
    navIdent: string;
    nyBehandlingstype: Behandlingstype | Tilbakekrevingsbehandlingstype;
    nyBehandlingsårsak: BehandlingÅrsak;
    journalførendeEnhet: string;
}

export interface ILogiskVedlegg {
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
    TILLEGGSSKJEMA_VED_KRAV_OM_UTBETALING = 'Tilleggsskjema EØS',
}

export const BrevkodeMap = new Map<string | undefined, string>([
    [JournalpostTittel.SØKNAD_OM_KONTANTSTØTTE.toString(), 'NAV 34-00.08'],
    [JournalpostTittel.ETTERSENDELSE_TIL_SØKNAD_OM_KONTANTSTØTTE.toString(), 'NAVe 33-00.08'],
    [JournalpostTittel.TILLEGGSSKJEMA_VED_KRAV_OM_UTBETALING.toString(), 'NAV 34-00.15'],
]);

export enum DokumentTittel {
    AVTALE_OM_DELT_BOSTED = 'Avtale om delt bosted',
    AVTALE_OM_FAST_BOSTED_SAMVÆR = 'Avtale om fast bosted/samvær',
    ARBEIDSAVTALE = 'Arbeidsavtale',
    BEKREFTELSE_PÅ_UTENLANDSOPPHOLD = 'Bekreftelse på utenlandsopphold',
    BEKREFTELSE_PÅ_OPPHOLDSTILLATELSE = 'Bekreftelse på oppholdstillatelse',
    BEKREFTELSE_PÅ_ASYLSTATUS = 'Bekreftelse på asylstatus',
    DOKUMENTASJON_PÅ_DATO_FOR_OVERTAKELSE_AV_OMSORG = 'Dokumentasjon på dato for overtakelse av omsorg',
    DOKUMENTASJON_PÅ_ADOPSJON = 'Dokumentasjon på adopsjon',
    ERKLÆRING_OM_SAMLIVSBRUDD = 'Erklæring om samlivsbrudd',
    EØS_REGISTERINGSBEVIS = 'EØS registreringsbevis',
    EØS_VARIG_OPPHOLDBEVIS = 'EØS varig oppholdbevis',
    F001 = 'F001',
    F002 = 'F002',
    FØDSELSATTEST = 'Fødselsattest',
    KONTOOPPLYSNINGER = 'Kontoopplysninger',
    PASS_ID_PAPIRER = 'Pass/ID-papirer',
    REGISTERUTSKRIFT_FRA_BRØNNØYSUNDREGISTRENE = 'Registerutskrift fra Brønnøysundregistrene',
    UTTALELSE = 'Uttalelse',
    UTTALELSE_TILBAKEKREVING = 'Uttalelse tilbakekreving',
}

export enum JournalpostKanal {
    NAV_NO = 'NAV_NO',
    SCAN_IM = 'SCAN_IM',
}

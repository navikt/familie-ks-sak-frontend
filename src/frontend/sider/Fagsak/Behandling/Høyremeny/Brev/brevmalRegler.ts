import { BehandlingKategori } from '@typer/behandlingstema';

import { Brevmal } from './typer';

export const skalViseFritekstKulepunkter = (brevmal: Brevmal | ''): boolean =>
    brevmal !== '' && ![Brevmal.SVARTIDSBREV, Brevmal.UTBETALING_ETTER_KA_VEDTAK].includes(brevmal);

export const skalViseFritekstAvsnitt = (brevmal: Brevmal | ''): boolean =>
    brevmal !== '' && [Brevmal.UTBETALING_ETTER_KA_VEDTAK].includes(brevmal);

export const skalViseAntallUkerSvarfrist = (brevmal: Brevmal | ''): boolean =>
    brevmal !== '' && [Brevmal.FORLENGET_SVARTIDSBREV].includes(brevmal);

export const skalViseDokumenter = (brevmal: Brevmal | ''): boolean =>
    brevmal !== '' &&
    [
        Brevmal.INNHENTE_OPPLYSNINGER,
        Brevmal.INNHENTE_OPPLYSNINGER_ETTER_SØKNAD_I_SED,
        Brevmal.INNHENTE_OPPLYSNINGER_OG_INFORMASJON_OM_AT_ANNEN_FORELDER_MED_SELVSTENDIG_RETT_HAR_SØKT,
    ].includes(brevmal);

export const skalViseBarnBrevetGjelder = (brevmal: Brevmal | ''): boolean =>
    brevmal !== '' &&
    [
        Brevmal.INNHENTE_OPPLYSNINGER_ETTER_SØKNAD_I_SED,
        Brevmal.INNHENTE_OPPLYSNINGER_OG_INFORMASJON_OM_AT_ANNEN_FORELDER_MED_SELVSTENDIG_RETT_HAR_SØKT,
        Brevmal.VARSEL_OM_VEDTAK_ETTER_SØKNAD_I_SED,
        Brevmal.VARSEL_ANNEN_FORELDER_MED_SELVSTENDIG_RETT_SØKT,
    ].includes(brevmal);

export const skalViseMottakerlandSed = (brevmal: Brevmal | '', behandlingKategori?: BehandlingKategori): boolean =>
    // På svartidsbrev vises feltet kun for EØS-behandlinger.
    brevmal === Brevmal.SVARTIDSBREV && behandlingKategori === BehandlingKategori.EØS;

export const erBrevmalMedObligatoriskFritekstKulepunkt = (brevmal: Brevmal): boolean =>
    [
        Brevmal.VARSEL_OM_REVURDERING,
        Brevmal.VARSEL_OM_REVURDERING_FRA_NASJONAL_TIL_EØS,
        Brevmal.VARSEL_OM_VEDTAK_ETTER_SØKNAD_I_SED,
        Brevmal.VARSEL_ANNEN_FORELDER_MED_SELVSTENDIG_RETT_SØKT,
        Brevmal.FORLENGET_SVARTIDSBREV,
    ].includes(brevmal);

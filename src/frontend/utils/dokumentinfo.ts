import type { IDokumentInfo, IJournalpost } from '@navikt/familie-typer';
import { type IRestJournalpostDokument, JournalpostKanal } from '@typer/manuell-journalføring';

export function lagJournalpostDokumenterForJournalføring(dokumenter: IDokumentInfo[]): IRestJournalpostDokument[] {
    return dokumenter.map(dokument => ({
        dokumentTittel: dokument.tittel,
        dokumentInfoId: dokument.dokumentInfoId || '0',
        logiskeVedlegg: dokument.logiskeVedlegg,
    }));
}

//SKAN_IM-kanalen benytter logiske vedlegg, NAV_NO-kanalen gjør ikke. For sistnevnte må titlene konkateneres.
export function lagJournalpostDokumenterMedEksisterendeLogiskeVedlegg(
    dokumenter: IDokumentInfo[],
    journalpost: IJournalpost
): IRestJournalpostDokument[] {
    const erDigitalKanal = journalpost.kanal === JournalpostKanal.NAV_NO;

    return dokumenter.map(dokument => {
        const exsisterendeLogiskeVedlegg = journalpost.dokumenter?.find(
            it => it.dokumentInfoId === dokument.dokumentInfoId
        )?.logiskeVedlegg;

        const tittelsammenkobling = dokument.logiskeVedlegg
            .map(current => current.tittel)
            .reduce((previous, current) => `${previous}, ${current}`, dokument.tittel ?? '');

        return {
            dokumentTittel: erDigitalKanal ? tittelsammenkobling : dokument.tittel,
            dokumentInfoId: dokument.dokumentInfoId || '0',
            eksisterendeLogiskeVedlegg: exsisterendeLogiskeVedlegg,
            logiskeVedlegg: erDigitalKanal ? exsisterendeLogiskeVedlegg : dokument.logiskeVedlegg,
        };
    });
}

import { apiClient } from '@api/client/apiClient';

export async function hentJournalpostDokumentPdf(journalpostId: string, dokumentId: string): Promise<string> {
    return apiClient.get<void, string>({
        url: `/familie-ks-sak/api/journalpost/${journalpostId}/dokument/${dokumentId}`,
    });
}

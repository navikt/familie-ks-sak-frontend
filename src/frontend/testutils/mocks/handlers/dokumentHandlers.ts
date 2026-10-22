import { byggSuksessRessurs } from '@navikt/familie-typer';
import { HttpResponse, http } from 'msw';

// Minimal PDF, base64-kodet slik backend returnerer brev og dokumenter.
export const TOM_PDF_BASE64 = btoa('%PDF-1.4\n%%EOF\n');

export const dokumentHandlers = [
    http.post('/familie-ks-sak/api/journalpost/bruker', () => {
        return HttpResponse.json(byggSuksessRessurs([]));
    }),
    http.get<{ journalpostId: string; dokumentInfoId: string }>(
        '/familie-ks-sak/api/journalpost/:journalpostId/dokument/:dokumentInfoId',
        () => {
            return HttpResponse.json(byggSuksessRessurs(TOM_PDF_BASE64));
        }
    ),
    http.all<{ behandlingId: string }>('/familie-ks-sak/api/brev/forhaandsvis-vedtaksbrev/:behandlingId', () => {
        return HttpResponse.json(byggSuksessRessurs(TOM_PDF_BASE64));
    }),
    http.all<{ behandlingId: string }>(
        '/familie-ks-sak/api/brev/forhaandsvis-og-lagre-vedtaksbrev/:behandlingId',
        () => {
            return HttpResponse.json(byggSuksessRessurs(TOM_PDF_BASE64));
        }
    ),
];

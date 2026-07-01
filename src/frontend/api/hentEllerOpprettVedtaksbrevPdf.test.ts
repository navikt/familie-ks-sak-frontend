import { apiClient } from '@api/client/apiClient';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { hentEllerOpprettVedtaksbrevPdf } from './hentEllerOpprettVedtaksbrevPdf';

vi.mock('@api/client/apiClient', () => ({
    apiClient: {
        request: vi.fn(),
    },
}));

afterEach(() => {
    vi.clearAllMocks();
});

const base64Pdf = 'JVBERi0xLjQK'; // base64-encodet "%PDF-1.4"

describe('hentEllerOpprettVedtaksbrevPdf', () => {
    test.each([
        ['GET', 'forhaandsvis-vedtaksbrev', '/familie-ks-sak/api/brev/forhaandsvis-vedtaksbrev/123'],
        ['POST', 'forhaandsvis-og-lagre-vedtaksbrev', '/familie-ks-sak/api/brev/forhaandsvis-og-lagre-vedtaksbrev/123'],
    ] as const)(
        'kaller apiClient.request med httpMethod %s og riktig URL for urlSegment %s',
        async (httpMethod, urlSegment, forventetUrl) => {
            vi.mocked(apiClient.request).mockResolvedValue(base64Pdf);

            const result = await hentEllerOpprettVedtaksbrevPdf(httpMethod, {
                urlSegment,
                behandlingId: 123,
            });

            expect(apiClient.request).toHaveBeenCalledWith({
                method: httpMethod,
                url: forventetUrl,
            });
            expect(result).toBe(base64Pdf);
        }
    );

    test('kaster feil ved avvist promise', async () => {
        vi.mocked(apiClient.request).mockRejectedValue(new Error('Noe gikk galt'));

        await expect(
            hentEllerOpprettVedtaksbrevPdf('POST', {
                urlSegment: 'forhaandsvis-og-lagre-vedtaksbrev',
                behandlingId: 123,
            })
        ).rejects.toThrow('Noe gikk galt');
    });
});

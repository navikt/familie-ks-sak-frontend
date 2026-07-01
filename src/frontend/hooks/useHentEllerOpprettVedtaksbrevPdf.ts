import { hentEllerOpprettVedtaksbrevPdf } from '@api/hentEllerOpprettVedtaksbrevPdf';
import { type DefaultError, useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { opprettPdfBlob } from '@utils/blob';

interface Parameters {
    behandlingId: number;
    httpMethod: 'GET' | 'POST';
    urlSegment: 'forhaandsvis-og-lagre-vedtaksbrev' | 'forhaandsvis-vedtaksbrev';
}

type Options = Omit<UseMutationOptions<string, DefaultError, Parameters>, 'mutationFn'>;

export function useHentEllerOpprettVedtaksbrevPdf(options?: Options) {
    return useMutation({
        mutationFn: async (parameters: Parameters) => {
            const { behandlingId, httpMethod, urlSegment } = parameters;
            const bytes = await hentEllerOpprettVedtaksbrevPdf(httpMethod, { behandlingId, urlSegment });
            const blob = opprettPdfBlob(bytes);
            return window.URL.createObjectURL(blob);
        },
        ...options,
    });
}

import { hentEllerOpprettVedtaksbrevPdf } from '@api/hentEllerOpprettVedtaksbrevPdf';
import { type DefaultError, useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { opprettPdfBlob } from '@utils/blob';

interface Parameters {
    behandlingId: number;
    urlSegment: 'forhaandsvis-og-lagre-vedtaksbrev' | 'forhaandsvis-vedtaksbrev';
    httpMethod: 'GET' | 'POST';
}

type Options = Omit<UseMutationOptions<string, DefaultError, Parameters>, 'mutationFn'>;

export function useHentEllerOpprettVedtaksbrevPdf(options?: Options) {
    return useMutation({
        mutationFn: async (parameters: Parameters) => {
            const { httpMethod, urlSegment, behandlingId } = parameters;
            const bytes = await hentEllerOpprettVedtaksbrevPdf(httpMethod, { urlSegment, behandlingId });
            const blob = opprettPdfBlob(bytes);
            return window.URL.createObjectURL(blob);
        },
        ...options,
    });
}

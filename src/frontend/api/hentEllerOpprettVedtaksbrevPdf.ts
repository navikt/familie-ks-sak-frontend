import { apiClient } from '@api/client/apiClient';

interface PathParams {
    behandlingId: number;
    urlSegment: 'forhaandsvis-og-lagre-vedtaksbrev' | 'forhaandsvis-vedtaksbrev';
}

export async function hentEllerOpprettVedtaksbrevPdf(httpMethod: 'GET' | 'POST', pathParams: PathParams) {
    const { urlSegment, behandlingId } = pathParams;
    return apiClient.request<void, string>({
        method: httpMethod,
        url: `/familie-ks-sak/api/brev/${urlSegment}/${behandlingId}`,
    });
}

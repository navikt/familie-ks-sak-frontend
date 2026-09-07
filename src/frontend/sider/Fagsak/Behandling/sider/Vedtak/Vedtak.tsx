import { Layout } from '@sider/Fagsak/Behandling/sider/Vedtak/Layout/Layout';

import { BehandlingUtenVedtaksbrevAdvarsel } from './BehandlingUtenVedtaksbrevAdvarsel';
import { OppsummeringVedtakInnhold } from './OppsummeringVedtakInnhold';
import { useErBehandlingMedVedtaksbrev } from './useErBehandlingMedVedtaksbrev';

export function Vedtak() {
    const erBehandlingMedVedtaksbrev = useErBehandlingMedVedtaksbrev();

    if (!erBehandlingMedVedtaksbrev) {
        return (
            <Layout>
                <BehandlingUtenVedtaksbrevAdvarsel />
            </Layout>
        );
    }

    return (
        <Layout>
            <OppsummeringVedtakInnhold />
        </Layout>
    );
}

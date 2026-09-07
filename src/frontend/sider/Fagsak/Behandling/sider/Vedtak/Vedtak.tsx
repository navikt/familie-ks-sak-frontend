import { useBehandling } from '@hooks/useBehandling';
import { useOpprettSammensattKontrollsakError } from '@hooks/useOpprettSammensattKontrollsakError';
import { useSlettSammensattKontrollsakError } from '@hooks/useSlettSammensattKontrollsakError';
import { BrevmottakereBehandlingAdvarsel } from '@komponenter/Brevmottaker/BrevmottakereBehandlingAdvarsel';
import { Layout } from '@sider/Fagsak/Behandling/sider/Vedtak/Layout/Layout';

import { Box, LocalAlert, VStack } from '@navikt/ds-react';

import { BehandlingUtenVedtaksbrevAdvarsel } from './BehandlingUtenVedtaksbrevAdvarsel';
import { FeilutbetaltValutaTabell } from './FeilutbetaltValuta/FeilutbetaltValutaTabell';
import { useFeilutbetaltValutaTabellContext } from './FeilutbetaltValuta/FeilutbetaltValutaTabellContext';
import { ForhåndsvisVedtaksbrev } from './ForhåndsvisVedtaksbrev';
import { IngenVedtaksbrevbyggerAdvarsel } from './IngenVedtaksbrevbyggerAdvarsel';
import { KorrigertEtterbetalingAdvarsel } from './KorrigerEtterbetaling/KorrigertEtterbetalingAdvarsel';
import { KorrigertVedtakAdvarsel } from './KorrigerVedtak/KorrigertVedtakAdvarsel';
import { RefusjonEøsTabell } from './RefusjonEøs/RefusjonEøsTabell';
import { useRefusjonEøsTabellContext } from './RefusjonEøs/RefusjonEøsTabellContext';
import { SammensattKontrollsak } from './SammensattKontrollsak/SammensattKontrollsak';
import { useSammensattKontrollsakContext } from './SammensattKontrollsak/SammensattKontrollsakContext';
import { useErBehandlingMedVedtaksbrev } from './useErBehandlingMedVedtaksbrev';
import { useErBehandlingMedVedtaksbrevbygger } from './useErBehandlingMedVedtaksbrevbygger';
import { Vedtaksmeny } from './Vedtaksmeny/Vedtaksmeny';
import { Vedtaksperioder } from './Vedtaksperioder/Vedtaksperioder';

export function Vedtak() {
    const behandling = useBehandling();

    const { sammensattKontrollsak } = useSammensattKontrollsakContext();
    const { erFeilutbetaltValutaTabellSynlig } = useFeilutbetaltValutaTabellContext();
    const { erRefusjonEøsTabellSynlig } = useRefusjonEøsTabellContext();

    const opprettSammensattKontrollsakError = useOpprettSammensattKontrollsakError(behandling.behandlingId);
    const slettSammensattKontrollsakError = useSlettSammensattKontrollsakError(behandling.behandlingId);

    const erBehandlingMedVedtaksbrev = useErBehandlingMedVedtaksbrev();
    const erBehandlingMedVedtaksbrevbygger = useErBehandlingMedVedtaksbrevbygger();

    if (!erBehandlingMedVedtaksbrev) {
        return (
            <Layout>
                <BehandlingUtenVedtaksbrevAdvarsel />
            </Layout>
        );
    }

    return (
        <Layout>
            <VStack gap={'space-24'}>
                <Vedtaksmeny />
                <VStack gap={'space-12'}>
                    {slettSammensattKontrollsakError && (
                        <LocalAlert status={'error'}>
                            <LocalAlert.Header>
                                <LocalAlert.Title>{slettSammensattKontrollsakError.message}</LocalAlert.Title>
                            </LocalAlert.Header>
                        </LocalAlert>
                    )}
                    {opprettSammensattKontrollsakError && (
                        <LocalAlert status={'error'}>
                            <LocalAlert.Header>
                                <LocalAlert.Title>{opprettSammensattKontrollsakError.message}</LocalAlert.Title>
                            </LocalAlert.Header>
                        </LocalAlert>
                    )}
                    {behandling.korrigertEtterbetaling && <KorrigertEtterbetalingAdvarsel />}
                    {behandling.korrigertVedtak && <KorrigertVedtakAdvarsel />}
                    <BrevmottakereBehandlingAdvarsel kilde={'vedtak'} />
                    {!erBehandlingMedVedtaksbrevbygger && <IngenVedtaksbrevbyggerAdvarsel />}
                    {erBehandlingMedVedtaksbrevbygger && (
                        <Box marginBlock={'space-12 space-40'}>
                            {sammensattKontrollsak && <SammensattKontrollsak />}
                            {!sammensattKontrollsak && (
                                <VStack gap={'space-40'}>
                                    <Vedtaksperioder />
                                    {erFeilutbetaltValutaTabellSynlig && <FeilutbetaltValutaTabell />}
                                    {erRefusjonEøsTabellSynlig && <RefusjonEøsTabell />}
                                </VStack>
                            )}
                        </Box>
                    )}
                    <ForhåndsvisVedtaksbrev />
                </VStack>
            </VStack>
        </Layout>
    );
}

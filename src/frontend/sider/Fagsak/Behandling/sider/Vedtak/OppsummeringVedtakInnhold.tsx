import { useBehandling } from '@hooks/useBehandling';
import { useOpprettSammensattKontrollsakError } from '@hooks/useOpprettSammensattKontrollsakError';
import { useSlettSammensattKontrollsakError } from '@hooks/useSlettSammensattKontrollsakError';
import { BrevmottakereBehandlingAdvarsel } from '@komponenter/Brevmottaker/BrevmottakereBehandlingAdvarsel';
import { ForhåndsvisVedtaksbrev } from '@sider/Fagsak/Behandling/sider/Vedtak/ForhåndsvisVedtaksbrev';
import { IngenVedtaksbrevbyggerAdvarsel } from '@sider/Fagsak/Behandling/sider/Vedtak/IngenVedtaksbrevbyggerAdvarsel';
import { KorrigertEtterbetalingAdvarsel } from '@sider/Fagsak/Behandling/sider/Vedtak/KorrigerEtterbetaling/KorrigertEtterbetalingAdvarsel';
import { KorrigertVedtakAdvarsel } from '@sider/Fagsak/Behandling/sider/Vedtak/KorrigerVedtak/KorrigertVedtakAdvarsel';
import { BehandlingStatus, BehandlingÅrsak } from '@typer/behandling';

import { Box, LocalAlert, VStack } from '@navikt/ds-react';

import { FeilutbetaltValutaTabell } from './FeilutbetaltValuta/FeilutbetaltValutaTabell';
import { useFeilutbetaltValutaTabellContext } from './FeilutbetaltValuta/FeilutbetaltValutaTabellContext';
import { RefusjonEøsTabell } from './RefusjonEøs/RefusjonEøsTabell';
import { useRefusjonEøsTabellContext } from './RefusjonEøs/RefusjonEøsTabellContext';
import { SammensattKontrollsak } from './SammensattKontrollsak/SammensattKontrollsak';
import { useSammensattKontrollsakContext } from './SammensattKontrollsak/SammensattKontrollsakContext';
import { Vedtaksmeny } from './Vedtaksmeny/Vedtaksmeny';
import { Vedtaksperioder } from './Vedtaksperioder/Vedtaksperioder';

export function OppsummeringVedtakInnhold() {
    const behandling = useBehandling();

    const { sammensattKontrollsak } = useSammensattKontrollsakContext();
    const { erFeilutbetaltValutaTabellSynlig } = useFeilutbetaltValutaTabellContext();
    const { erRefusjonEøsTabellSynlig } = useRefusjonEøsTabellContext();

    const opprettSammensattKontrollsakError = useOpprettSammensattKontrollsakError(behandling.behandlingId);
    const slettSammensattKontrollsakError = useSlettSammensattKontrollsakError(behandling.behandlingId);

    const erBehandlingMedVedtaksbrevbygger =
        behandling.årsak !== BehandlingÅrsak.DØDSFALL && behandling.status !== BehandlingStatus.AVSLUTTET;

    return (
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
    );
}

import { useBehandling } from '@hooks/useBehandling';
import { useBruker } from '@hooks/useBruker';
import { useErLesevisning } from '@hooks/useErLesevisning';
import { useOpprettSammensattKontrollsakError } from '@hooks/useOpprettSammensattKontrollsakError';
import { useSlettSammensattKontrollsakError } from '@hooks/useSlettSammensattKontrollsakError';
import { BrevmottakereAlert } from '@komponenter/BrevmottakereAlert';
import { ForhåndsvisVedtaksbrev } from '@sider/Fagsak/Behandling/sider/Vedtak/ForhåndsvisVedtaksbrev';
import { BehandlingStatus, Behandlingstype, BehandlingÅrsak } from '@typer/behandling';

import { InformationSquareIcon } from '@navikt/aksel-icons';
import { Box, InfoCard, LocalAlert, VStack } from '@navikt/ds-react';

import { FeilutbetaltValutaTabell } from './FeilutbetaltValuta/FeilutbetaltValutaTabell';
import { useFeilutbetaltValutaTabellContext } from './FeilutbetaltValuta/FeilutbetaltValutaTabellContext';
import { RefusjonEøsTabell } from './RefusjonEøs/RefusjonEøsTabell';
import { useRefusjonEøsTabellContext } from './RefusjonEøs/RefusjonEøsTabellContext';
import { SammensattKontrollsak } from './SammensattKontrollsak/SammensattKontrollsak';
import { useSammensattKontrollsakContext } from './SammensattKontrollsak/SammensattKontrollsakContext';
import { Vedtaksmeny } from './Vedtaksmeny/Vedtaksmeny';
import { Vedtaksperioder } from './Vedtaksperioder/Vedtaksperioder';

export function OppsummeringVedtakInnhold() {
    const erLesevisning = useErLesevisning();
    const bruker = useBruker();
    const behandling = useBehandling();

    const { sammensattKontrollsak } = useSammensattKontrollsakContext();
    const { erFeilutbetaltValutaTabellSynlig } = useFeilutbetaltValutaTabellContext();
    const { erRefusjonEøsTabellSynlig } = useRefusjonEøsTabellContext();

    const opprettSammensattKontrollsakError = useOpprettSammensattKontrollsakError(behandling.behandlingId);
    const slettSammensattKontrollsakError = useSlettSammensattKontrollsakError(behandling.behandlingId);

    const erBehandlingMedVedtaksbrevutsending =
        behandling.type !== Behandlingstype.TEKNISK_ENDRING && behandling.årsak !== BehandlingÅrsak.SATSENDRING;

    const hentInfostripeTekst = (årsak: BehandlingÅrsak, status: BehandlingStatus): string => {
        if (status === BehandlingStatus.AVSLUTTET) {
            return 'Behandlingen er avsluttet. Du kan se vedtaksbrevet ved å trykke på "Vis vedtaksbrev".';
        } else if (årsak === BehandlingÅrsak.DØDSFALL) {
            return 'Vedtak om opphør på grunn av dødsfall er automatisk generert.';
        } else return '';
    };

    if (!erBehandlingMedVedtaksbrevutsending) {
        return (
            <InfoCard data-color="info">
                <InfoCard.Message icon={<InformationSquareIcon aria-hidden />}>
                    Du er inne på en teknisk behandling og det finnes ingen vedtaksbrev.
                </InfoCard.Message>
            </InfoCard>
        );
    }

    if (behandling.årsak === BehandlingÅrsak.IVERKSETTE_KA_VEDTAK) {
        return (
            <InfoCard data-color="info">
                <InfoCard.Header icon={<InformationSquareIcon aria-hidden />}>
                    <InfoCard.Title>Du er i en iverksette KA-vedtak behandling.</InfoCard.Title>
                </InfoCard.Header>
                <InfoCard.Content>
                    Det skal ikke sendes vedtaksbrev. Bruk "Send brev" hvis du skal informere bruker om:
                    <ul>
                        <li>Utbetaling</li>
                        <li>EØS-kompetanse</li>
                    </ul>
                </InfoCard.Content>
            </InfoCard>
        );
    }

    return (
        <>
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
                <Vedtaksmeny erBehandlingMedVedtaksbrevutsending={erBehandlingMedVedtaksbrevutsending} />
            </VStack>
            <div>
                {behandling.korrigertEtterbetaling && (
                    <Box marginBlock={'space-0 space-24'}>
                        <InfoCard data-color="info">
                            <InfoCard.Message icon={<InformationSquareIcon aria-hidden />}>
                                Etterbetalingsbeløp i brevet er manuelt korrigert
                            </InfoCard.Message>
                        </InfoCard>
                    </Box>
                )}
                {behandling.korrigertVedtak && (
                    <Box marginBlock={'space-0 space-24'}>
                        <InfoCard data-color="info">
                            <InfoCard.Message icon={<InformationSquareIcon aria-hidden />}>
                                Vedtaket er korrigert etter § 35
                            </InfoCard.Message>
                        </InfoCard>
                    </Box>
                )}
                <BrevmottakereAlert
                    bruker={bruker}
                    erPåBehandling={true}
                    erLesevisning={erLesevisning}
                    åpenBehandling={behandling}
                    brevmottakere={behandling.brevmottakere}
                />
                {behandling.årsak === BehandlingÅrsak.DØDSFALL || behandling.status === BehandlingStatus.AVSLUTTET ? (
                    <Box marginBlock={'space-32 space-16'}>
                        <InfoCard data-color="info">
                            <InfoCard.Message icon={<InformationSquareIcon aria-hidden />}>
                                {hentInfostripeTekst(behandling.årsak, behandling.status)}
                            </InfoCard.Message>
                        </InfoCard>
                    </Box>
                ) : (
                    <>
                        {sammensattKontrollsak ? (
                            <SammensattKontrollsak />
                        ) : (
                            <>
                                <Vedtaksperioder />
                                {erFeilutbetaltValutaTabellSynlig && <FeilutbetaltValutaTabell />}
                                {erRefusjonEøsTabellSynlig && <RefusjonEøsTabell />}
                            </>
                        )}
                    </>
                )}
                <ForhåndsvisVedtaksbrev />
            </div>
        </>
    );
}

import { useBehandling } from '@hooks/useBehandling';
import { useBruker } from '@hooks/useBruker';
import { useErLesevisning } from '@hooks/useErLesevisning';
import { useOpprettSammensattKontrollsakError } from '@hooks/useOpprettSammensattKontrollsakError';
import { useSaksbehandler } from '@hooks/useSaksbehandler';
import { useSlettSammensattKontrollsakError } from '@hooks/useSlettSammensattKontrollsakError';
import { BrevmottakereAlert } from '@komponenter/BrevmottakereAlert';
import {
    BehandlerRolle,
    BehandlingStatus,
    BehandlingSteg,
    Behandlingstype,
    BehandlingÅrsak,
    hentStegNummer,
} from '@typer/behandling';

import { FileTextIcon, InformationSquareIcon } from '@navikt/aksel-icons';
import { Box, Button, InfoCard, LocalAlert, VStack } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer';

import { FeilutbetaltValutaTabell } from './FeilutbetaltValuta/FeilutbetaltValutaTabell';
import { useFeilutbetaltValutaTabellContext } from './FeilutbetaltValuta/FeilutbetaltValutaTabellContext';
import { RefusjonEøsTabell } from './RefusjonEøs/RefusjonEøsTabell';
import { useRefusjonEøsTabellContext } from './RefusjonEøs/RefusjonEøsTabellContext';
import { SammensattKontrollsak } from './SammensattKontrollsak/SammensattKontrollsak';
import { useSammensattKontrollsakContext } from './SammensattKontrollsak/SammensattKontrollsakContext';
import { Vedtaksmeny } from './Vedtaksmeny/Vedtaksmeny';
import { Vedtaksperioder } from './Vedtaksperioder/Vedtaksperioder';
import useDokument from '../../../../../hooks/useDokument';
import PdfVisningModal from '../../../../../komponenter/PdfVisningModal/PdfVisningModal';

export function OppsummeringVedtakInnhold() {
    const saksbehandler = useSaksbehandler();
    const erLesevisning = useErLesevisning();
    const bruker = useBruker();
    const behandling = useBehandling();

    const { hentForhåndsvisning, nullstillDokument, visDokumentModal, hentetDokument, settVisDokumentModal } =
        useDokument();

    const { sammensattKontrollsak } = useSammensattKontrollsakContext();
    const { erFeilutbetaltValutaTabellSynlig } = useFeilutbetaltValutaTabellContext();
    const { erRefusjonEøsTabellSynlig } = useRefusjonEøsTabellContext();

    const opprettSammensattKontrollsakError = useOpprettSammensattKontrollsakError(behandling.behandlingId);
    const slettSammensattKontrollsakError = useSlettSammensattKontrollsakError(behandling.behandlingId);

    const erBehandlingMedVedtaksbrevutsending =
        behandling.type !== Behandlingstype.TEKNISK_ENDRING && behandling.årsak !== BehandlingÅrsak.SATSENDRING;

    const hentVedtaksbrev = () => {
        const skalOgsåLagreBrevPåVedtak =
            saksbehandler.rolle > BehandlerRolle.VEILEDER &&
            hentStegNummer(behandling.steg) <= hentStegNummer(BehandlingSteg.BESLUTTE_VEDTAK);

        if (skalOgsåLagreBrevPåVedtak) {
            hentForhåndsvisning({
                method: 'POST',
                url: `/familie-ks-sak/api/brev/forhaandsvis-og-lagre-vedtaksbrev/${behandling.behandlingId}`,
            });
        } else {
            hentForhåndsvisning({
                method: 'GET',
                url: `/familie-ks-sak/api/brev/forhaandsvis-vedtaksbrev/${behandling.behandlingId}`,
            });
        }
    };

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
            {visDokumentModal && (
                <PdfVisningModal
                    onRequestClose={() => {
                        settVisDokumentModal(false);
                        nullstillDokument();
                    }}
                    pdfdata={hentetDokument}
                />
            )}
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
                <Button
                    id={'forhandsvis-vedtaksbrev'}
                    variant={'secondary'}
                    size={'medium'}
                    onClick={() => {
                        settVisDokumentModal(true);
                        hentVedtaksbrev();
                    }}
                    loading={hentetDokument.status === RessursStatus.HENTER}
                    icon={<FileTextIcon aria-hidden />}
                >
                    Vis vedtaksbrev
                </Button>
            </div>
        </>
    );
}

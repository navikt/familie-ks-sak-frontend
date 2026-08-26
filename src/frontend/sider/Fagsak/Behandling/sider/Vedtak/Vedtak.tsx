import { useState } from 'react';

import { useErLesevisning } from '@hooks/useErLesevisning';
import { useFagsakId } from '@hooks/useFagsakId';
import { HentVedtaksperioderQueryKeyFactory } from '@hooks/useHentVedtaksperioder';
import { useSaksbehandler } from '@hooks/useSaksbehandler';
import { useSendVedtakTilBeslutter } from '@hooks/useSendVedtakTilBeslutter';
import { Steg } from '@sider/Fagsak/Behandling/sider/Steg';
import { SendtTilTotrinnskontrollModal } from '@sider/Fagsak/Behandling/sider/Vedtak/SendtTilTotrinnskontrollModal';
import { useQueryClient } from '@tanstack/react-query';
import { BehandlingStatus, BehandlingÅrsak, type IBehandling } from '@typer/behandling';
import type { IVedtaksperiodeMedBegrunnelser } from '@typer/vedtaksperiode';
import { erDefinert } from '@utils/commons';
import { useNavigate } from 'react-router';

import { Button, ErrorMessage, HStack, VStack } from '@navikt/ds-react';
import { byggSuksessRessurs } from '@navikt/familie-typer';

import { useFeilutbetaltValutaTabellContext } from './FeilutbetaltValuta/FeilutbetaltValutaTabellContext';
import { OppsummeringVedtakInnhold } from './OppsummeringVedtakInnhold';
import { useRefusjonEøsTabellContext } from './RefusjonEøs/RefusjonEøsTabellContext';
import { useSammensattKontrollsakContext } from './SammensattKontrollsak/SammensattKontrollsakContext';
import { useVedtaksperioderContext } from './Vedtaksperioder/VedtaksperioderContext';
import { useBehandlingContext } from '../../context/BehandlingContext';

function kanForeslåVedtak(behandling: IBehandling, vedtaksperioder: IVedtaksperiodeMedBegrunnelser[]) {
    const minstEnPeriodeHarBegrunnelseEllerFritekst = vedtaksperioder.some(
        vedtaksperioderMedBegrunnelse =>
            vedtaksperioderMedBegrunnelse.begrunnelser.length !== 0 ||
            vedtaksperioderMedBegrunnelse.eøsBegrunnelser.length !== 0 ||
            vedtaksperioderMedBegrunnelse.fritekster.length !== 0
    );
    return (
        minstEnPeriodeHarBegrunnelseEllerFritekst ||
        behandling?.årsak === BehandlingÅrsak.TEKNISK_ENDRING ||
        behandling?.årsak === BehandlingÅrsak.IVERKSETTE_KA_VEDTAK ||
        behandling?.årsak === BehandlingÅrsak.DØDSFALL
    );
}

export function Vedtak() {
    const { behandling, settÅpenBehandling } = useBehandlingContext();
    const { erLeggTilFeilutbetaltValutaFormÅpen } = useFeilutbetaltValutaTabellContext();
    const { erLeggTilRefusjonEøsFormÅpen } = useRefusjonEøsTabellContext();
    const { sammensattKontrollsak } = useSammensattKontrollsakContext();
    const { vedtaksperioder } = useVedtaksperioderContext();

    const saksbehandler = useSaksbehandler();
    const fagsakId = useFagsakId();
    const erLesevisning = useErLesevisning();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [visSendtTilTotrinnskontrollModal, settVisSendtTilTotrinnskontrollModal] = useState<boolean>(false);
    const [tilGodkjenningFeilmelding, settTilGodkjenningFeilmelding] = useState<string | undefined>(undefined);

    const {
        mutate: sendVedtakTilBeslutter,
        isPending: sendVedtakTilBeslutterIsPending,
        error: sendVedtakTilBeslutterError,
    } = useSendVedtakTilBeslutter({
        onSuccess: async behandling => {
            await queryClient.invalidateQueries({
                queryKey: HentVedtaksperioderQueryKeyFactory.behandling(behandling.behandlingId),
            });
            settÅpenBehandling(byggSuksessRessurs(behandling));
            settVisSendtTilTotrinnskontrollModal(true);
        },
    });

    const visTilGodkjenningKnapp = !erLesevisning && behandling.status === BehandlingStatus.UTREDES;
    const feilmelding = tilGodkjenningFeilmelding || sendVedtakTilBeslutterError?.message;

    function onTilGodkjenningClicked() {
        if (erDefinert(sammensattKontrollsak) && sammensattKontrollsak.fritekst.trim() === '') {
            settTilGodkjenningFeilmelding('Sammensatt kontrollsak mangler en begrunnelse.');
        } else if (erLeggTilFeilutbetaltValutaFormÅpen) {
            settTilGodkjenningFeilmelding(
                'Det er lagt til en ny periode med feilutbetalt valuta. Fyll ut periode og beløp, eller fjern perioden.'
            );
        } else if (erLeggTilRefusjonEøsFormÅpen) {
            settTilGodkjenningFeilmelding(
                'Det er lagt til en ny periode med refusjon EØS. Fyll ut periode og refusjonsbeløp, eller fjern perioden.'
            );
        } else if (!kanForeslåVedtak(behandling, vedtaksperioder) && !erDefinert(sammensattKontrollsak)) {
            settTilGodkjenningFeilmelding('Vedtaksbrevet mangler begrunnelse. Du må legge til minst én begrunnelse.');
        } else {
            settTilGodkjenningFeilmelding(undefined);
            sendVedtakTilBeslutter({ behandlingId: behandling.behandlingId, behandlendeEnhet: saksbehandler.enhet });
        }
    }

    function onForrigeStegClicked() {
        navigate(`/fagsak/${fagsakId}/${behandling.behandlingId}/simulering`);
    }

    return (
        <Steg tittel={'Vedtak'} maxWidth={'60rem'}>
            {visSendtTilTotrinnskontrollModal && (
                <SendtTilTotrinnskontrollModal lukkModal={() => settVisSendtTilTotrinnskontrollModal(false)} />
            )}
            <VStack gap={'space-40'}>
                <OppsummeringVedtakInnhold />
                {feilmelding && <ErrorMessage>{feilmelding}</ErrorMessage>}
                <HStack gap={'space-12'}>
                    <Button variant={'tertiary'} onClick={onForrigeStegClicked}>
                        Forrige steg
                    </Button>
                    {visTilGodkjenningKnapp && (
                        <Button
                            variant={'primary'}
                            onClick={onTilGodkjenningClicked}
                            loading={sendVedtakTilBeslutterIsPending}
                        >
                            Til godkjenning
                        </Button>
                    )}
                </HStack>
            </VStack>
        </Steg>
    );
}

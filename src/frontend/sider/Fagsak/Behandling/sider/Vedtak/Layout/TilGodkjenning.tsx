import { HentVedtaksperioderQueryKeyFactory } from '@hooks/useHentVedtaksperioder';
import { useSaksbehandler } from '@hooks/useSaksbehandler';
import { useSendVedtakTilBeslutter } from '@hooks/useSendVedtakTilBeslutter';
import { useBehandlingContext } from '@sider/Fagsak/Behandling/context/BehandlingContext';
import { useFeilutbetaltValutaTabellContext } from '@sider/Fagsak/Behandling/sider/Vedtak/FeilutbetaltValuta/FeilutbetaltValutaTabellContext';
import { useRefusjonEøsTabellContext } from '@sider/Fagsak/Behandling/sider/Vedtak/RefusjonEøs/RefusjonEøsTabellContext';
import { useSammensattKontrollsakContext } from '@sider/Fagsak/Behandling/sider/Vedtak/SammensattKontrollsak/SammensattKontrollsakContext';
import { useSendtTilTotrinnskontrollModalContext } from '@sider/Fagsak/Behandling/sider/Vedtak/Totrinnskontroll/SendtTilTotrinnskontrollModalContext';
import { useVedtaksperioderContext } from '@sider/Fagsak/Behandling/sider/Vedtak/Vedtaksperioder/VedtaksperioderContext';
import { useQueryClient } from '@tanstack/react-query';
import { BehandlingÅrsak, type IBehandling } from '@typer/behandling';
import type { IVedtaksperiodeMedBegrunnelser } from '@typer/vedtaksperiode';
import { erDefinert } from '@utils/commons';

import { Button } from '@navikt/ds-react';
import { byggSuksessRessurs } from '@navikt/familie-typer';

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

interface Props {
    settFeilmelding: (feilmelding: string | undefined) => void;
}

export function TilGodkjenning({ settFeilmelding }: Props) {
    const { behandling, settÅpenBehandling } = useBehandlingContext();
    const { åpneModal: åpneVisSendtTilTotrinnskontrollModal } = useSendtTilTotrinnskontrollModalContext();
    const { erLeggTilFeilutbetaltValutaFormÅpen } = useFeilutbetaltValutaTabellContext();
    const { erLeggTilRefusjonEøsFormÅpen } = useRefusjonEøsTabellContext();
    const { sammensattKontrollsak } = useSammensattKontrollsakContext();
    const { vedtaksperioder } = useVedtaksperioderContext();

    const saksbehandler = useSaksbehandler();
    const queryClient = useQueryClient();

    const { mutate: sendVedtakTilBeslutter, isPending: sendVedtakTilBeslutterIsPending } = useSendVedtakTilBeslutter({
        onSuccess: async behandling => {
            await queryClient.invalidateQueries({
                queryKey: HentVedtaksperioderQueryKeyFactory.behandling(behandling.behandlingId),
            });
            settÅpenBehandling(byggSuksessRessurs(behandling));
            åpneVisSendtTilTotrinnskontrollModal();
        },
        onError: error => settFeilmelding(error.message),
    });

    function onTilGodkjenningClicked() {
        if (erDefinert(sammensattKontrollsak) && sammensattKontrollsak.fritekst.trim() === '') {
            settFeilmelding('Sammensatt kontrollsak mangler en begrunnelse.');
        } else if (erLeggTilFeilutbetaltValutaFormÅpen) {
            settFeilmelding(
                'Det er lagt til en ny periode med feilutbetalt valuta. Fyll ut periode og beløp, eller fjern perioden.'
            );
        } else if (erLeggTilRefusjonEøsFormÅpen) {
            settFeilmelding(
                'Det er lagt til en ny periode med refusjon EØS. Fyll ut periode og refusjonsbeløp, eller fjern perioden.'
            );
        } else if (!kanForeslåVedtak(behandling, vedtaksperioder) && !erDefinert(sammensattKontrollsak)) {
            settFeilmelding('Vedtaksbrevet mangler begrunnelse. Du må legge til minst én begrunnelse.');
        } else {
            settFeilmelding(undefined);
            sendVedtakTilBeslutter({ behandlingId: behandling.behandlingId, behandlendeEnhet: saksbehandler.enhet });
        }
    }

    return (
        <Button variant={'primary'} onClick={onTilGodkjenningClicked} loading={sendVedtakTilBeslutterIsPending}>
            Til godkjenning
        </Button>
    );
}

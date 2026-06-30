import { useState } from 'react';

import { useErLesevisning } from '@hooks/useErLesevisning';
import { useFagsakId } from '@hooks/useFagsakId';
import { HentVedtaksperioderQueryKeyFactory } from '@hooks/useHentVedtaksperioder';
import { useSaksbehandler } from '@hooks/useSaksbehandler';
import { useSendVedtakTilBeslutter } from '@hooks/useSendVedtakTilBeslutter';
import { SendtTilTotrinnskontrollModal } from '@sider/Fagsak/Behandling/sider/Vedtak/SendtTilTotrinnskontrollModal';
import { useQueryClient } from '@tanstack/react-query';
import { BehandlingStatus, BehandlingSteg, BehandlingÅrsak, type IBehandling } from '@typer/behandling';
import type { IVedtaksperiodeMedBegrunnelser } from '@typer/vedtaksperiode';
import { erDefinert } from '@utils/commons';
import { useNavigate } from 'react-router';

import { byggSuksessRessurs } from '@navikt/familie-typer';

import { useFeilutbetaltValutaTabellContext } from './FeilutbetaltValuta/FeilutbetaltValutaTabellContext';
import { OppsummeringVedtakInnhold } from './OppsummeringVedtakInnhold';
import { useRefusjonEøsTabellContext } from './RefusjonEøs/RefusjonEøsTabellContext';
import { useSammensattKontrollsakContext } from './SammensattKontrollsak/SammensattKontrollsakContext';
import { useVedtaksperioderContext } from './Vedtaksperioder/VedtaksperioderContext';
import Skjemasteg from '../../../../../komponenter/Skjemasteg/Skjemasteg';
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
    const [feilmelding, settFeilmelding] = useState<string | undefined>(undefined);

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

    const visSubmitKnapp = !erLesevisning && behandling.status === BehandlingStatus.UTREDES;

    function sendTilBeslutter() {
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
        <Skjemasteg
            tittel="Vedtak"
            forrigeOnClick={() => navigate(`/fagsak/${fagsakId}/${behandling.behandlingId}/simulering`)}
            nesteOnClick={visSubmitKnapp ? sendTilBeslutter : undefined}
            nesteKnappTittel={'Til godkjenning'}
            senderInn={sendVedtakTilBeslutterIsPending}
            maxWidthStyle="54rem"
            className={'vedtak'}
            feilmelding={feilmelding ?? sendVedtakTilBeslutterError?.message}
            steg={BehandlingSteg.BESLUTTE_VEDTAK}
        >
            {visSendtTilTotrinnskontrollModal && (
                <SendtTilTotrinnskontrollModal lukkModal={() => settVisSendtTilTotrinnskontrollModal(false)} />
            )}
            <OppsummeringVedtakInnhold />
        </Skjemasteg>
    );
}

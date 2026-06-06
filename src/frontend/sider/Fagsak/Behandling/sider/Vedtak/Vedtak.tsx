import { useState } from 'react';

import { useBruker } from '@hooks/useBruker';
import { useErLesevisning } from '@hooks/useErLesevisning';
import { useFagsakId } from '@hooks/useFagsakId';
import { useSaksbehandler } from '@hooks/useSaksbehandler';
import { useSendVedtakTilBeslutter } from '@hooks/useSendVedtakTilBeslutter';
import {
    BehandlingStatus,
    BehandlingSteg,
    Behandlingstype,
    BehandlingÅrsak,
    type IBehandling,
} from '@typer/behandling';
import type { IVedtaksperiodeMedBegrunnelser } from '@typer/vedtaksperiode';
import { useNavigate } from 'react-router';

import { byggSuksessRessurs } from '@navikt/familie-typer';

import { useFeilutbetaltValutaTabellContext } from './FeilutbetaltValuta/FeilutbetaltValutaTabellContext';
import OppsummeringVedtakInnhold from './OppsummeringVedtakInnhold';
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
        behandling?.årsak === BehandlingÅrsak.KORREKSJON_VEDTAKSBREV ||
        behandling?.årsak === BehandlingÅrsak.IVERKSETTE_KA_VEDTAK ||
        behandling?.årsak === BehandlingÅrsak.DØDSFALL
    );
}

export function Vedtak() {
    const { behandling, settÅpenBehandling } = useBehandlingContext();
    const { erLeggTilFeilutbetaltValutaFormÅpen } = useFeilutbetaltValutaTabellContext();
    const { erLeggTilRefusjonEøsFormÅpen } = useRefusjonEøsTabellContext();
    const { erSammensattKontrollsak } = useSammensattKontrollsakContext();
    const { vedtaksperioder } = useVedtaksperioderContext();

    const saksbehandler = useSaksbehandler();
    const fagsakId = useFagsakId();
    const bruker = useBruker();
    const erLesevisning = useErLesevisning();
    const navigate = useNavigate();

    const [visModal, settVisModal] = useState<boolean>(false);
    const [feilmelding, settFeilmelding] = useState<string | undefined>(undefined);

    const {
        mutate: sendVedtakTilBeslutter,
        isPending: sendVedtakTilBeslutterIsPending,
        error: sendVedtakTilBeslutterError,
    } = useSendVedtakTilBeslutter({
        onSuccess: behandling => {
            settÅpenBehandling(byggSuksessRessurs(behandling));
            settVisModal(true);
        },
    });

    const visSubmitKnapp = !erLesevisning && behandling.status === BehandlingStatus.UTREDES;
    const erBehandlingMedVedtaksbrevutsending =
        behandling.type !== Behandlingstype.TEKNISK_ENDRING && behandling.årsak !== BehandlingÅrsak.SATSENDRING;

    function sendTilBeslutter() {
        if (erLeggTilFeilutbetaltValutaFormÅpen) {
            settFeilmelding(
                'Det er lagt til en ny periode med feilutbetalt valuta. Fyll ut periode og beløp, eller fjern perioden.'
            );
        } else if (erLeggTilRefusjonEøsFormÅpen) {
            settFeilmelding(
                'Det er lagt til en ny periode med refusjon EØS. Fyll ut periode og refusjonsbeløp, eller fjern perioden.'
            );
        } else if (!kanForeslåVedtak(behandling, vedtaksperioder) && !erSammensattKontrollsak) {
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
            <OppsummeringVedtakInnhold
                åpenBehandling={behandling}
                erBehandlingMedVedtaksbrevutsending={erBehandlingMedVedtaksbrevutsending}
                visModal={visModal}
                settVisModal={settVisModal}
                bruker={bruker}
            />
        </Skjemasteg>
    );
}

import { useState } from 'react';

import { useNavigate } from 'react-router';
import styled from 'styled-components';

import { byggSuksessRessurs } from '@navikt/familie-typer';

import { useFeilutbetaltValutaTabellContext } from './FeilutbetaltValuta/FeilutbetaltValutaTabellContext';
import OppsummeringVedtakInnhold from './OppsummeringVedtakInnhold';
import { useRefusjonEøsTabellContext } from './RefusjonEøs/RefusjonEøsTabellContext';
import { useSammensattKontrollsakContext } from './SammensattKontrollsak/SammensattKontrollsakContext';
import { useFagsakId } from '../../../../../hooks/useFagsakId';
import { useSendVedtakTilBeslutter } from '../../../../../hooks/useSendVedtakTilBeslutter';
import Skjemasteg from '../../../../../komponenter/Skjemasteg/Skjemasteg';
import {
    BehandlingStatus,
    BehandlingSteg,
    Behandlingstype,
    BehandlingÅrsak,
    type IBehandling,
} from '../../../../../typer/behandling';
import type { IVedtaksperiodeMedBegrunnelser } from '../../../../../typer/vedtaksperiode';
import { useBrukerContext } from '../../../BrukerContext';
import { useBehandlingContext } from '../../context/BehandlingContext';

function minstEnPeriodeharBegrunnelseEllerFritekst(vedtaksperioderMedBegrunnelser: IVedtaksperiodeMedBegrunnelser[]) {
    return vedtaksperioderMedBegrunnelser.some(
        vedtaksperioderMedBegrunnelse =>
            vedtaksperioderMedBegrunnelse.begrunnelser.length !== 0 ||
            vedtaksperioderMedBegrunnelse.eøsBegrunnelser.length !== 0 ||
            vedtaksperioderMedBegrunnelse.fritekster.length !== 0
    );
}

function kanForeslåVedtak(behandling: IBehandling) {
    return (
        minstEnPeriodeharBegrunnelseEllerFritekst(behandling.vedtak?.vedtaksperioderMedBegrunnelser ?? []) ||
        behandling?.årsak === BehandlingÅrsak.TEKNISK_ENDRING ||
        behandling?.årsak === BehandlingÅrsak.KORREKSJON_VEDTAKSBREV ||
        behandling?.årsak === BehandlingÅrsak.IVERKSETTE_KA_VEDTAK ||
        behandling?.årsak === BehandlingÅrsak.DØDSFALL
    );
}

const StyledSkjemaSteg = styled(Skjemasteg)`
    .typo-innholdstittel {
        margin-bottom: 1.4rem;
    }
`;

export function Vedtak() {
    const { bruker } = useBrukerContext();
    const { behandling, settÅpenBehandling, vurderErLesevisning } = useBehandlingContext();
    const { erLeggTilFeilutbetaltValutaFormÅpen } = useFeilutbetaltValutaTabellContext();
    const { erLeggTilRefusjonEøsFormÅpen } = useRefusjonEøsTabellContext();
    const { erSammensattKontrollsak } = useSammensattKontrollsakContext();

    const fagsakId = useFagsakId();
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

    const visSubmitKnapp = !vurderErLesevisning() && behandling.status === BehandlingStatus.UTREDES;
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
        } else if (!kanForeslåVedtak(behandling) && !erSammensattKontrollsak) {
            settFeilmelding('Vedtaksbrevet mangler begrunnelse. Du må legge til minst én begrunnelse.');
        } else {
            settFeilmelding(undefined);
            sendVedtakTilBeslutter({ behandlingId: behandling.behandlingId, behandlendeEnhet: '9999' });
        }
    }

    return (
        <StyledSkjemaSteg
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
        </StyledSkjemaSteg>
    );
}

export default Vedtak;

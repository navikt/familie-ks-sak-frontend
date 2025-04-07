import * as React from 'react';

import { useNavigate } from 'react-router';
import styled from 'styled-components';

import { RessursStatus } from '@navikt/familie-typer';

import OppsummeringVedtakInnhold from './OppsummeringVedtakInnhold';
import { useSammensattKontrollsakContext } from './SammensattKontrollsak/useSammensattKontrollsakContext';
import { useBehandling } from '../../../context/behandlingContext/BehandlingContext';
import Skjemasteg from '../../../Felleskomponenter/Skjemasteg/Skjemasteg';
import useSakOgBehandlingParams from '../../../hooks/useSakOgBehandlingParams';
import type { IBehandling } from '../../../typer/behandling';
import {
    BehandlingStatus,
    BehandlingSteg,
    Behandlingstype,
    BehandlingÅrsak,
} from '../../../typer/behandling';
import type { IPersonInfo } from '../../../typer/person';
import { hentFrontendFeilmelding } from '../../../utils/ressursUtils';

interface IVedtakProps {
    åpenBehandling: IBehandling;
    bruker: IPersonInfo;
}

const StyledSkjemaSteg = styled(Skjemasteg)`
    .typo-innholdstittel {
        margin-bottom: 1.4rem;
    }
`;

const OppsummeringVedtak: React.FunctionComponent<IVedtakProps> = ({ åpenBehandling, bruker }) => {
    const { fagsakId } = useSakOgBehandlingParams();
    const { vurderErLesevisning, foreslåVedtakNesteOnClick, behandlingsstegSubmitressurs } =
        useBehandling();
    const { erSammensattKontrollsak } = useSammensattKontrollsakContext();

    const navigate = useNavigate();

    const [visModal, settVisModal] = React.useState<boolean>(false);

    const visSubmitKnapp =
        !vurderErLesevisning() && åpenBehandling?.status === BehandlingStatus.UTREDES;

    const [erUlagretNyFeilutbetaltValutaPeriode, settErUlagretNyFeilutbetaltValutaPeriode] =
        React.useState(false);

    const [erUlagretNyRefusjonEøsPeriode, settErUlagretNyRefusjonEøsPeriode] =
        React.useState(false);

    const foreslåVedtak = () => {
        foreslåVedtakNesteOnClick(
            (visModal: boolean) => settVisModal(visModal),
            erUlagretNyFeilutbetaltValutaPeriode,
            erUlagretNyRefusjonEøsPeriode,
            erSammensattKontrollsak
        );
    };

    const erBehandlingMedVedtaksbrevutsending =
        åpenBehandling.type !== Behandlingstype.TEKNISK_ENDRING &&
        åpenBehandling.årsak !== BehandlingÅrsak.SATSENDRING;

    return (
        <StyledSkjemaSteg
            tittel="Vedtak"
            forrigeOnClick={() =>
                navigate(`/fagsak/${fagsakId}/${åpenBehandling?.behandlingId}/simulering`)
            }
            nesteOnClick={visSubmitKnapp ? foreslåVedtak : undefined}
            nesteKnappTittel={'Til godkjenning'}
            senderInn={behandlingsstegSubmitressurs.status === RessursStatus.HENTER}
            maxWidthStyle="54rem"
            className={'vedtak'}
            feilmelding={hentFrontendFeilmelding(behandlingsstegSubmitressurs)}
            steg={BehandlingSteg.BESLUTTE_VEDTAK}
        >
            <OppsummeringVedtakInnhold
                åpenBehandling={åpenBehandling}
                settErUlagretNyFeilutbetaltValutaPeriode={settErUlagretNyFeilutbetaltValutaPeriode}
                erBehandlingMedVedtaksbrevutsending={erBehandlingMedVedtaksbrevutsending}
                visModal={visModal}
                settVisModal={settVisModal}
                settErUlagretNyRefusjonEøsPeriode={settErUlagretNyRefusjonEøsPeriode}
                bruker={bruker}
            ></OppsummeringVedtakInnhold>
        </StyledSkjemaSteg>
    );
};

export default OppsummeringVedtak;

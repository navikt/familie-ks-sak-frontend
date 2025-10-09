import { useNavigate } from 'react-router';
import styled from 'styled-components';

import { Alert } from '@navikt/ds-react';
import type { Ressurs } from '@navikt/familie-typer';
import { RessursStatus } from '@navikt/familie-typer';

import { useSimuleringContext } from './SimuleringContext';
import SimuleringPanel from './SimuleringPanel';
import SimuleringTabell from './SimuleringTabell';
import TilbakekrevingSkjema from './TilbakekrevingSkjema';
import useSakOgBehandlingParams from '../../../../../hooks/useSakOgBehandlingParams';
import Skjemasteg from '../../../../../komponenter/Skjemasteg/Skjemasteg';
import type { IBehandling } from '../../../../../typer/behandling';
import { BehandlingResultat, BehandlingSteg } from '../../../../../typer/behandling';
import type { ITilbakekreving } from '../../../../../typer/simulering';
import { hentSøkersMålform } from '../../../../../utils/behandling';
import { useBehandlingContext } from '../../../Behandling/context/BehandlingContext';

interface ISimuleringProps {
    åpenBehandling: IBehandling;
}

const StyledAlert = styled(Alert)`
    margin-bottom: 2rem;
`;

const Simulering: React.FC<ISimuleringProps> = ({ åpenBehandling }) => {
    const { fagsakId } = useSakOgBehandlingParams();
    const navigate = useNavigate();
    const {
        hentSkjemadata,
        onSubmit,
        simuleringsresultat,
        tilbakekrevingSkjema,
        harÅpenTilbakekrevingRessurs,
        erFeilutbetaling,
    } = useSimuleringContext();
    const { vurderErLesevisning, settÅpenBehandling } = useBehandlingContext();

    const nesteOnClick = () => {
        if (vurderErLesevisning() || åpenBehandling?.resultat == BehandlingResultat.AVSLÅTT) {
            navigate(`/fagsak/${fagsakId}/${åpenBehandling?.behandlingId}/vedtak`);
        } else {
            onSubmit<ITilbakekreving | undefined>(
                {
                    data: hentSkjemadata(),
                    method: 'POST',
                    url: `/familie-ks-sak/api/behandlinger/${åpenBehandling.behandlingId}/steg/simulering`,
                },
                (ressurs: Ressurs<IBehandling>) => {
                    if (ressurs.status === RessursStatus.SUKSESS) {
                        settÅpenBehandling(ressurs);
                        navigate(`/fagsak/${fagsakId}/${åpenBehandling?.behandlingId}/vedtak`);
                    }
                }
            );
        }
    };

    const forrigeOnClick = () => {
        navigate(`/fagsak/${fagsakId}/${åpenBehandling?.behandlingId}/tilkjent-ytelse`);
    };

    if (
        simuleringsresultat.status === RessursStatus.HENTER ||
        simuleringsresultat.status === RessursStatus.IKKE_HENTET
    ) {
        return <div />;
    }

    return (
        <Skjemasteg
            senderInn={tilbakekrevingSkjema.submitRessurs.status === RessursStatus.HENTER}
            tittel="Simulering"
            className="simulering"
            forrigeOnClick={forrigeOnClick}
            nesteOnClick={nesteOnClick}
            maxWidthStyle={'80rem'}
            steg={BehandlingSteg.SIMULERING}
        >
            {simuleringsresultat?.status === RessursStatus.SUKSESS ? (
                simuleringsresultat.data.perioder.length === 0 ? (
                    <Alert variant="info">Det er ingen etterbetaling, feilutbetaling eller neste utbetaling</Alert>
                ) : (
                    <>
                        <SimuleringPanel simulering={simuleringsresultat.data} />
                        <SimuleringTabell simulering={simuleringsresultat.data} />
                        {erFeilutbetaling && (
                            <TilbakekrevingSkjema
                                søkerMålform={hentSøkersMålform(åpenBehandling)}
                                harÅpenTilbakekrevingRessurs={harÅpenTilbakekrevingRessurs}
                            />
                        )}
                    </>
                )
            ) : (
                <Alert variant="info">Det har skjedd en feil: {simuleringsresultat?.frontendFeilmelding}</Alert>
            )}

            {(tilbakekrevingSkjema.submitRessurs.status === RessursStatus.FEILET ||
                tilbakekrevingSkjema.submitRessurs.status === RessursStatus.FUNKSJONELL_FEIL ||
                tilbakekrevingSkjema.submitRessurs.status === RessursStatus.IKKE_TILGANG) && (
                <StyledAlert variant="error">
                    Det har skjedd en feil og vi klarte ikke å lagre tilbakekrevingsvalget:{' '}
                    {tilbakekrevingSkjema.submitRessurs.frontendFeilmelding}
                </StyledAlert>
            )}
        </Skjemasteg>
    );
};

export default Simulering;

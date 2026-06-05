import { Path } from '@app/path';
import { useErLesevisning } from '@hooks/useErLesevisning';
import { useFagsakId } from '@hooks/useFagsakId';
import type { IBehandling } from '@typer/behandling';
import { BehandlingResultat, BehandlingSteg } from '@typer/behandling';
import type { ITilbakekreving } from '@typer/simulering';
import { hentSøkersMålform } from '@utils/behandling';
import { useNavigate } from 'react-router';

import { InformationSquareIcon } from '@navikt/aksel-icons';
import { Box, InfoCard, LocalAlert } from '@navikt/ds-react';
import type { Ressurs } from '@navikt/familie-typer';
import { RessursStatus } from '@navikt/familie-typer';

import { useSimuleringContext } from './SimuleringContext';
import SimuleringPanel from './SimuleringPanel';
import SimuleringTabell from './SimuleringTabell';
import TilbakekrevingSkjema from './TilbakekrevingSkjema';
import Skjemasteg from '../../../../../komponenter/Skjemasteg/Skjemasteg';
import { useBehandlingContext } from '../../context/BehandlingContext';

const Simulering = () => {
    const {
        hentSkjemadata,
        onSubmit,
        simuleringsresultat,
        tilbakekrevingSkjema,
        harÅpenTilbakekrevingRessurs,
        erFeilutbetaling,
    } = useSimuleringContext();

    const { behandling, settÅpenBehandling } = useBehandlingContext();

    const fagsakId = useFagsakId();
    const erLesevisning = useErLesevisning();
    const navigate = useNavigate();

    const nesteOnClick = () => {
        if (erLesevisning || behandling.resultat == BehandlingResultat.AVSLÅTT) {
            navigate(Path.fagsak(fagsakId).behandling(behandling.behandlingId).vedtak);
        } else {
            onSubmit<ITilbakekreving | undefined>(
                {
                    data: hentSkjemadata(),
                    method: 'POST',
                    url: `/familie-ks-sak/api/behandlinger/${behandling.behandlingId}/steg/simulering`,
                },
                (ressurs: Ressurs<IBehandling>) => {
                    if (ressurs.status === RessursStatus.SUKSESS) {
                        settÅpenBehandling(ressurs);
                        navigate(`/fagsak/${fagsakId}/${behandling.behandlingId}/vedtak`);
                    }
                }
            );
        }
    };

    const forrigeOnClick = () => {
        navigate(`/fagsak/${fagsakId}/${behandling.behandlingId}/tilkjent-ytelse`);
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
                    <InfoCard data-color="info">
                        <InfoCard.Message icon={<InformationSquareIcon aria-hidden />}>
                            Det er ingen etterbetaling, feilutbetaling eller neste utbetaling
                        </InfoCard.Message>
                    </InfoCard>
                ) : (
                    <>
                        <SimuleringPanel simulering={simuleringsresultat.data} />
                        <SimuleringTabell simulering={simuleringsresultat.data} />
                        {erFeilutbetaling && (
                            <TilbakekrevingSkjema
                                søkerMålform={hentSøkersMålform(behandling)}
                                harÅpenTilbakekrevingRessurs={harÅpenTilbakekrevingRessurs}
                            />
                        )}
                    </>
                )
            ) : (
                <LocalAlert status="error">
                    <LocalAlert.Header>
                        <LocalAlert.Title>Det har skjedd en feil</LocalAlert.Title>
                    </LocalAlert.Header>
                    <LocalAlert.Content>{simuleringsresultat?.frontendFeilmelding}</LocalAlert.Content>
                </LocalAlert>
            )}

            {(tilbakekrevingSkjema.submitRessurs.status === RessursStatus.FEILET ||
                tilbakekrevingSkjema.submitRessurs.status === RessursStatus.FUNKSJONELL_FEIL ||
                tilbakekrevingSkjema.submitRessurs.status === RessursStatus.IKKE_TILGANG) && (
                <Box marginBlock={'space-16 space-32'}>
                    <LocalAlert status="error">
                        <LocalAlert.Header>
                            <LocalAlert.Title>
                                Det har skjedd en feil og vi klarte ikke å lagre tilbakekrevingsvalget
                            </LocalAlert.Title>
                        </LocalAlert.Header>
                        <LocalAlert.Content>
                            {tilbakekrevingSkjema.submitRessurs.frontendFeilmelding}
                        </LocalAlert.Content>
                    </LocalAlert>
                </Box>
            )}
        </Skjemasteg>
    );
};

export default Simulering;

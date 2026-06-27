import { useEffect, useState } from 'react';

import { useBehandlingContext } from '@sider/Fagsak/Behandling/context/BehandlingContext';
import { useKontrollsiderContext } from '@sider/Fagsak/Behandling/KontrollsiderContext';
import { KontrollertStatus } from '@sider/Fagsak/Behandling/sider/sider';
import type { IBehandling } from '@typer/behandling';
import { BehandlingStatus } from '@typer/behandling';
import type { ITotrinnskontrollData } from '@typer/totrinnskontroll';
import { TotrinnskontrollBeslutning } from '@typer/totrinnskontroll';
import type { AxiosError } from 'axios';
import styled from 'styled-components';

import { useHttp } from '@navikt/familie-http';
import type { Ressurs } from '@navikt/familie-typer';
import {
    byggFeiletRessurs,
    byggFunksjonellFeilRessurs,
    byggHenterRessurs,
    byggTomRessurs,
    RessursStatus,
} from '@navikt/familie-typer';

import { useTotrinnskontrollModalContext } from './TotrinnskontrollModalContextProvider';
import { Totrinnskontrollskjema } from './Totrinnskontrollskjema';
import { Tab, useTabContext } from '../TabContextProvider';

const Container = styled.div`
    padding: 0.5rem 1.5rem;
    display: flex;
`;

export function Totrinnskontroll() {
    const { behandling, settÅpenBehandling } = useBehandlingContext();
    const { kontrollsider, settIkkeKontrollerteSiderTilManglerKontroll } = useKontrollsiderContext();
    const { settTab } = useTabContext();
    const { åpneModal } = useTotrinnskontrollModalContext();

    const { request } = useHttp();

    const [innsendtVedtak, settInnsendtVedtak] = useState<Ressurs<IBehandling>>(byggTomRessurs());

    const [forrigeKontrollsider, settForrigeKontrollsider] = useState(kontrollsider);

    const nullstillFeilmelding = () => {
        const harMinstEnSideBlittKontrollert = forrigeKontrollsider.some(forrigeSide => {
            const nåværendeSide = kontrollsider.find(side => side.id === forrigeSide.id);
            return (
                forrigeSide.kontrollertStatus !== KontrollertStatus.KONTROLLERT &&
                nåværendeSide?.kontrollertStatus === KontrollertStatus.KONTROLLERT
            );
        });
        if (harMinstEnSideBlittKontrollert) {
            settInnsendtVedtak(byggTomRessurs());
        }
        settForrigeKontrollsider(kontrollsider);
    };

    useEffect(() => {
        nullstillFeilmelding();
    }, [kontrollsider]);

    const sendInnVedtak = (beslutning: TotrinnskontrollBeslutning, begrunnelse: string, egetVedtak: boolean) => {
        const harSideSomIkkeErKontrollert = kontrollsider.some(
            side => side.kontrollertStatus !== KontrollertStatus.KONTROLLERT
        );
        if (!egetVedtak && harSideSomIkkeErKontrollert) {
            settIkkeKontrollerteSiderTilManglerKontroll();
            settInnsendtVedtak(byggFunksjonellFeilRessurs('Du må kontrollere alle steg i løsningen.'));
            return;
        }

        settInnsendtVedtak(byggHenterRessurs());
        const manglerBegrunnelse = beslutning === TotrinnskontrollBeslutning.UNDERKJENT && !begrunnelse;
        if (beslutning === TotrinnskontrollBeslutning.IKKE_VURDERT) {
            settInnsendtVedtak(byggFeiletRessurs('Totrinnskontroll ikke vurdert ved innsending'));
        } else if (manglerBegrunnelse) {
            settInnsendtVedtak(byggFeiletRessurs('Mangler begrunnelse ved innsending'));
        } else {
            request<ITotrinnskontrollData, IBehandling>({
                method: 'POST',
                data: {
                    beslutning,
                    begrunnelse,
                    kontrollerteSider: kontrollsider.map(side => side.navn),
                },
                url: `/familie-ks-sak/api/behandlinger/${behandling.behandlingId}/steg/beslutt-vedtak`,
            })
                .then((response: Ressurs<IBehandling>) => {
                    settInnsendtVedtak(response);
                    if (response.status === RessursStatus.SUKSESS) {
                        settÅpenBehandling(response);
                        åpneModal(beslutning);
                        settTab(Tab.Historikk);
                    }
                })
                .catch((_error: AxiosError) => {
                    settInnsendtVedtak(byggFeiletRessurs('Ukjent feil, sende inn vedtak.'));
                });
        }
    };

    return (
        <>
            {behandling.status === BehandlingStatus.FATTER_VEDTAK && (
                <Container className="totrinnskontroll">
                    <Totrinnskontrollskjema sendInnVedtak={sendInnVedtak} innsendtVedtak={innsendtVedtak} />
                </Container>
            )}
        </>
    );
}

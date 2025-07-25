import React, { useState } from 'react';

import { useNavigate } from 'react-router';

import { Button, Loader } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer';

import useFagsakApi from '../../api/useFagsakApi';
import { useAppContext } from '../../context/AppContext';
import { AlertType, ToastTyper } from '../../komponenter/Toast/typer';
import type { IOppgave } from '../../typer/oppgave';
import { oppgaveTypeFilter, OppgavetypeFilter } from '../../typer/oppgave';
import { hentFnrFraOppgaveIdenter } from '../../utils/oppgave';

interface IOppgaveDirektelenke {
    oppgave: IOppgave;
}

const OppgaveDirektelenke: React.FC<IOppgaveDirektelenke> = ({ oppgave }) => {
    const { settToast } = useAppContext();
    const { hentFagsakForPerson } = useFagsakApi();
    const { sjekkTilgang } = useAppContext();
    const [laster, settLaster] = useState<boolean>(false);
    const navigate = useNavigate();
    const oppgavetype = oppgaveTypeFilter[oppgave.oppgavetype as OppgavetypeFilter]?.id;

    const visTilgangsmodalEllerSendVidere = async (oppgave: IOppgave) => {
        settLaster(true);

        const brukerident = hentFnrFraOppgaveIdenter(oppgave.identer);
        if (brukerident) {
            if (await sjekkTilgang(brukerident, false)) {
                navigate(`/oppgaver/journalfor/${oppgave.id}`);
            }
        } else {
            navigate(`/oppgaver/journalfor/${oppgave.id}`);
        }
        settLaster(false);
    };

    const sjekkTilgangOgGåTilBehandling = async (oppgave: IOppgave) => {
        settLaster(true);

        const brukerident = hentFnrFraOppgaveIdenter(oppgave.identer);
        if (brukerident && (await sjekkTilgang(brukerident, false))) {
            const fagsak = await hentFagsakForPerson(brukerident);
            if (fagsak.status === RessursStatus.SUKSESS && fagsak.data?.id) {
                navigate(`/fagsak/${fagsak.data.id}/saksoversikt`);
            } else {
                settToast(ToastTyper.FANT_IKKE_FAGSAK, {
                    alertType: AlertType.WARNING,
                    tekst: 'Fant ikke fagsak',
                });
            }
        } else {
            settToast(ToastTyper.MANGLER_TILGANG, {
                alertType: AlertType.WARNING,
                tekst: 'Mangler tilgang',
            });
        }
        settLaster(false);
    };

    if (laster) {
        return <Loader size="xsmall" title="Laster.." />;
    } else {
        switch (oppgavetype) {
            case OppgavetypeFilter.JFR:
                return (
                    <Button
                        variant="tertiary"
                        size="small"
                        key={'tiloppg'}
                        onClick={() => {
                            visTilgangsmodalEllerSendVidere(oppgave);
                        }}
                        children={'Se oppgave'}
                    />
                );
            case OppgavetypeFilter.BEH_SED:
                return (
                    <Button
                        variant="tertiary"
                        size="small"
                        key={'tiloppg'}
                        onClick={() => {
                            visTilgangsmodalEllerSendVidere(oppgave);
                        }}
                        children={'Gå til oppgave'}
                    />
                );
            case OppgavetypeFilter.BEH_SAK:
            case OppgavetypeFilter.GOD_VED:
            case OppgavetypeFilter.BEH_UND_VED:
            case OppgavetypeFilter.VURD_LIVS:
            case OppgavetypeFilter.FREM:
                return (
                    <Button
                        variant="tertiary"
                        size="small"
                        key={'tilfagsak'}
                        onClick={() => {
                            sjekkTilgangOgGåTilBehandling(oppgave);
                        }}
                        children={'Gå til fagsak'}
                    />
                );
            default:
                return <></>;
        }
    }
};

export default OppgaveDirektelenke;

import { useState } from 'react';

import { useAppContext } from '@context/AppContext';
import { useToastContext } from '@context/ToastContext';
import { AlertType, ToastTyper } from '@komponenter/Toast/typer';
import type { IOppgave } from '@typer/oppgave';
import { oppgaveTypeFilter, OppgavetypeFilter } from '@typer/oppgave';
import { hentFnrFraOppgaveIdenter } from '@utils/oppgave';
import { useNavigate } from 'react-router';

import { Button } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer';

import useFagsakApi from '../../api/useFagsakApi';

interface IOppgaveDirektelenke {
    oppgave: IOppgave;
}

export function OppgaveDirektelenke({ oppgave }: IOppgaveDirektelenke) {
    const { settToast } = useToastContext();
    const { hentFagsakForPerson } = useFagsakApi();
    const { sjekkTilgang } = useAppContext();
    const [laster, settLaster] = useState<boolean>(false);
    const navigate = useNavigate();
    const oppgavetype = oppgaveTypeFilter[oppgave.oppgavetype as OppgavetypeFilter]?.id;

    async function visTilgangsmodalEllerSendVidere(oppgave: IOppgave) {
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
    }

    async function sjekkTilgangOgGåTilBehandling(oppgave: IOppgave) {
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
    }

    switch (oppgavetype) {
        case OppgavetypeFilter.JFR:
            return (
                <Button
                    variant={'tertiary'}
                    size={'small'}
                    onClick={() => visTilgangsmodalEllerSendVidere(oppgave)}
                    loading={laster}
                >
                    Se oppgave
                </Button>
            );
        case OppgavetypeFilter.BEH_SED:
            return (
                <Button
                    variant={'tertiary'}
                    size={'small'}
                    onClick={() => visTilgangsmodalEllerSendVidere(oppgave)}
                    loading={laster}
                >
                    Gå til oppgave
                </Button>
            );
        case OppgavetypeFilter.BEH_SAK:
        case OppgavetypeFilter.GOD_VED:
        case OppgavetypeFilter.BEH_UND_VED:
        case OppgavetypeFilter.VURD_LIVS:
        case OppgavetypeFilter.FREM:
            return (
                <Button
                    variant={'tertiary'}
                    size={'small'}
                    onClick={() => sjekkTilgangOgGåTilBehandling(oppgave)}
                    loading={laster}
                >
                    Gå til fagsak
                </Button>
            );
        default:
            return null;
    }
}

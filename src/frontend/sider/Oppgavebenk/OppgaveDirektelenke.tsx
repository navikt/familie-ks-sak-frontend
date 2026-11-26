import { useVisManglerTilgangModal } from '@context/ManglerTilgangModalContext';
import { useVisTekniskFeilModal } from '@context/TekniskFeilModalContext';
import { useHentFagsakPaaPerson } from '@hooks/useHentFagsakPaaPerson';
import { useSjekkSaksbehandlertilgangTilIdent } from '@hooks/useSjekkSaksbehandlertilgangTilIdent';
import { Button } from '@navikt/ds-react';
import type { IOppgave } from '@typer/oppgave';
import { OppgavetypeFilter, oppgaveTypeFilter } from '@typer/oppgave';
import { hentFnrFraOppgaveIdenter } from '@utils/oppgave';
import { useState } from 'react';
import { useNavigate } from 'react-router';

interface Props {
    oppgave: IOppgave;
}

export function OppgaveDirektelenke({ oppgave }: Props) {
    const visTekniskFeilModal = useVisTekniskFeilModal();
    const visManglerTilgangModal = useVisManglerTilgangModal();

    const navigate = useNavigate();

    const [laster, settLaster] = useState(false);

    const { mutateAsync: sjekkSaksbehandlertilgangTilIdent } = useSjekkSaksbehandlertilgangTilIdent();
    const { mutateAsync: hentFagsakPaaPerson } = useHentFagsakPaaPerson();

    async function navigerTilJournalføring() {
        settLaster(true);
        let navigerer = false;
        try {
            const brukerIdent = hentFnrFraOppgaveIdenter(oppgave.identer);
            if (brukerIdent) {
                const tilgangsresultat = await sjekkSaksbehandlertilgangTilIdent({ brukerIdent });
                if (!tilgangsresultat.saksbehandlerHarTilgang) {
                    visManglerTilgangModal(tilgangsresultat);
                    return;
                }
            }
            navigate(`/oppgaver/journalfor/${oppgave.id}`);
            navigerer = true;
        } catch (error) {
            visTekniskFeilModal(error);
        } finally {
            if (!navigerer) {
                settLaster(false);
            }
        }
    }

    async function navigerTilFagsak() {
        settLaster(true);
        let navigerer = false;
        try {
            const brukerIdent = hentFnrFraOppgaveIdenter(oppgave.identer);
            if (!brukerIdent) {
                visManglerTilgangModal();
                return;
            }
            const tilgangsresultat = await sjekkSaksbehandlertilgangTilIdent({ brukerIdent });
            if (!tilgangsresultat.saksbehandlerHarTilgang) {
                visManglerTilgangModal(tilgangsresultat);
                return;
            }
            const fagsak = await hentFagsakPaaPerson({ ident: brukerIdent });
            navigate(`/fagsak/${fagsak.id}/saksoversikt`);
            navigerer = true;
        } catch (error) {
            visTekniskFeilModal(error);
        } finally {
            if (!navigerer) {
                settLaster(false);
            }
        }
    }

    const oppgavetype = oppgaveTypeFilter[oppgave.oppgavetype as OppgavetypeFilter]?.id;

    switch (oppgavetype) {
        case OppgavetypeFilter.JFR:
            return (
                <Button variant={'tertiary'} size={'small'} onClick={navigerTilJournalføring} loading={laster}>
                    Se oppgave
                </Button>
            );
        case OppgavetypeFilter.BEH_SED:
            return (
                <Button variant={'tertiary'} size={'small'} onClick={navigerTilJournalføring} loading={laster}>
                    Gå til oppgave
                </Button>
            );
        case OppgavetypeFilter.BEH_SAK:
        case OppgavetypeFilter.GOD_VED:
        case OppgavetypeFilter.BEH_UND_VED:
        case OppgavetypeFilter.VURD_LIVS:
        case OppgavetypeFilter.FREM:
            return (
                <Button variant={'tertiary'} size={'small'} onClick={navigerTilFagsak} loading={laster}>
                    Gå til fagsak
                </Button>
            );
        default:
            return null;
    }
}

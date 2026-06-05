import { useState } from 'react';

import { Path } from '@app/path';
import { useVisManglerTilgangModal } from '@context/ManglerTilgangModalContext';
import { useVisTekniskFeilModal } from '@context/TekniskFeilModalContext';
import { useHentFagsakPaaPerson } from '@hooks/useHentFagsakPaaPerson';
import { useSjekkSaksbehandlertilgangTilIdent } from '@hooks/useSjekkSaksbehandlertilgangTilIdent';
import type { IOppgave } from '@typer/oppgave';
import { OppgavetypeFilter, oppgaveTypeFilter } from '@typer/oppgave';
import { hentFnrFraOppgaveIdenter } from '@utils/oppgave';
import { useNavigate } from 'react-router';

import { Button } from '@navikt/ds-react';

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
        const brukerIdent = hentFnrFraOppgaveIdenter(oppgave.identer);
        if (brukerIdent) {
            try {
                const tilgangsreusltat = await sjekkSaksbehandlertilgangTilIdent({ brukerIdent });
                if (tilgangsreusltat.saksbehandlerHarTilgang) {
                    navigate(Path.journalfør(oppgave.id));
                } else {
                    visManglerTilgangModal(tilgangsreusltat);
                }
            } catch (error) {
                visTekniskFeilModal(error);
            }
        } else {
            navigate(Path.journalfør(oppgave.id));
        }
        settLaster(false);
    }

    async function navigerTilFagsak() {
        settLaster(true);
        const brukerIdent = hentFnrFraOppgaveIdenter(oppgave.identer);
        if (brukerIdent) {
            try {
                const tilgangsreusltat = await sjekkSaksbehandlertilgangTilIdent({ brukerIdent });
                if (tilgangsreusltat.saksbehandlerHarTilgang) {
                    const fagsak = await hentFagsakPaaPerson({ ident: brukerIdent });
                    navigate(Path.fagsak(fagsak.id).saksoversikt);
                } else {
                    visManglerTilgangModal(tilgangsreusltat);
                }
            } catch (error) {
                visTekniskFeilModal(error);
            }
        } else {
            visManglerTilgangModal();
        }
        settLaster(false);
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

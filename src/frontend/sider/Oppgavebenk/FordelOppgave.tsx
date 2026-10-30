import { useVisManglerTilgangModal } from '@context/ManglerTilgangModalContext';
import { useVisTekniskFeilModal } from '@context/TekniskFeilModalContext';
import { useFordelOppgave } from '@hooks/useFordelOppgave';
import { HentFagsakQueryKeyFactory } from '@hooks/useHentFagsak';
import { useHentFagsakPaaPerson } from '@hooks/useHentFagsakPaaPerson';
import { useOpprettEllerHentFagsak } from '@hooks/useOpprettEllerHentFagsak';
import { useSaksbehandler } from '@hooks/useSaksbehandler';
import { useSjekkSaksbehandlertilgangTilIdent } from '@hooks/useSjekkSaksbehandlertilgangTilIdent';
import { Button } from '@navikt/ds-react';
import { useQueryClient } from '@tanstack/react-query';
import { BehandlingstypeFilter, type IOppgave, OppgavetypeFilter } from '@typer/oppgave';
import { hentFnrFraOppgaveIdenter } from '@utils/oppgave';
import { useState } from 'react';
import { useNavigate } from 'react-router';

interface Props {
    oppgave: IOppgave;
}

export function FordelOppgave({ oppgave }: Props) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const saksbehandler = useSaksbehandler();

    const visTekniskFeilModal = useVisTekniskFeilModal();
    const visManglerTilgangModal = useVisManglerTilgangModal();

    const { mutateAsync: sjekkSaksbehandlertilgangTilIdent } = useSjekkSaksbehandlertilgangTilIdent({});
    const { mutateAsync: hentFagsakPaaPerson } = useHentFagsakPaaPerson({ visSystemetLaster: false });
    const { mutateAsync: opprettEllerHentFagsak } = useOpprettEllerHentFagsak();
    const { mutateAsync: fordelOppgave } = useFordelOppgave();

    const [laster, settLaster] = useState(false);

    async function onFordelOppgave() {
        if (laster) {
            return;
        }

        settLaster(true);

        let navigerer = false;

        try {
            const brukerIdent = hentFnrFraOppgaveIdenter(oppgave.identer);
            const oppgavetype = OppgavetypeFilter[oppgave.oppgavetype as keyof typeof OppgavetypeFilter];
            const erTilbakekreving = oppgave.behandlingstype === BehandlingstypeFilter.ae0161;

            if (brukerIdent) {
                const tilgangsresultat = await sjekkSaksbehandlertilgangTilIdent({ brukerIdent });
                if (!tilgangsresultat.saksbehandlerHarTilgang) {
                    visManglerTilgangModal(tilgangsresultat);
                    return;
                }
            }

            await fordelOppgave({ oppgaveId: oppgave.id, saksbehandler: saksbehandler.navIdent });

            // TODO : Invalidate oppgaver når det er flyttet til react-query. Metoden "fordelOppgaver" returnerer kun en ID, så da må vi invalidere istedenfor å sette dataen manuelt.

            if (oppgavetype === OppgavetypeFilter.JFR || oppgavetype === OppgavetypeFilter.BEH_SED) {
                navigerer = true;
                navigate(`/oppgaver/journalfor/${oppgave.id}`);
                return;
            }

            if (erTilbakekreving) {
                if (!brukerIdent) {
                    visTekniskFeilModal(
                        new Error('Klarte ikke å navigere til tilbakekreving fordi ident ikke finnes.')
                    );
                    return;
                }
                const fagsak = await hentFagsakPaaPerson({ ident: brukerIdent });
                navigerer = true;
                window.location.href = `/redirect/familie-tilbake/fagsystem/KS/fagsak/${fagsak.id}/behandling/${oppgave.saksreferanse}`;
                return;
            }

            if (oppgave.aktoerId) {
                const fagsak = await opprettEllerHentFagsak({ aktørId: oppgave.aktoerId });
                queryClient.setQueryData(HentFagsakQueryKeyFactory.fagsak(fagsak.id), fagsak);
                const aktivBehandling = fagsak.behandlinger.find(behandling => behandling.aktiv);
                navigerer = true;
                navigate(`/fagsak/${fagsak.id}/${aktivBehandling?.behandlingId ?? 'saksoversikt'}`);
                return;
            }
        } catch (error) {
            visTekniskFeilModal(error);
        } finally {
            // Beholder lastestatus under navigering, slik at oppgaven ikke kan fordeles på nytt før siden byttes.
            if (!navigerer) {
                settLaster(false);
            }
        }
    }

    return (
        <Button type={'button'} variant={'secondary'} size={'small'} onClick={onFordelOppgave} loading={laster}>
            Tildel meg
        </Button>
    );
}

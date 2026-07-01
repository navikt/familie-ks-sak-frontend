import { useFagsak } from '@hooks/useFagsak';
import { HentFagsakQueryKeyFactory } from '@hooks/useHentFagsak';
import { HentKlagebehandlingerQueryKeyFactory } from '@hooks/useHentKlagebehandlinger';
import { HentKontantstøttebehandlingerQueryKeyFactory } from '@hooks/useHentKontantstøttebehandlinger';
import { HentTilbakekrevingsbehandlingerQueryKeyFactory } from '@hooks/useHentTilbakekrevingsbehandlinger';
import { useOpprettBehandling } from '@hooks/useOpprettBehandling';
import { useOpprettKlagebehandling } from '@hooks/useOpprettKlagebehandling';
import { useOpprettTilbakekreving } from '@hooks/useOpprettTilbakekreving';
import { useSaksbehandler } from '@hooks/useSaksbehandler';
import { useQueryClient } from '@tanstack/react-query';
import type { Behandlingstype } from '@typer/behandling';
import { BehandlingÅrsak } from '@typer/behandling';
import type { Behandlingstema } from '@typer/behandlingstema';
import { Klagebehandlingstype } from '@typer/klage';
import { Tilbakekrevingsbehandlingstype } from '@typer/tilbakekrevingsbehandling';
import type { IsoDatoString } from '@utils/dato';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';

export enum OpprettBehandlingFelt {
    BEHANDLINGSTYPE = 'behandlingstype',
    BEHANDLINGSÅRSAK = 'behandlingsårsak',
    BEHANDLINGSTEMA = 'behandlingstema',
    SØKNAD_MOTTATT_DATO = 'søknadMottattDato',
    KLAGE_MOTTATT_DATO = 'klageMottattDato',
}

export interface OpprettBehandlingFormValues {
    [OpprettBehandlingFelt.BEHANDLINGSTYPE]:
        | Behandlingstype
        | Tilbakekrevingsbehandlingstype
        | Klagebehandlingstype
        | string;
    [OpprettBehandlingFelt.BEHANDLINGSÅRSAK]: BehandlingÅrsak | string;
    [OpprettBehandlingFelt.BEHANDLINGSTEMA]: Behandlingstema | string;
    [OpprettBehandlingFelt.SØKNAD_MOTTATT_DATO]: IsoDatoString;
    [OpprettBehandlingFelt.KLAGE_MOTTATT_DATO]: IsoDatoString;
}

interface TransformedOpprettBehandlingFormValues {
    [OpprettBehandlingFelt.BEHANDLINGSTYPE]: Behandlingstype | Tilbakekrevingsbehandlingstype | Klagebehandlingstype;
    [OpprettBehandlingFelt.BEHANDLINGSÅRSAK]: BehandlingÅrsak;
    [OpprettBehandlingFelt.BEHANDLINGSTEMA]: Behandlingstema;
    [OpprettBehandlingFelt.SØKNAD_MOTTATT_DATO]: IsoDatoString;
    [OpprettBehandlingFelt.KLAGE_MOTTATT_DATO]: IsoDatoString;
}

interface Props {
    lukkModal: () => void;
    onTilbakekrevingsbehandlingOpprettet: () => void;
}

export function useOpprettBehandlingSkjema({ lukkModal, onTilbakekrevingsbehandlingOpprettet }: Props) {
    const fagsak = useFagsak();
    const saksbehandler = useSaksbehandler();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const form = useForm<OpprettBehandlingFormValues, unknown, TransformedOpprettBehandlingFormValues>({
        defaultValues: {
            [OpprettBehandlingFelt.BEHANDLINGSTYPE]: '',
            [OpprettBehandlingFelt.BEHANDLINGSÅRSAK]: '',
            [OpprettBehandlingFelt.BEHANDLINGSTEMA]: '',
            [OpprettBehandlingFelt.SØKNAD_MOTTATT_DATO]: '',
            [OpprettBehandlingFelt.KLAGE_MOTTATT_DATO]: '',
        },
    });

    const { setError } = form;

    const { mutateAsync: opprettKlagebehandling } = useOpprettKlagebehandling();

    const { mutateAsync: opprettTilbakekreving } = useOpprettTilbakekreving();

    const { mutateAsync: opprettBehandling } = useOpprettBehandling();

    async function onSubmit(values: TransformedOpprettBehandlingFormValues) {
        const { behandlingstype, behandlingsårsak, behandlingstema, søknadMottattDato, klageMottattDato } = values;

        if (behandlingstype === Klagebehandlingstype.KLAGE) {
            try {
                await opprettKlagebehandling({ klageMottattDato, fagsakId: fagsak.id });
                await queryClient.invalidateQueries({
                    queryKey: HentKlagebehandlingerQueryKeyFactory.klagebehandlinger(fagsak.id),
                });
                lukkModal();
            } catch (error) {
                setError('root', {
                    message: error instanceof Error ? error.message : 'Teknisk feil ved oppretting av klagebehandling.',
                });
            }
        } else if (behandlingstype === Tilbakekrevingsbehandlingstype.TILBAKEKREVING) {
            try {
                await opprettTilbakekreving({ fagsakId: fagsak.id });
                await queryClient.invalidateQueries({
                    queryKey: HentTilbakekrevingsbehandlingerQueryKeyFactory.tilbakekrevingsbehandlinger(fagsak.id),
                });
                onTilbakekrevingsbehandlingOpprettet();
                lukkModal();
            } catch (error) {
                setError('root', {
                    message: error instanceof Error ? error.message : 'Teknisk feil ved oppretting av tilbakekreving.',
                });
            }
        } else {
            try {
                const opprettBehandlingParameters = {
                    behandlingType: behandlingstype,
                    behandlingÅrsak: behandlingsårsak,
                    kategori: behandlingstema ?? null,
                    saksbehandlerIdent: saksbehandler.navIdent,
                    søkersIdent: fagsak.søkerFødselsnummer,
                    søknadMottattDato: søknadMottattDato ?? undefined,
                };
                const behandling = await opprettBehandling(opprettBehandlingParameters);
                queryClient.invalidateQueries({
                    queryKey: HentKontantstøttebehandlingerQueryKeyFactory.kontantstøttebehandlinger(fagsak.id),
                });
                await queryClient.invalidateQueries({ queryKey: HentFagsakQueryKeyFactory.fagsak(fagsak.id) });
                lukkModal();

                if (behandling.årsak === BehandlingÅrsak.SØKNAD) {
                    navigate(`/fagsak/${fagsak.id}/${behandling.behandlingId}/registrer-soknad`);
                } else {
                    navigate(`/fagsak/${fagsak.id}/${behandling.behandlingId}/vilkaarsvurdering`);
                }
            } catch (error) {
                setError('root', {
                    message: error instanceof Error ? error.message : 'Teknisk feil ved opprettelse av behandling.',
                });
            }
        }
    }

    return {
        form,
        onSubmit,
    };
}

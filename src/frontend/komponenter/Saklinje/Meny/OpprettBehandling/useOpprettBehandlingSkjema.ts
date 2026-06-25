import { useEffect } from 'react';

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
import { Behandlingstype, BehandlingÅrsak } from '@typer/behandling';
import type { IBehandlingstema } from '@typer/behandlingstema';
import { Klagebehandlingstype } from '@typer/klage';
import { Tilbakekrevingsbehandlingstype } from '@typer/tilbakekrevingsbehandling';
import type { IsoDatoString } from '@utils/dato';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';

export enum OpprettBehandlingFelt {
    BEHANDLINGSTYPE = 'behandlingstype',
    BEHANDLINGSÅRSAK = 'behandlingsårsak',
    BEHANDLINGSKATEGORI = 'behandlingstema', // TODO: rename til BEHANDLINGKATEGORI?
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
    [OpprettBehandlingFelt.BEHANDLINGSKATEGORI]: IBehandlingstema; // TODO: trenger å fikse denne
    [OpprettBehandlingFelt.SØKNAD_MOTTATT_DATO]: IsoDatoString;
    [OpprettBehandlingFelt.KLAGE_MOTTATT_DATO]: IsoDatoString;
}

interface TransformedOpprettBehandlingFormValues {
    [OpprettBehandlingFelt.BEHANDLINGSTYPE]: Behandlingstype | Tilbakekrevingsbehandlingstype | Klagebehandlingstype;
    [OpprettBehandlingFelt.BEHANDLINGSÅRSAK]: BehandlingÅrsak;
    [OpprettBehandlingFelt.BEHANDLINGSKATEGORI]: IBehandlingstema;
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
            [OpprettBehandlingFelt.BEHANDLINGSKATEGORI]: {}, // TODO: fix
            [OpprettBehandlingFelt.SØKNAD_MOTTATT_DATO]: '',
            [OpprettBehandlingFelt.KLAGE_MOTTATT_DATO]: '',
        },
    });

    const { setError, setValue, watch } = form;
    const behandlingstypeVerdi = watch(OpprettBehandlingFelt.BEHANDLINGSTYPE);

    useEffect(() => {
        if (behandlingstypeVerdi === Behandlingstype.FØRSTEGANGSBEHANDLING) {
            setValue(OpprettBehandlingFelt.BEHANDLINGSÅRSAK, BehandlingÅrsak.SØKNAD);
        } else if (behandlingstypeVerdi === Behandlingstype.TEKNISK_ENDRING) {
            setValue(OpprettBehandlingFelt.BEHANDLINGSÅRSAK, BehandlingÅrsak.TEKNISK_ENDRING);
        }
    }, [behandlingstypeVerdi, setValue]);

    const { mutateAsync: opprettKlagebehandling } = useOpprettKlagebehandling();

    const { mutateAsync: opprettTilbakekreving } = useOpprettTilbakekreving();

    const { mutateAsync: opprettBehandling } = useOpprettBehandling();

    const onSubmit = async (values: TransformedOpprettBehandlingFormValues) => {
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
                    kategori: behandlingstema.kategori ?? null,
                    saksbehandlerIdent: saksbehandler.navIdent,
                    søkersIdent: fagsak.søkerFødselsnummer,
                    søknadMottattDato: søknadMottattDato,
                };
                await opprettBehandling(opprettBehandlingParameters).then(behandling => {
                    Promise.all([
                        queryClient.invalidateQueries({
                            queryKey: HentKontantstøttebehandlingerQueryKeyFactory.kontantstøttebehandlinger(fagsak.id),
                        }),
                        queryClient.invalidateQueries({ queryKey: HentFagsakQueryKeyFactory.fagsak(fagsak.id) }),
                    ]);
                    lukkModal();

                    if (behandling.årsak === BehandlingÅrsak.SØKNAD) {
                        navigate(`/fagsak/${fagsak.id}/${behandling.behandlingId}/registrer-soknad`);
                    } else {
                        navigate(`/fagsak/${fagsak.id}/${behandling.behandlingId}/vilkaarsvurdering`);
                    }
                });
            } catch (error) {
                setError('root', {
                    message: error instanceof Error ? error.message : 'Teknisk feil ved opprettelse av behandling.',
                });
            }
        }
    };

    return {
        form,
        onSubmit,
    };
}

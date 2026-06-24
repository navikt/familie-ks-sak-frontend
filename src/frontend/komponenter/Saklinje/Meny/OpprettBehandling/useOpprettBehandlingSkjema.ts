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

    const { mutateAsync: opprettKlagebehandling } = useOpprettKlagebehandling({
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: HentKlagebehandlingerQueryKeyFactory.klagebehandlinger(fagsak.id),
            });

            lukkModal();
        },
        onError: error => {
            setError('root', { message: error.message ?? 'Teknisk feil ved oppretting av klagebehandling.' });
        },
    });

    const { mutateAsync: opprettTilbakekreving } = useOpprettTilbakekreving({
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: HentTilbakekrevingsbehandlingerQueryKeyFactory.tilbakekrevingsbehandlinger(fagsak.id),
            });

            lukkModal();
            onTilbakekrevingsbehandlingOpprettet();
        },
        onError: error => {
            setError('root', { message: error.message ?? 'Teknisk feil ved oppretting av tilbakekreving.' });
        },
    });

    const { mutateAsync: opprettBehandling } = useOpprettBehandling({
        onSuccess: async behandling => {
            await Promise.all([
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
        },
        onError: error => {
            setError('root', { message: error.message ?? 'Teknisk feil ved oppretting av behandling.' });
        },
    });

    const onSubmit = async (values: TransformedOpprettBehandlingFormValues) => {
        console.log('values i onsubmit', values);
        const { behandlingstype, behandlingsårsak, behandlingstema, søknadMottattDato, klageMottattDato } = values;

        switch (behandlingstype) {
            case Klagebehandlingstype.KLAGE:
                return await opprettKlagebehandling({
                    klageMottattDato,
                    fagsakId: fagsak.id,
                });
            case Tilbakekrevingsbehandlingstype.TILBAKEKREVING:
                return await opprettTilbakekreving({ fagsakId: fagsak.id });
            case Tilbakekrevingsbehandlingstype.REVURDERING_TILBAKEKREVING:
                return setError('root', { message: 'Oppretting av revurdering tilbakekreving er ikke implementert.' }); // TODO: fix
            default:
                const opprettBehandlingParameters = {
                    behandlingType: behandlingstype,
                    behandlingÅrsak: behandlingsårsak,
                    kategori: behandlingstema.kategori ?? null,
                    saksbehandlerIdent: saksbehandler.navIdent,
                    søkersIdent: fagsak.søkerFødselsnummer,
                    søknadMottattDato: søknadMottattDato,
                };
                return await opprettBehandling(opprettBehandlingParameters);
        }
    };

    return {
        form,
        onSubmit,
    };
}

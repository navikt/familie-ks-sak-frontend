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
import type { IBehandlingstema } from '@typer/behandlingstema';
import { Klagebehandlingstype } from '@typer/klage';
import { Tilbakekrevingsbehandlingstype } from '@typer/tilbakekrevingsbehandling';
import { dateTilIsoDatoString, dateTilIsoDatoStringEllerUndefined } from '@utils/dato';
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
    [OpprettBehandlingFelt.BEHANDLINGSKATEGORI]: IBehandlingstema | undefined;
    [OpprettBehandlingFelt.SØKNAD_MOTTATT_DATO]: Date | null;
    [OpprettBehandlingFelt.KLAGE_MOTTATT_DATO]: Date | null;
}

export interface TransformedOpprettBehandlingFormValues {
    [OpprettBehandlingFelt.BEHANDLINGSTYPE]: Behandlingstype | Tilbakekrevingsbehandlingstype | Klagebehandlingstype;
    [OpprettBehandlingFelt.BEHANDLINGSÅRSAK]: BehandlingÅrsak;
    [OpprettBehandlingFelt.BEHANDLINGSKATEGORI]: IBehandlingstema;
    [OpprettBehandlingFelt.SØKNAD_MOTTATT_DATO]: Date;
    [OpprettBehandlingFelt.KLAGE_MOTTATT_DATO]: Date;
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
            [OpprettBehandlingFelt.BEHANDLINGSKATEGORI]: undefined,
            [OpprettBehandlingFelt.SØKNAD_MOTTATT_DATO]: null,
            [OpprettBehandlingFelt.KLAGE_MOTTATT_DATO]: null,
        },
    });

    const { setError } = form;

    // TODO: håndter dette ved omskriving
    /*
    useEffect(() => {
        if (behandlingstype.verdi === Behandlingstype.FØRSTEGANGSBEHANDLING) {
            behandlingsårsak.validerOgSettFelt(BehandlingÅrsak.SØKNAD);
        } else if (behandlingstype.verdi === Behandlingstype.TEKNISK_ENDRING) {
            behandlingsårsak.validerOgSettFelt(BehandlingÅrsak.TEKNISK_ENDRING);
        }
    }, [behandlingstype.verdi]);
     */

    const { mutate: opprettKlagebehandling } = useOpprettKlagebehandling({
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: HentKlagebehandlingerQueryKeyFactory.klagebehandlinger(fagsak.id),
            });

            lukkModal();
            // settÅpenBehandling(byggSuksessRessurs(behandling));
        },
        onError: error => {
            setError('root', { message: error.message ?? 'Teknisk feil ved oppretting av klagebehandling.' });
        },
    });

    const { mutate: opprettTilbakekreving } = useOpprettTilbakekreving({
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: HentTilbakekrevingsbehandlingerQueryKeyFactory.tilbakekrevingsbehandlinger(fagsak.id),
            });

            lukkModal();
            onTilbakekrevingsbehandlingOpprettet();
            // settÅpenBehandling(byggSuksessRessurs(behandling));
        },
        onError: error => {
            setError('root', { message: error.message ?? 'Teknisk feil ved oppretting av tilbakekreving.' });
        },
    });

    const { mutate: opprettBehandling } = useOpprettBehandling({
        onSuccess: async behandling => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: HentKontantstøttebehandlingerQueryKeyFactory.kontantstøttebehandlinger(fagsak.id),
                }),
                queryClient.invalidateQueries({ queryKey: HentFagsakQueryKeyFactory.fagsak(fagsak.id) }),
            ]);

            lukkModal();
            // settÅpenBehandling(byggSuksessRessurs(behandling));

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
        // TODO: det funker ikke å sende inn formet
        console.log('values i onsubmit', values);
        const { behandlingstype, behandlingsårsak, behandlingstema, søknadMottattDato, klageMottattDato } = values;

        if (behandlingstype === Klagebehandlingstype.KLAGE) {
            opprettKlagebehandling({
                klageMottattDato: dateTilIsoDatoString(klageMottattDato),
                fagsakId: fagsak.id,
            });
        } else if (behandlingstype === Tilbakekrevingsbehandlingstype.TILBAKEKREVING) {
            opprettTilbakekreving({ fagsakId: fagsak.id });
        } else if (behandlingstype === Tilbakekrevingsbehandlingstype.REVURDERING_TILBAKEKREVING) {
            // TODO: hvordan skal denne typen håndteres?
        } else {
            const opprettBehandlingParameters = {
                behandlingType: behandlingstype,
                behandlingÅrsak: behandlingsårsak,
                kategori: behandlingstema.kategori ?? null,
                saksbehandlerIdent: saksbehandler.navIdent,
                søkersIdent: fagsak.søkerFødselsnummer,
                søknadMottattDato: dateTilIsoDatoStringEllerUndefined(søknadMottattDato),
            };
            opprettBehandling(opprettBehandlingParameters);
        }
    };

    return {
        form,
        onSubmit,
    };
}

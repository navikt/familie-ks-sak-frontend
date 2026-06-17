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
import type { IBehandling } from '@typer/behandling';
import { Behandlingstype, BehandlingÅrsak } from '@typer/behandling';
import type { IBehandlingstema } from '@typer/behandlingstema';
import { Klagebehandlingstype } from '@typer/klage';
import { Tilbakekrevingsbehandlingstype } from '@typer/tilbakekrevingsbehandling';
import { dateTilIsoDatoString, dateTilIsoDatoStringEllerUndefined, validerGyldigDato } from '@utils/dato';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';

import type { Avhengigheter, FeltState } from '@navikt/familie-skjema';
import { feil, ok, useFelt, useSkjema } from '@navikt/familie-skjema';
import { byggFunksjonellFeilRessurs, byggHenterRessurs, byggSuksessRessurs } from '@navikt/familie-typer';

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
    [OpprettBehandlingFelt.BEHANDLINGSTEMA]: IBehandlingstema | undefined;
    [OpprettBehandlingFelt.SØKNAD_MOTTATT_DATO]: Date | undefined;
    [OpprettBehandlingFelt.KLAGE_MOTTATT_DATO]: Date | undefined;
}

export interface TransformedOpprettBehandlingFormValues {
    [OpprettBehandlingFelt.BEHANDLINGSTYPE]: Behandlingstype | Tilbakekrevingsbehandlingstype | Klagebehandlingstype;
    [OpprettBehandlingFelt.BEHANDLINGSÅRSAK]: BehandlingÅrsak;
    [OpprettBehandlingFelt.BEHANDLINGSTEMA]: IBehandlingstema;
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
        defaultValues: {},
    });

    const { setError } = form;

    const behandlingstype = useFelt<Behandlingstype | Tilbakekrevingsbehandlingstype | Klagebehandlingstype | ''>({
        verdi: '',
        valideringsfunksjon: felt => {
            return felt.verdi !== ''
                ? ok(felt)
                : feil(felt, 'Velg type behandling som skal opprettes fra nedtrekkslisten');
        },
    });

    const behandlingsårsak = useFelt<BehandlingÅrsak | ''>({
        verdi: '',
        valideringsfunksjon: felt => {
            return felt.verdi !== ''
                ? ok(felt)
                : feil(felt, 'Velg årsak for opprettelse av behandlingen fra nedtrekkslisten');
        },
        skalFeltetVises: (avhengigheter: Avhengigheter) => {
            const behandlingstypeVerdi = avhengigheter.behandlingstype.verdi;
            return behandlingstypeVerdi === Behandlingstype.REVURDERING;
        },
        avhengigheter: { behandlingstype },
    });

    const behandlingstema = useFelt<IBehandlingstema | undefined>({
        verdi: undefined,
        valideringsfunksjon: (felt: FeltState<IBehandlingstema | undefined>) =>
            felt.verdi ? ok(felt) : feil(felt, 'Behandlingstema må settes.'),
        avhengigheter: { behandlingstype, behandlingsårsak },
        skalFeltetVises: avhengigheter => {
            const { verdi: behandlingstypeVerdi } = avhengigheter.behandlingstype;
            const { verdi: behandlingsårsakVerdi } = avhengigheter.behandlingsårsak;
            return behandlingstypeVerdi in Behandlingstype && behandlingsårsakVerdi === BehandlingÅrsak.SØKNAD;
        },
    });

    const søknadMottattDato = useFelt<Date | undefined>({
        verdi: undefined,
        valideringsfunksjon: validerGyldigDato,
        avhengigheter: { behandlingstype, behandlingsårsak },
        skalFeltetVises: avhengigheter => {
            const { verdi: behandlingstypeVerdi } = avhengigheter.behandlingstype;
            const { verdi: behandlingsårsakVerdi } = avhengigheter.behandlingsårsak;
            return (
                behandlingstypeVerdi === Behandlingstype.FØRSTEGANGSBEHANDLING ||
                (behandlingstypeVerdi === Behandlingstype.REVURDERING &&
                    behandlingsårsakVerdi === BehandlingÅrsak.SØKNAD)
            );
        },
    });

    const klageMottattDato = useFelt<Date | undefined>({
        verdi: undefined,
        valideringsfunksjon: validerGyldigDato,

        avhengigheter: { behandlingstype },
        skalFeltetVises: avhengigheter => avhengigheter.behandlingstype.verdi === Klagebehandlingstype.KLAGE,
    });

    const { skjema, nullstillSkjema, kanSendeSkjema, settSubmitRessurs } = useSkjema<
        IOpprettBehandlingSkjemaFelter,
        IBehandling
    >({
        felter: {
            behandlingstype,
            behandlingsårsak,
            behandlingstema,
            søknadMottattDato,
            klageMottattDato,
        },
        skjemanavn: 'Opprett behandling modal',
    });

    useEffect(() => {
        if (behandlingstype.verdi === Behandlingstype.FØRSTEGANGSBEHANDLING) {
            behandlingsårsak.validerOgSettFelt(BehandlingÅrsak.SØKNAD);
        } else if (behandlingstype.verdi === Behandlingstype.TEKNISK_ENDRING) {
            behandlingsårsak.validerOgSettFelt(BehandlingÅrsak.TEKNISK_ENDRING);
        }
    }, [behandlingstype.verdi]);

    const { mutate: opprettKlagebehandling } = useOpprettKlagebehandling({
        onSuccess: async behandling => {
            await queryClient.invalidateQueries({
                queryKey: HentKlagebehandlingerQueryKeyFactory.klagebehandlinger(fagsak.id),
            });

            lukkModal();
            nullstillSkjema();
            settSubmitRessurs(byggSuksessRessurs(behandling));
        },
        onError: error => {
            settSubmitRessurs(byggFunksjonellFeilRessurs(error.message));
        },
    });

    const { mutate: opprettTilbakekreving } = useOpprettTilbakekreving({
        onSuccess: async behandling => {
            await queryClient.invalidateQueries({
                queryKey: HentTilbakekrevingsbehandlingerQueryKeyFactory.tilbakekrevingsbehandlinger(fagsak.id),
            });

            lukkModal();
            nullstillSkjema();
            onTilbakekrevingsbehandlingOpprettet();
            settSubmitRessurs(byggSuksessRessurs(behandling));
        },
        onError: error => {
            settSubmitRessurs(byggFunksjonellFeilRessurs(error.message));
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
            nullstillSkjema();
            settSubmitRessurs(byggSuksessRessurs(behandling));

            if (behandling.årsak === BehandlingÅrsak.SØKNAD) {
                navigate(`/fagsak/${fagsak.id}/${behandling.behandlingId}/registrer-soknad`);
            } else {
                navigate(`/fagsak/${fagsak.id}/${behandling.behandlingId}/vilkaarsvurdering`);
            }
        },
        onError: error => {
            settSubmitRessurs(byggFunksjonellFeilRessurs(error.message));
        },
    });

    const onSubmit = async (values: OpprettBehandlingFormValues) => {
        const { behandlingstype, behandlingsårsak, behandlingstema, søknadMottattDato, klageMottattDato } = values;

        try {
            settSubmitRessurs(byggHenterRessurs());

            if (behandlingstype === Klagebehandlingstype.KLAGE) {
                opprettKlagebehandling({
                    klageMottattDato: dateTilIsoDatoString(klageMottattDato),
                    fagsakId: fagsak.id,
                });
            } else if (behandlingstype === Tilbakekrevingsbehandlingstype.TILBAKEKREVING) {
                opprettTilbakekreving({ fagsakId: fagsak.id });
            } else {
                const opprettBehandlingParameters = {
                    behandlingType: behandlingstype, // TODO: as Behandlingstype?
                    behandlingÅrsak: behandlingsårsak, // TODO: as BehandlingÅrsak?
                    kategori: behandlingstema?.kategori ?? null,
                    saksbehandlerIdent: saksbehandler.navIdent,
                    søkersIdent: fagsak.søkerFødselsnummer,
                    søknadMottattDato: dateTilIsoDatoStringEllerUndefined(søknadMottattDato),
                };
                opprettBehandling(opprettBehandlingParameters);
            }
        } catch (e: unknown) {
            setError('root', {
                message: e instanceof Error ? e.message : 'Teknisk feil ved opprettelse av behandling.', // TODO: ønskelig med melding basert på behandlingstype?
            });
        }
    };

    return {
        form,
        onSubmit,
        opprettBehandlingSkjema: skjema,
        nullstillSkjema,
        settSubmitRessurs,
    };
}

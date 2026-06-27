import { useEffect } from 'react';

import { useFagsakId } from '@hooks/useFagsakId';
import { HentFagsakQueryKeyFactory } from '@hooks/useHentFagsak';
import { HentKlagebehandlingerQueryKeyFactory } from '@hooks/useHentKlagebehandlinger';
import { HentKontantstøttebehandlingerQueryKeyFactory } from '@hooks/useHentKontantstøttebehandlinger';
import { HentTilbakekrevingsbehandlingerQueryKeyFactory } from '@hooks/useHentTilbakekrevingsbehandlinger';
import { useOpprettBehandling } from '@hooks/useOpprettBehandling';
import { useOpprettKlagebehandling } from '@hooks/useOpprettKlagebehandling';
import { useOpprettTilbakekreving } from '@hooks/useOpprettTilbakekreving';
import { useSaksbehandler } from '@hooks/useSaksbehandler';
import { useBrukerContext } from '@sider/Fagsak/BrukerContext';
import { useQueryClient } from '@tanstack/react-query';
import type { IBehandling } from '@typer/behandling';
import { Behandlingstype, BehandlingÅrsak } from '@typer/behandling';
import type { IBehandlingstema } from '@typer/behandlingstema';
import { Klagebehandlingstype } from '@typer/klage';
import { Tilbakekrevingsbehandlingstype } from '@typer/tilbakekrevingsbehandling';
import { dateTilIsoDatoString, dateTilIsoDatoStringEllerUndefined, validerGyldigDato } from '@utils/dato';
import { useNavigate } from 'react-router';

import type { Avhengigheter, FeltState } from '@navikt/familie-skjema';
import { feil, ok, useFelt, useSkjema } from '@navikt/familie-skjema';
import {
    byggFunksjonellFeilRessurs,
    byggHenterRessurs,
    byggSuksessRessurs,
    byggTomRessurs,
} from '@navikt/familie-typer';

interface IOpprettBehandlingSkjemaFelter {
    behandlingstype: Behandlingstype | Tilbakekrevingsbehandlingstype | Klagebehandlingstype | '';
    behandlingsårsak: BehandlingÅrsak | '';
    behandlingstema: IBehandlingstema | undefined;
    søknadMottattDato: Date | undefined;
    klageMottattDato: Date | undefined;
}

interface Props {
    lukkModal: () => void;
    onTilbakekrevingsbehandlingOpprettet: () => void;
}

export function useOpprettBehandlingSkjema({ lukkModal, onTilbakekrevingsbehandlingOpprettet }: Props) {
    const { bruker } = useBrukerContext();

    const fagsakId = useFagsakId();
    const saksbehandler = useSaksbehandler();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

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
                queryKey: HentKlagebehandlingerQueryKeyFactory.klagebehandlinger(fagsakId),
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
                queryKey: HentTilbakekrevingsbehandlingerQueryKeyFactory.tilbakekrevingsbehandlinger(fagsakId),
            });

            lukkModal();
            nullstillSkjemaStatus();
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
                    queryKey: HentKontantstøttebehandlingerQueryKeyFactory.kontantstøttebehandlinger(fagsakId),
                }),
                queryClient.invalidateQueries({ queryKey: HentFagsakQueryKeyFactory.fagsak(fagsakId) }),
            ]);

            lukkModal();
            nullstillSkjema();
            settSubmitRessurs(byggSuksessRessurs(behandling));

            if (behandling.årsak === BehandlingÅrsak.SØKNAD) {
                navigate(`/fagsak/${fagsakId}/${behandling.behandlingId}/registrer-soknad`);
            } else {
                navigate(`/fagsak/${fagsakId}/${behandling.behandlingId}/vilkaarsvurdering`);
            }
        },
        onError: error => {
            settSubmitRessurs(byggFunksjonellFeilRessurs(error.message));
        },
    });

    const onBekreft = (søkersIdent: string) => {
        if (kanSendeSkjema()) {
            settSubmitRessurs(byggHenterRessurs());

            if (behandlingstype.verdi === Klagebehandlingstype.KLAGE) {
                opprettKlagebehandling({
                    klageMottattDato: dateTilIsoDatoString(klageMottattDato.verdi),
                    fagsakId,
                });
            } else if (behandlingstype.verdi === Tilbakekrevingsbehandlingstype.TILBAKEKREVING) {
                opprettTilbakekreving({ fagsakId });
            } else {
                const payload = {
                    kategori: skjema.felter.behandlingstema.verdi?.kategori ?? null,
                    søkersIdent: søkersIdent,
                    behandlingType: behandlingstype.verdi as Behandlingstype,
                    behandlingÅrsak: behandlingsårsak.verdi as BehandlingÅrsak,
                    saksbehandlerIdent: saksbehandler.navIdent,
                    søknadMottattDato: dateTilIsoDatoStringEllerUndefined(skjema.felter.søknadMottattDato.verdi),
                };
                opprettBehandling(payload);
            }
        }
    };

    const nullstillSkjemaStatus = () => {
        settSubmitRessurs(byggTomRessurs());
        nullstillSkjema();
    };

    return {
        onBekreft,
        opprettBehandlingSkjema: skjema,
        nullstillSkjemaStatus,
        bruker,
    };
}

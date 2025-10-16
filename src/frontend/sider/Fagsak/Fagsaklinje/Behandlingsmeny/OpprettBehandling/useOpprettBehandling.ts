import { useEffect } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

import type { Avhengigheter, FeltState } from '@navikt/familie-skjema';
import { feil, ok, useFelt, useSkjema } from '@navikt/familie-skjema';
import { byggTomRessurs, hentDataFraRessurs, RessursStatus } from '@navikt/familie-typer';

import { useAppContext } from '../../../../../context/AppContext';
import { HentFagsakQueryKeyFactory } from '../../../../../hooks/useHentFagsak';
import { HentKlagebehandlingerQueryKeyFactory } from '../../../../../hooks/useHentKlagebehandlinger';
import { HentKontantstøttebehandlingerQueryKeyFactory } from '../../../../../hooks/useHentKontantstøttebehandlinger';
import { HentTilbakekrevingsbehandlingerQueryKeyFactory } from '../../../../../hooks/useHentTilbakekrevingsbehandlinger';
import useSakOgBehandlingParams from '../../../../../hooks/useSakOgBehandlingParams';
import type { IBehandling, IRestNyBehandling } from '../../../../../typer/behandling';
import { Behandlingstype, BehandlingÅrsak } from '../../../../../typer/behandling';
import type { IBehandlingstema } from '../../../../../typer/behandlingstema';
import { Klagebehandlingstype } from '../../../../../typer/klage';
import { Tilbakekrevingsbehandlingstype } from '../../../../../typer/tilbakekrevingsbehandling';
import type { IsoDatoString } from '../../../../../utils/dato';
import { dateTilIsoDatoString, dateTilIsoDatoStringEllerUndefined, validerGyldigDato } from '../../../../../utils/dato';
import { useBehandlingContext } from '../../../Behandling/context/BehandlingContext';
import { useFagsakContext } from '../../../FagsakContext';

interface IOpprettBehandlingSkjemaFelter {
    behandlingstype: Behandlingstype | Tilbakekrevingsbehandlingstype | Klagebehandlingstype | '';
    behandlingsårsak: BehandlingÅrsak | '';
    behandlingstema: IBehandlingstema | undefined;
    søknadMottattDato: Date | undefined;
    klageMottattDato: Date | undefined;
}

const useOpprettBehandling = ({
    lukkModal,
    onOpprettTilbakekrevingSuccess,
}: {
    lukkModal: () => void;
    onOpprettTilbakekrevingSuccess: () => void;
}) => {
    const { fagsakId } = useSakOgBehandlingParams();
    const { settÅpenBehandling } = useBehandlingContext();
    const { fagsak, bruker: brukerRessurs } = useFagsakContext();
    const { innloggetSaksbehandler } = useAppContext();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const bruker = brukerRessurs.status === RessursStatus.SUKSESS ? brukerRessurs.data : undefined;

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

    const { skjema, nullstillSkjema, kanSendeSkjema, onSubmit, settSubmitRessurs } = useSkjema<
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

    const opprettKlagebehandling = () => {
        onSubmit<{ klageMottattDato: IsoDatoString }>(
            {
                method: 'POST',
                url: `/familie-ks-sak/api/fagsaker/${fagsakId}/opprett-klagebehandling`,
                data: { klageMottattDato: dateTilIsoDatoString(klageMottattDato.verdi) },
            },
            response => {
                if (response.status === RessursStatus.SUKSESS) {
                    lukkModal();
                    nullstillSkjema();
                    queryClient.invalidateQueries({
                        queryKey: HentKlagebehandlingerQueryKeyFactory.klagebehandlinger(fagsak.id),
                    });
                }
            }
        );
    };

    const opprettTilbakekreving = () => {
        onSubmit(
            {
                method: 'POST',
                url: `/familie-ks-sak/api/tilbakekreving/manuell`,
                data: { fagsakId: fagsakId },
            },
            response => {
                if (response.status === RessursStatus.SUKSESS) {
                    nullstillSkjemaStatus();
                    onOpprettTilbakekrevingSuccess();
                    queryClient.invalidateQueries({
                        queryKey: HentTilbakekrevingsbehandlingerQueryKeyFactory.tilbakekrevingsbehandlinger(fagsak.id),
                    });
                }
            }
        );
    };

    const opprettKontantstøttebehandling = (søkersIdent: string) => {
        onSubmit<IRestNyBehandling>(
            {
                data: {
                    kategori: skjema.felter.behandlingstema.verdi?.kategori ?? null,
                    søkersIdent: søkersIdent,
                    behandlingType: behandlingstype.verdi as Behandlingstype,
                    behandlingÅrsak: behandlingsårsak.verdi as BehandlingÅrsak,
                    saksbehandlerIdent: innloggetSaksbehandler?.navIdent,
                    søknadMottattDato: dateTilIsoDatoStringEllerUndefined(skjema.felter.søknadMottattDato.verdi),
                },
                method: 'POST',
                url: '/familie-ks-sak/api/behandlinger',
            },
            response => {
                if (response.status === RessursStatus.SUKSESS) {
                    lukkModal();
                    nullstillSkjema();

                    queryClient.invalidateQueries({
                        queryKey: HentKontantstøttebehandlingerQueryKeyFactory.kontantstøttebehandlinger(fagsak.id),
                    });

                    queryClient.invalidateQueries({
                        queryKey: HentFagsakQueryKeyFactory.fagsak(fagsak.id),
                    });

                    settÅpenBehandling(response);
                    const behandling: IBehandling | undefined = hentDataFraRessurs(response);

                    if (behandling && behandling.årsak === BehandlingÅrsak.SØKNAD) {
                        navigate(`/fagsak/${fagsakId}/${behandling?.behandlingId}/registrer-soknad`);
                    } else {
                        navigate(`/fagsak/${fagsakId}/${behandling?.behandlingId}/vilkaarsvurdering`);
                    }
                }
            }
        );
    };

    const onBekreft = (søkersIdent: string) => {
        if (kanSendeSkjema()) {
            if (behandlingstype.verdi === Klagebehandlingstype.KLAGE) {
                opprettKlagebehandling();
            } else if (behandlingstype.verdi === Tilbakekrevingsbehandlingstype.TILBAKEKREVING) {
                opprettTilbakekreving();
            } else {
                opprettKontantstøttebehandling(søkersIdent);
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
};

export default useOpprettBehandling;

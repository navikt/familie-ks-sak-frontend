import { useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

import {
    type Avhengigheter,
    feil,
    type FeltState,
    ok,
    useFelt,
    useSkjema,
} from '@navikt/familie-skjema';
import { byggTomRessurs, hentDataFraRessurs, RessursStatus } from '@navikt/familie-typer';

import { useApp } from '../../../../../context/AppContext';
import { useBehandling } from '../../../../../context/behandlingContext/BehandlingContext';
import { useFagsakRessurser } from '../../../../../context/FagsakContext';
import useSakOgBehandlingParams from '../../../../../hooks/useSakOgBehandlingParams';
import type { IBehandling, IRestNyBehandling } from '../../../../../typer/behandling';
import { BehandlingSteg, Behandlingstype, BehandlingÅrsak } from '../../../../../typer/behandling';
import type { IBehandlingstema } from '../../../../../typer/behandlingstema';
import type { FagsakType } from '../../../../../typer/fagsak';
import { Tilbakekrevingsbehandlingstype } from '../../../../../typer/tilbakekrevingsbehandling';
import type { FamilieIsoDate } from '../../../../../utils/kalender';
import { erIsoStringGyldig } from '../../../../../utils/kalender';

const useOpprettBehandling = ({
    lukkModal,
    onOpprettTilbakekrevingSuccess,
}: {
    lukkModal: () => void;
    onOpprettTilbakekrevingSuccess: () => void;
}) => {
    const { fagsakId } = useSakOgBehandlingParams();
    const { settÅpenBehandling } = useBehandling();
    const { bruker: brukerRessurs } = useFagsakRessurser();
    const { innloggetSaksbehandler } = useApp();
    const navigate = useNavigate();

    const bruker = brukerRessurs.status === RessursStatus.SUKSESS ? brukerRessurs.data : undefined;

    const behandlingstype = useFelt<Behandlingstype | Tilbakekrevingsbehandlingstype | ''>({
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
            return (
                behandlingstypeVerdi in Behandlingstype &&
                behandlingsårsakVerdi === BehandlingÅrsak.SØKNAD
            );
        },
    });

    const søknadMottattDato = useFelt<FamilieIsoDate | undefined>({
        verdi: undefined,
        valideringsfunksjon: (felt: FeltState<FamilieIsoDate | undefined>) =>
            felt.verdi && erIsoStringGyldig(felt.verdi)
                ? ok(felt)
                : feil(
                      felt,
                      'Mottatt dato for søknaden må registreres ved manuell opprettelse av behandling'
                  ),
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

    const { skjema, nullstillSkjema, kanSendeSkjema, onSubmit, settSubmitRessurs } = useSkjema<
        {
            behandlingstype: Behandlingstype | Tilbakekrevingsbehandlingstype | '';
            behandlingsårsak: BehandlingÅrsak | '';
            behandlingstema: IBehandlingstema | undefined;
            søknadMottattDato: FamilieIsoDate | undefined;
        },
        IBehandling
    >({
        felter: {
            behandlingstype,
            behandlingsårsak,
            behandlingstema,
            søknadMottattDato,
        },
        skjemanavn: 'Opprett behandling modal',
    });

    useEffect(() => {
        switch (skjema.felter.behandlingstype.verdi) {
            case Behandlingstype.FØRSTEGANGSBEHANDLING:
                skjema.felter.behandlingsårsak.validerOgSettFelt(BehandlingÅrsak.SØKNAD);
                break;
        }
    }, [skjema.felter.behandlingstype.verdi]);

    const onBekreft = (søkersIdent: string, fagsakType: FagsakType) => {
        const { behandlingstype, behandlingsårsak } = skjema.felter;
        if (kanSendeSkjema()) {
            if (
                skjema.felter.behandlingstype.verdi ===
                Tilbakekrevingsbehandlingstype.TILBAKEKREVING
            ) {
                onSubmit(
                    {
                        method: 'GET',
                        url: `/familie-ks-sak/api/fagsaker/${fagsakId}/opprett-tilbakekreving`,
                    },
                    response => {
                        if (response.status === RessursStatus.SUKSESS) {
                            nullstillSkjemaStatus();
                            onOpprettTilbakekrevingSuccess();
                        }
                    }
                );
            } else {
                onSubmit<IRestNyBehandling>(
                    {
                        data: {
                            kategori: skjema.felter.behandlingstema.verdi?.kategori ?? null,
                            underkategori:
                                skjema.felter.behandlingstema.verdi?.underkategori ?? null,
                            søkersIdent,
                            behandlingType: behandlingstype.verdi as Behandlingstype,
                            behandlingÅrsak: behandlingsårsak.verdi as BehandlingÅrsak,
                            navIdent: innloggetSaksbehandler?.navIdent,
                            søknadMottattDato: skjema.felter.søknadMottattDato.verdi ?? undefined,
                            fagsakType: fagsakType,
                        },
                        method: 'POST',
                        url: '/familie-ks-sak/api/behandlinger',
                    },
                    response => {
                        if (response.status === RessursStatus.SUKSESS) {
                            lukkModal();
                            nullstillSkjema();

                            settÅpenBehandling(response);
                            const behandling: IBehandling | undefined =
                                hentDataFraRessurs(response);

                            if (behandling && behandling.årsak === BehandlingÅrsak.SØKNAD) {
                                navigate(
                                    behandling.steg ===
                                        BehandlingSteg.REGISTRERE_INSTITUSJON_OG_VERGE
                                        ? `/fagsak/${fagsakId}/${behandling?.behandlingId}/registrer-mottaker`
                                        : `/fagsak/${fagsakId}/${behandling?.behandlingId}/registrer-soknad`
                                );
                            } else {
                                navigate(
                                    `/fagsak/${fagsakId}/${behandling?.behandlingId}/vilkaarsvurdering`
                                );
                            }
                        }
                    }
                );
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

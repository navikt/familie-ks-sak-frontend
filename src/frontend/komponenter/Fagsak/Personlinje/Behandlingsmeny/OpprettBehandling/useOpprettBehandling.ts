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
import { useFagsakContext } from '../../../../../context/FagsakContext';
import useSakOgBehandlingParams from '../../../../../hooks/useSakOgBehandlingParams';
import type { IBehandling, IRestNyBehandling } from '../../../../../typer/behandling';
import { BehandlingSteg, Behandlingstype, BehandlingÅrsak } from '../../../../../typer/behandling';
import type { IBehandlingstema } from '../../../../../typer/behandlingstema';
import { Tilbakekrevingsbehandlingstype } from '../../../../../typer/tilbakekrevingsbehandling';
import type { FamilieIsoDate } from '../../../../../utils/kalender';
import { erIsoStringGyldig } from '../../../../../utils/kalender';

export interface IOpprettBehandlingSkjemaFelter {
    behandlingstype: Behandlingstype | Tilbakekrevingsbehandlingstype | '';
    behandlingsårsak: BehandlingÅrsak | '';
    behandlingstema: IBehandlingstema | undefined;
    søknadMottattDato: FamilieIsoDate;
    kravMotattDato: FamilieIsoDate;
}

const useOpprettBehandling = ({
    lukkModal,
    onOpprettTilbakekrevingSuccess,
}: {
    lukkModal: () => void;
    onOpprettTilbakekrevingSuccess: () => void;
}) => {
    const { fagsakId } = useSakOgBehandlingParams();
    const { settÅpenBehandling } = useBehandling();
    const { bruker: brukerRessurs } = useFagsakContext();
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

    const søknadMottattDato = useFelt<FamilieIsoDate>({
        verdi: '',
        valideringsfunksjon: (felt: FeltState<FamilieIsoDate>) => {
            const erGyldigIsoString = felt.verdi && erIsoStringGyldig(felt.verdi);
            const erIFremtiden = felt.verdi && erDatoFremITid(felt.verdi);

            if (!erGyldigIsoString) {
                return feil(
                    felt,
                    'Mottatt dato for søknaden må registreres ved manuell opprettelse av behandling'
                );
            }

            if (erIFremtiden) {
                return feil(felt, 'Du kan ikke sette en mottatt dato som er frem i tid.');
            }

            return ok(felt);
        },

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

    const kravMotattDato = useFelt<FamilieIsoDate>({
        verdi: '',
        valideringsfunksjon: (felt: FeltState<FamilieIsoDate>) => {
            const erGyldigIsoString = erIsoStringGyldig(felt.verdi);
            const erIFremtiden = erDatoFremITid(felt.verdi);

            if (!erGyldigIsoString) {
                return feil(
                    felt,
                    'Mottatt dato for klagen må registreres ved manuell opprettelse av klagebehandling'
                );
            }

            if (erIFremtiden) {
                return feil(felt, 'Du kan ikke sette en mottatt dato som er frem i tid.');
            }

            return ok(felt);
        },

        avhengigheter: { behandlingstype },
        skalFeltetVises: avhengigheter =>
            avhengigheter.behandlingstype.verdi === Behandlingstype.KLAGE,
    });

    const erDatoFremITid = (dato: FamilieIsoDate): boolean => {
        return Date.parse(dato.toString()) > new Date().getTime();
    };

    const { skjema, nullstillSkjema, kanSendeSkjema, onSubmit, settSubmitRessurs } = useSkjema<
        IOpprettBehandlingSkjemaFelter,
        IBehandling
    >({
        felter: {
            behandlingstype,
            behandlingsårsak,
            behandlingstema,
            søknadMottattDato,
            kravMotattDato,
        },
        skjemanavn: 'Opprett behandling modal',
    });

    useEffect(() => {
        if (behandlingstype.verdi === Behandlingstype.FØRSTEGANGSBEHANDLING) {
            behandlingsårsak.validerOgSettFelt(BehandlingÅrsak.SØKNAD);
        }
    }, [behandlingstype.verdi]);

    const opprettKlagebehandling = () => {
        onSubmit<{ kravMotattDato: FamilieIsoDate }>(
            {
                method: 'POST',
                url: `/familie-ks-sak/api/fagsaker/${fagsakId}/opprett-klage`,
                data: { kravMotattDato: kravMotattDato.verdi },
            },
            response => {
                if (response.status === RessursStatus.SUKSESS) {
                    lukkModal();
                    nullstillSkjema();
                }
            }
        );
    };

    function opprettTilbakekreving() {
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
    }

    const opprettKontantstøttebehandling = (søkersIdent: string) => {
        onSubmit<IRestNyBehandling>(
            {
                data: {
                    kategori: skjema.felter.behandlingstema.verdi?.kategori ?? null,
                    søkersIdent,
                    behandlingType: behandlingstype.verdi as Behandlingstype,
                    behandlingÅrsak: behandlingsårsak.verdi as BehandlingÅrsak,
                    navIdent: innloggetSaksbehandler?.navIdent,
                    søknadMottattDato: skjema.felter.søknadMottattDato.verdi ?? undefined,
                },
                method: 'POST',
                url: '/familie-ks-sak/api/behandlinger',
            },
            response => {
                if (response.status === RessursStatus.SUKSESS) {
                    lukkModal();
                    nullstillSkjema();

                    settÅpenBehandling(response);
                    const behandling: IBehandling | undefined = hentDataFraRessurs(response);

                    if (behandling && behandling.årsak === BehandlingÅrsak.SØKNAD) {
                        navigate(
                            behandling.steg === BehandlingSteg.REGISTRERE_INSTITUSJON_OG_VERGE
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
    };

    const onBekreft = (søkersIdent: string) => {
        if (kanSendeSkjema()) {
            if (behandlingstype.verdi === Behandlingstype.KLAGE) {
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

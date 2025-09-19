import { useState } from 'react';

import { useNavigate } from 'react-router';

import { useHttp } from '@navikt/familie-http';
import { byggFeiletRessurs, byggHenterRessurs, byggTomRessurs, RessursStatus } from '@navikt/familie-typer';
import type { Ressurs } from '@navikt/familie-typer';

import { useAppContext } from '../../../../context/AppContext';
import useSakOgBehandlingParams from '../../../../hooks/useSakOgBehandlingParams';
import { BehandlingResultat, BehandlingÅrsak, type IBehandling } from '../../../../typer/behandling';
import { defaultFunksjonellFeil } from '../../../../typer/feilmeldinger';

const useBehandlingssteg = (
    oppdaterBehandling: (behandling: Ressurs<IBehandling>) => void,
    behandling?: IBehandling
) => {
    const { request } = useHttp();
    const { innloggetSaksbehandler } = useAppContext();
    const { fagsakId, behandlingId } = useSakOgBehandlingParams();
    const navigate = useNavigate();

    const [submitRessurs, settSubmitRessurs] = useState<Ressurs<IBehandling>>(byggTomRessurs());

    const vilkårsvurderingNesteOnClick = () => {
        settSubmitRessurs(byggHenterRessurs());

        request<void, IBehandling>({
            method: 'POST',
            url: `/familie-ks-sak/api/behandlinger/${behandlingId}/steg/vilkårsvurdering`,
        })
            .then((response: Ressurs<IBehandling>) => {
                settSubmitRessurs(response);
                if (response.status === RessursStatus.SUKSESS) {
                    const behandling = response.data;
                    oppdaterBehandling(response);

                    navigate(`/fagsak/${fagsakId}/${behandling.behandlingId}/tilkjent-ytelse`);
                }
            })
            .catch(() => {
                settSubmitRessurs(byggFeiletRessurs(defaultFunksjonellFeil));
            });
    };

    const behandlingresultatNesteOnClick = () => {
        settSubmitRessurs(byggHenterRessurs());

        request<void, IBehandling>({
            method: 'POST',
            url: `/familie-ks-sak/api/behandlinger/${behandlingId}/steg/behandlingsresultat`,
        })
            .then((response: Ressurs<IBehandling>) => {
                settSubmitRessurs(response);

                if (response.status === RessursStatus.SUKSESS) {
                    const behandling = response.data;
                    oppdaterBehandling(response);

                    if (behandling.resultat !== BehandlingResultat.AVSLÅTT) {
                        navigate(`/fagsak/${fagsakId}/${behandlingId}/simulering`);
                    } else {
                        navigate(`/fagsak/${fagsakId}/${behandlingId}/vedtak`);
                    }
                }
            })
            .catch(() => {
                settSubmitRessurs(byggFeiletRessurs(defaultFunksjonellFeil));
            });
    };

    const minstEnPeriodeharBegrunnelseEllerFritekst = (): boolean => {
        const vedtaksperioderMedBegrunnelser = behandling?.vedtak?.vedtaksperioderMedBegrunnelser ?? [];
        return vedtaksperioderMedBegrunnelser.some(
            vedtaksperioderMedBegrunnelse =>
                vedtaksperioderMedBegrunnelse.begrunnelser.length !== 0 ||
                vedtaksperioderMedBegrunnelse.eøsBegrunnelser.length !== 0 ||
                vedtaksperioderMedBegrunnelse.fritekster.length !== 0
        );
    };

    const kanForeslåVedtak = () =>
        minstEnPeriodeharBegrunnelseEllerFritekst() ||
        behandling?.årsak === BehandlingÅrsak.TEKNISK_ENDRING ||
        behandling?.årsak === BehandlingÅrsak.KORREKSJON_VEDTAKSBREV ||
        behandling?.årsak === BehandlingÅrsak.IVERKSETTE_KA_VEDTAK ||
        behandling?.årsak === BehandlingÅrsak.DØDSFALL;

    const foreslåVedtakNesteOnClick = (
        settVisModal: (visModal: boolean) => void,
        erUlagretNyFeilutbetaltValuta: boolean,
        erUlagretNyRefusjonEøsPeriode: boolean,
        erSammensattKontrollsak: boolean
    ) => {
        if (erUlagretNyFeilutbetaltValuta) {
            return settSubmitRessurs(
                byggFeiletRessurs(
                    'Det er lagt til en ny periode med feilutbetalt valuta. Fyll ut periode og beløp, eller fjern perioden.'
                )
            );
        }
        if (erUlagretNyRefusjonEøsPeriode) {
            return settSubmitRessurs(
                byggFeiletRessurs(
                    'Det er lagt til en ny periode med refusjon EØS. Fyll ut periode og refusjonsbeløp, eller fjern perioden.'
                )
            );
        }
        if (!kanForeslåVedtak() && !erSammensattKontrollsak) {
            return settSubmitRessurs(
                byggFeiletRessurs('Vedtaksbrevet mangler begrunnelse. Du må legge til minst én begrunnelse.')
            );
        }

        request<void, IBehandling>({
            method: 'POST',
            url: `/familie-ks-sak/api/behandlinger/${behandling?.behandlingId}/steg/foreslå-vedtak?behandlendeEnhet=${
                innloggetSaksbehandler?.enhet ?? '9999'
            }`,
            påvirkerSystemLaster: true,
        }).then((response: Ressurs<IBehandling>) => {
            if (response.status === RessursStatus.SUKSESS) {
                settVisModal(true);
                oppdaterBehandling(response);
            } else {
                settSubmitRessurs(byggFeiletRessurs(defaultFunksjonellFeil));
            }
        });
    };

    return {
        submitRessurs,
        vilkårsvurderingNesteOnClick,
        behandlingresultatNesteOnClick,
        foreslåVedtakNesteOnClick: foreslåVedtakNesteOnClick,
        settSubmitRessurs,
    };
};

export default useBehandlingssteg;

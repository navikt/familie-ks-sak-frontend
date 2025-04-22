import React, { createContext, useContext, useEffect, useState } from 'react';

import { isAfter } from 'date-fns';

import { useHttp, type FamilieRequestConfig } from '@navikt/familie-http';
import { feil, ok, useFelt, useSkjema } from '@navikt/familie-skjema';
import type { Avhengigheter, FeiloppsummeringFeil, ISkjema } from '@navikt/familie-skjema';
import { RessursStatus } from '@navikt/familie-typer';
import type { Ressurs } from '@navikt/familie-typer';

import useSakOgBehandlingParams from '../../../../../hooks/useSakOgBehandlingParams';
import type { IBehandling } from '../../../../../typer/behandling';
import {
    Tilbakekrevingsvalg,
    type ISimuleringDTO,
    type ISimuleringPeriode,
    type ITilbakekreving,
} from '../../../../../typer/simulering';
import { isoStringTilDateMedFallback, tidenesMorgen } from '../../../../../utils/dato';

interface IProps extends React.PropsWithChildren {
    åpenBehandling: IBehandling;
}

interface ITilbakekrevingsskjema {
    tilbakekrevingsvalg: Tilbakekrevingsvalg | undefined;
    fritekstVarsel: string;
    begrunnelse: string;
}

interface ISimuleringContext {
    simuleringsresultat: Ressurs<ISimuleringDTO>;
    tilbakekrevingSkjema: ISkjema<ITilbakekrevingsskjema, IBehandling>;
    onSubmit: <SkjemaData>(
        requestConfig: FamilieRequestConfig<SkjemaData>,
        onSuccess: (ressurs: Ressurs<IBehandling>) => void,
        onError?: (ressurs: Ressurs<IBehandling>) => void
    ) => void;
    hentFeilTilOppsummering: () => FeiloppsummeringFeil[];
    erFeilutbetaling: boolean | undefined;
    hentSkjemadata: () => ITilbakekreving | undefined;
    maksLengdeTekst: number;
    harÅpenTilbakekrevingRessurs: Ressurs<boolean>;
}

const SimuleringContext = createContext<ISimuleringContext | undefined>(undefined);

export const SimuleringProvider = ({ åpenBehandling, children }: IProps) => {
    const { request } = useHttp();
    const { fagsakId } = useSakOgBehandlingParams();
    const vedtak = åpenBehandling.vedtak;
    const [simuleringsresultat, settSimuleringresultat] = useState<Ressurs<ISimuleringDTO>>({
        status: RessursStatus.HENTER,
    });
    const [harÅpenTilbakekrevingRessurs, settHarÅpentTilbakekrevingRessurs] = useState<
        Ressurs<boolean>
    >({
        status: RessursStatus.HENTER,
    });
    const maksLengdeTekst = 1500;

    useEffect(() => {
        request<IBehandling, ISimuleringDTO>({
            method: 'GET',
            url: `/familie-ks-sak/api/behandlinger/${åpenBehandling.behandlingId}/simulering`,
            påvirkerSystemLaster: true,
        }).then(response =>
            response.status === RessursStatus.SUKSESS
                ? settSimuleringresultat({
                      ...response,
                      data: {
                          ...response.data,
                          perioder: response.data.perioder.map(periode =>
                              settPeriodeTilIkkeUtbetaltOmForfallsdatoIkkePassert(
                                  periode,
                                  response.data.tidSimuleringHentet
                              )
                          ),
                      },
                  })
                : settSimuleringresultat(response)
        );
    }, [åpenBehandling]);

    useEffect(() => {
        if (erFeilutbetaling) {
            request<undefined, boolean>({
                method: 'GET',
                url: `/familie-ks-sak/api/fagsaker/${fagsakId}/har-åpen-tilbakekrevingsbehandling`,
                påvirkerSystemLaster: true,
            }).then(response => {
                settHarÅpentTilbakekrevingRessurs(response);
            });
        }
    }, [fagsakId, simuleringsresultat]);

    const harÅpenTilbakekreving: boolean =
        harÅpenTilbakekrevingRessurs.status === RessursStatus.SUKSESS &&
        harÅpenTilbakekrevingRessurs.data;

    const simResultat =
        simuleringsresultat.status === RessursStatus.SUKSESS ? simuleringsresultat.data : undefined;
    const erFeilutbetaling = simResultat && simResultat.feilutbetaling > 0;

    const tilbakekrevingsvalg = useFelt<Tilbakekrevingsvalg | undefined>({
        verdi: åpenBehandling.tilbakekreving?.valg,
        avhengigheter: {
            erFeilutbetaling,
            harÅpenTilbakekreving,
        },
        skalFeltetVises: avhengigheter =>
            avhengigheter?.erFeilutbetaling && !avhengigheter?.harÅpenTilbakekreving,
        valideringsfunksjon: felt =>
            felt.verdi === undefined
                ? feil(
                      felt,
                      'Resultatet medfører en feilutbetaling. Du må velge om det skal opprettes tilbakekrevingsbehandling.'
                  )
                : ok(felt),
    });
    const fritekstVarsel = useFelt<string>({
        verdi: åpenBehandling.tilbakekreving?.varsel ?? '',
        avhengigheter: {
            tilbakekreving: tilbakekrevingsvalg,
            erFeilutbetaling,
            maksLengdeTekst,
        },
        valideringsfunksjon: (felt, avhengigheter) =>
            avhengigheter?.erFeilutbetaling &&
            avhengigheter?.tilbakekreving?.verdi ===
                Tilbakekrevingsvalg.OPPRETT_TILBAKEKREVING_MED_VARSEL &&
            felt.verdi === ''
                ? feil(felt, 'Du må skrive en fritekst for varselet til tilbakekrevingen.')
                : avhengigheter && felt.verdi.length > avhengigheter.maksLengdeTekst
                  ? feil(
                        felt,
                        `Du har nådd maks antall tegn i varselbrevet: 1 500. Prøv å forkorte/forenkle teksten.`
                    )
                  : ok(felt),
        skalFeltetVises: (avhengigheter: Avhengigheter) =>
            avhengigheter?.erFeilutbetaling &&
            avhengigheter?.tilbakekreving?.verdi ===
                Tilbakekrevingsvalg.OPPRETT_TILBAKEKREVING_MED_VARSEL,
    });
    const begrunnelse = useFelt<string>({
        verdi: åpenBehandling.tilbakekreving?.begrunnelse ?? '',
        avhengigheter: {
            erFeilutbetaling,
            maksLengdeTekst: maksLengdeTekst,
            harÅpenTilbakekreving,
        },
        skalFeltetVises: avhengigheter =>
            avhengigheter?.erFeilutbetaling && !avhengigheter?.harÅpenTilbakekreving,
        valideringsfunksjon: (felt, avhengigheter) =>
            felt.verdi === ''
                ? feil(felt, 'Du må skrive en begrunnelse for valget om tilbakekreving.')
                : avhengigheter && felt.verdi.length > avhengigheter.maksLengdeTekst
                  ? feil(
                        felt,
                        `Du har nådd maks antall tegn i begrunnelsen: 1 500. Prøv å forkorte/forenkle teksten.`
                    )
                  : ok(felt),
    });

    const {
        skjema: tilbakekrevingSkjema,
        hentFeilTilOppsummering,
        onSubmit,
    } = useSkjema<ITilbakekrevingsskjema, IBehandling>({
        felter: { tilbakekrevingsvalg, fritekstVarsel, begrunnelse },
        skjemanavn: 'Opprett tilbakekreving',
    });

    const hentSkjemadata = (): ITilbakekreving | undefined => {
        return tilbakekrevingSkjema.felter.tilbakekrevingsvalg.verdi && vedtak
            ? {
                  vedtakId: vedtak?.id,
                  valg: tilbakekrevingSkjema.felter.tilbakekrevingsvalg.verdi,
                  begrunnelse: tilbakekrevingSkjema.felter.begrunnelse.verdi,
                  varsel: tilbakekrevingSkjema.felter.fritekstVarsel.erSynlig
                      ? tilbakekrevingSkjema.felter.fritekstVarsel.verdi
                      : undefined,
              }
            : undefined;
    };

    function settPeriodeTilIkkeUtbetaltOmForfallsdatoIkkePassert(
        periode: ISimuleringPeriode,
        tidSimuleringHentet: string | undefined
    ): ISimuleringPeriode {
        if (
            periode.resultat === 0 &&
            isAfter(
                isoStringTilDateMedFallback({
                    isoString: periode.forfallsdato,
                    fallbackDate: tidenesMorgen,
                }),
                isoStringTilDateMedFallback({
                    isoString: tidSimuleringHentet,
                    fallbackDate: tidenesMorgen,
                })
            )
        ) {
            return {
                ...periode,
                tidligereUtbetalt: 0,
                resultat: periode.nyttBeløp,
            };
        }
        return periode;
    }

    return (
        <SimuleringContext.Provider
            value={{
                simuleringsresultat,
                tilbakekrevingSkjema,
                onSubmit,
                hentFeilTilOppsummering,
                erFeilutbetaling,
                hentSkjemadata,
                maksLengdeTekst,
                harÅpenTilbakekrevingRessurs,
            }}
        >
            {children}
        </SimuleringContext.Provider>
    );
};

export const useSimuleringContext = () => {
    const context = useContext(SimuleringContext);

    if (context === undefined) {
        throw new Error('useSimuleringContext må brukes innenfor en SimuleringProvider');
    }

    return context;
};

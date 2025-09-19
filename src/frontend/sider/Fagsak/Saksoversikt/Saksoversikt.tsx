import React from 'react';

import { addMonths, differenceInMilliseconds, startOfMonth } from 'date-fns';
import { Link as ReactRouterLink } from 'react-router';

import { Alert, Box, Heading, Link, VStack } from '@navikt/ds-react';
import { byggTomRessurs } from '@navikt/familie-typer';

import Behandlinger from './Behandlinger';
import BehandlingerOld from './BehandlingerOld';
import FagsakLenkepanel, { SaksoversiktPanelBredde } from './FagsakLenkepanel';
import Utbetalinger from './Utbetalinger';
import type { VisningBehandling } from './visningBehandling';
import { useAppContext } from '../../../context/AppContext';
import type { IBehandling } from '../../../typer/behandling';
import { BehandlingStatus, erBehandlingHenlagt } from '../../../typer/behandling';
import { behandlingKategori, BehandlingKategori } from '../../../typer/behandlingstema';
import type { IMinimalFagsak } from '../../../typer/fagsak';
import { FagsakStatus } from '../../../typer/fagsak';
import { ToggleNavn } from '../../../typer/toggles';
import { Vedtaksperiodetype } from '../../../typer/vedtaksperiode';
import {
    dateTilFormatertString,
    Datoformat,
    hentDagensDato,
    isoStringTilDate,
    periodeOverlapperMedValgtDato,
} from '../../../utils/dato';
import { hentAktivBehandlingPåMinimalFagsak } from '../../../utils/fagsak';
import { useBehandlingContext } from '../Behandling/context/BehandlingContext';

interface IProps {
    minimalFagsak: IMinimalFagsak;
}

export function Saksoversikt({ minimalFagsak }: IProps) {
    const { settÅpenBehandling } = useBehandlingContext();
    const { toggles } = useAppContext();

    React.useEffect(() => {
        settÅpenBehandling(byggTomRessurs(), false);
    }, [minimalFagsak.status]);

    const iverksatteBehandlinger = minimalFagsak.behandlinger.filter(
        (behandling: VisningBehandling) =>
            behandling.status === BehandlingStatus.AVSLUTTET && !erBehandlingHenlagt(behandling.resultat)
    );

    let gjeldendeBehandling =
        iverksatteBehandlinger.length > 0
            ? iverksatteBehandlinger.sort((a, b) =>
                  differenceInMilliseconds(
                      isoStringTilDate(b.opprettetTidspunkt),
                      isoStringTilDate(a.opprettetTidspunkt)
                  )
              )[0]
            : undefined;

    const aktivBehandling = hentAktivBehandlingPåMinimalFagsak(minimalFagsak);

    if (!gjeldendeBehandling) {
        gjeldendeBehandling = aktivBehandling;
    }

    const gjeldendeUtbetalingsperioder = minimalFagsak.gjeldendeUtbetalingsperioder;
    const utbetalingsperiodeInneværendeMåned = gjeldendeUtbetalingsperioder.find(periode =>
        periodeOverlapperMedValgtDato(periode.periodeFom, periode.periodeTom, new Date())
    );

    const nesteMåned = startOfMonth(addMonths(hentDagensDato(), 1));
    const utbetalingsperiodeNesteMåned = gjeldendeUtbetalingsperioder.find(periode =>
        periodeOverlapperMedValgtDato(periode.periodeFom, periode.periodeTom, nesteMåned)
    );

    const lenkeTilBehandlingsresultat = () => {
        return aktivBehandling ? (
            <Link
                as={ReactRouterLink}
                to={`/fagsak/${minimalFagsak.id}/${aktivBehandling.behandlingId}/tilkjent-ytelse`}
            >
                Se detaljer
            </Link>
        ) : null;
    };

    const løpendeMånedligUtbetaling = () => {
        if (
            utbetalingsperiodeInneværendeMåned &&
            utbetalingsperiodeInneværendeMåned.vedtaksperiodetype === Vedtaksperiodetype.UTBETALING
        ) {
            return utbetalingsperiodeInneværendeMåned.utbetaltPerMnd < 1 &&
                gjeldendeBehandling?.kategori === BehandlingKategori.EØS ? (
                <Box width={SaksoversiktPanelBredde}>
                    <Alert variant="info">
                        Siste gjeldende vedtak er en EØS-sak uten månedlige utbetalinger fra Nav
                    </Alert>
                </Box>
            ) : (
                <>
                    {utbetalingsperiodeNesteMåned &&
                        utbetalingsperiodeNesteMåned !== utbetalingsperiodeInneværendeMåned && (
                            <Box width={SaksoversiktPanelBredde}>
                                <Alert variant="info">
                                    <VStack>
                                        {`Utbetalingen endres fra og med ${dateTilFormatertString({
                                            date: nesteMåned,
                                            tilFormat: Datoformat.MÅNED_ÅR_NAVN,
                                        })}`}
                                        {lenkeTilBehandlingsresultat()}
                                    </VStack>
                                </Alert>
                            </Box>
                        )}
                    <Utbetalinger vedtaksperiode={utbetalingsperiodeInneværendeMåned} />
                </>
            );
        } else if (utbetalingsperiodeNesteMåned) {
            return (
                <Box width={SaksoversiktPanelBredde}>
                    <Alert variant="info">
                        <VStack>
                            {`Utbetalingen starter ${dateTilFormatertString({
                                date: nesteMåned,
                                tilFormat: Datoformat.MÅNED_ÅR_NAVN,
                            })}`}
                            {lenkeTilBehandlingsresultat()}
                        </VStack>
                    </Alert>
                </Box>
            );
        } else {
            return (
                <Box width={SaksoversiktPanelBredde}>
                    <Alert variant="error">
                        Noe gikk galt ved henting av utbetalinger. Prøv igjen eller kontakt brukerstøtte hvis problemet
                        vedvarer.
                    </Alert>
                </Box>
            );
        }
    };

    return (
        <Box maxWidth="70rem" margin="16">
            <Heading size={'large'} level={'1'} spacing>
                Saksoversikt
            </Heading>
            <VStack gap="14">
                <FagsakLenkepanel minimalFagsak={minimalFagsak} />
                {minimalFagsak.status === FagsakStatus.LØPENDE && (
                    <div>
                        <Heading size={'medium'} level={'2'} spacing>
                            Løpende månedlig utbetaling
                        </Heading>
                        {løpendeMånedligUtbetaling()}
                    </div>
                )}
                {toggles[ToggleNavn.brukReactQueryPaaSaksoversiktsiden] ? (
                    <Behandlinger fagsakId={minimalFagsak.id} />
                ) : (
                    <BehandlingerOld minimalFagsak={minimalFagsak} />
                )}
            </VStack>
        </Box>
    );
}

export const sakstype = (behandling?: IBehandling) => {
    if (!behandling) {
        return 'Ikke satt';
    }

    return `${behandling?.kategori ? behandlingKategori[behandling?.kategori] : behandling?.kategori}`;
};

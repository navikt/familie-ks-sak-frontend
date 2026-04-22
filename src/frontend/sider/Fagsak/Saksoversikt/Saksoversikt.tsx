import { addMonths, differenceInMilliseconds, startOfMonth } from 'date-fns';
import { Link as ReactRouterLink } from 'react-router';

import { InformationSquareIcon } from '@navikt/aksel-icons';
import { Box, Heading, InfoCard, Link, LocalAlert, VStack } from '@navikt/ds-react';

import { Behandlinger } from './Behandlinger';
import { FagsakLenkepanel, SaksoversiktPanelBredde } from './FagsakLenkepanel';
import Utbetalinger from './Utbetalinger';
import type { VisningBehandling } from './visningBehandling';
import { BehandlingStatus, erBehandlingHenlagt } from '../../../typer/behandling';
import { BehandlingKategori } from '../../../typer/behandlingstema';
import { FagsakStatus } from '../../../typer/fagsak';
import { Vedtaksperiodetype } from '../../../typer/vedtaksperiode';
import {
    dateTilFormatertString,
    Datoformat,
    hentDagensDato,
    isoStringTilDate,
    periodeOverlapperMedValgtDato,
} from '../../../utils/dato';
import { hentAktivBehandlingPåMinimalFagsak } from '../../../utils/fagsak';
import { useFagsakContext } from '../FagsakContext';

export function Saksoversikt() {
    const { fagsak } = useFagsakContext();

    const iverksatteBehandlinger = fagsak.behandlinger.filter(
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

    const aktivBehandling = hentAktivBehandlingPåMinimalFagsak(fagsak);

    if (!gjeldendeBehandling) {
        gjeldendeBehandling = aktivBehandling;
    }

    const gjeldendeUtbetalingsperioder = fagsak.gjeldendeUtbetalingsperioder;
    const utbetalingsperiodeInneværendeMåned = gjeldendeUtbetalingsperioder.find(periode =>
        periodeOverlapperMedValgtDato(periode.periodeFom, periode.periodeTom, new Date())
    );

    const nesteMåned = startOfMonth(addMonths(hentDagensDato(), 1));
    const utbetalingsperiodeNesteMåned = gjeldendeUtbetalingsperioder.find(periode =>
        periodeOverlapperMedValgtDato(periode.periodeFom, periode.periodeTom, nesteMåned)
    );

    const lenkeTilBehandlingsresultat = () => {
        return aktivBehandling ? (
            <Link as={ReactRouterLink} to={`/fagsak/${fagsak.id}/${aktivBehandling.behandlingId}/tilkjent-ytelse`}>
                Se behandlingsresultat for detaljer
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
                    <InfoCard data-color="info">
                        <InfoCard.Message icon={<InformationSquareIcon aria-hidden />}>
                            Siste gjeldende vedtak er en EØS-sak uten månedlige utbetalinger fra Nav
                        </InfoCard.Message>
                    </InfoCard>
                </Box>
            ) : (
                <>
                    {utbetalingsperiodeNesteMåned &&
                        utbetalingsperiodeNesteMåned !== utbetalingsperiodeInneværendeMåned && (
                            <Box width={SaksoversiktPanelBredde}>
                                <InfoCard data-color="info">
                                    <InfoCard.Header icon={<InformationSquareIcon aria-hidden />}>
                                        <InfoCard.Title>
                                            {`Utbetalingen endres fra og med ${dateTilFormatertString({
                                                date: nesteMåned,
                                                tilFormat: Datoformat.MÅNED_ÅR_NAVN,
                                            })}`}
                                        </InfoCard.Title>
                                    </InfoCard.Header>
                                    <InfoCard.Content>{lenkeTilBehandlingsresultat()}</InfoCard.Content>
                                </InfoCard>
                            </Box>
                        )}
                    <Utbetalinger vedtaksperiode={utbetalingsperiodeInneværendeMåned} />
                </>
            );
        } else if (utbetalingsperiodeNesteMåned) {
            return (
                <Box width={SaksoversiktPanelBredde}>
                    <InfoCard data-color="info">
                        <InfoCard.Header icon={<InformationSquareIcon aria-hidden />}>
                            <InfoCard.Title>
                                {`Utbetalingen starter ${dateTilFormatertString({
                                    date: nesteMåned,
                                    tilFormat: Datoformat.MÅNED_ÅR_NAVN,
                                })}`}
                            </InfoCard.Title>
                        </InfoCard.Header>
                        <InfoCard.Content>{lenkeTilBehandlingsresultat()}</InfoCard.Content>
                    </InfoCard>
                </Box>
            );
        } else {
            return (
                <Box width={SaksoversiktPanelBredde}>
                    <LocalAlert status="error">
                        <LocalAlert.Header>
                            <LocalAlert.Title>Noe gikk galt ved henting av utbetalinger.</LocalAlert.Title>
                        </LocalAlert.Header>
                        <LocalAlert.Content>
                            Prøv igjen eller kontakt brukerstøtte hvis problemet vedvarer.
                        </LocalAlert.Content>
                    </LocalAlert>
                </Box>
            );
        }
    };

    return (
        <Box maxWidth="70rem" margin="space-64">
            <Heading size={'large'} level={'1'} spacing>
                Saksoversikt
            </Heading>
            <VStack gap="space-56">
                <FagsakLenkepanel />
                {fagsak.status === FagsakStatus.LØPENDE && (
                    <div>
                        <Heading size={'medium'} level={'2'} spacing>
                            Løpende månedlig utbetaling
                        </Heading>
                        {løpendeMånedligUtbetaling()}
                    </div>
                )}
                <Behandlinger />
            </VStack>
        </Box>
    );
}

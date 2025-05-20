import React from 'react';

import { addMonths, differenceInMilliseconds, startOfMonth } from 'date-fns';
import styled from 'styled-components';

import { Alert, Heading, Link, VStack } from '@navikt/ds-react';
import { byggTomRessurs } from '@navikt/familie-typer';

import Behandlinger from './Behandlinger';
import FagsakLenkepanel, { SaksoversiktPanelBredde } from './FagsakLenkepanel';
import Utbetalinger from './Utbetalinger';
import type { VisningBehandling } from './visningBehandling';
import { useBehandlingContext } from '../../../sider/Fagsak/Behandling/context/BehandlingContext';
import type { IBehandling } from '../../../typer/behandling';
import { BehandlingStatus, erBehandlingHenlagt } from '../../../typer/behandling';
import { behandlingKategori, BehandlingKategori } from '../../../typer/behandlingstema';
import type { IMinimalFagsak } from '../../../typer/fagsak';
import { FagsakStatus } from '../../../typer/fagsak';
import { Vedtaksperiodetype } from '../../../typer/vedtaksperiode';
import {
    dagensDato,
    dateTilFormatertString,
    Datoformat,
    isoStringTilDate,
} from '../../../utils/dato';
import { periodeOverlapperMedValgtDato } from '../../../utils/dato';
import { hentAktivBehandlingPåMinimalFagsak } from '../../../utils/fagsak';

interface IProps {
    minimalFagsak: IMinimalFagsak;
}

const SaksoversiktWrapper = styled.div`
    max-width: 70rem;
    margin: 4rem;
`;

const SaksoversiktHeading = styled(Heading)`
    margin-bottom: 1rem;
`;

const StyledAlert = styled(Alert)`
    width: ${SaksoversiktPanelBredde};
`;

const Saksoversikt: React.FunctionComponent<IProps> = ({ minimalFagsak }) => {
    const { settÅpenBehandling } = useBehandlingContext();

    React.useEffect(() => {
        settÅpenBehandling(byggTomRessurs(), false);
    }, [minimalFagsak.status]);

    const iverksatteBehandlinger = minimalFagsak.behandlinger.filter(
        (behandling: VisningBehandling) =>
            behandling.status === BehandlingStatus.AVSLUTTET &&
            !erBehandlingHenlagt(behandling.resultat)
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

    const nesteMåned = startOfMonth(addMonths(dagensDato, 1));
    const utbetalingsperiodeNesteMåned = gjeldendeUtbetalingsperioder.find(periode =>
        periodeOverlapperMedValgtDato(periode.periodeFom, periode.periodeTom, nesteMåned)
    );

    const lenkeTilBehandlingsresultat = () => {
        return aktivBehandling ? (
            <Link
                href={`/fagsak/${minimalFagsak.id}/${aktivBehandling.behandlingId}/tilkjent-ytelse`}
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
                <StyledAlert variant="info">
                    Siste gjeldende vedtak er en EØS-sak uten månedlige utbetalinger fra Nav
                </StyledAlert>
            ) : (
                <>
                    {utbetalingsperiodeNesteMåned &&
                        utbetalingsperiodeNesteMåned !== utbetalingsperiodeInneværendeMåned && (
                            <StyledAlert variant="info">
                                <VStack>
                                    {`Utbetalingen endres fra og med ${dateTilFormatertString({
                                        date: nesteMåned,
                                        tilFormat: Datoformat.MÅNED_ÅR_NAVN,
                                    })}`}
                                    {lenkeTilBehandlingsresultat()}
                                </VStack>
                            </StyledAlert>
                        )}
                    <Utbetalinger vedtaksperiode={utbetalingsperiodeInneværendeMåned} />
                </>
            );
        } else if (utbetalingsperiodeNesteMåned) {
            return (
                <StyledAlert variant="info">
                    <VStack>
                        {`Utbetalingen starter ${dateTilFormatertString({
                            date: nesteMåned,
                            tilFormat: Datoformat.MÅNED_ÅR_NAVN,
                        })}`}
                        {lenkeTilBehandlingsresultat()}
                    </VStack>
                </StyledAlert>
            );
        } else {
            return (
                <StyledAlert variant="error">
                    Noe gikk galt ved henting av utbetalinger. Prøv igjen eller kontakt brukerstøtte
                    hvis problemet vedvarer.
                </StyledAlert>
            );
        }
    };

    return (
        <SaksoversiktWrapper>
            <SaksoversiktHeading size={'large'} level={'1'} children={'Saksoversikt'} />
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
                <Behandlinger minimalFagsak={minimalFagsak} />
            </VStack>
        </SaksoversiktWrapper>
    );
};

export const sakstype = (behandling?: IBehandling) => {
    if (!behandling) {
        return 'Ikke satt';
    }

    return `${
        behandling?.kategori ? behandlingKategori[behandling?.kategori] : behandling?.kategori
    }`;
};

export default Saksoversikt;

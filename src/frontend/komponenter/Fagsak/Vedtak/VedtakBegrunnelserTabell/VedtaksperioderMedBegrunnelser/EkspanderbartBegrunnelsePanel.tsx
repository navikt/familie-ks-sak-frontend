import type { PropsWithChildren } from 'react';
import React from 'react';

import { endOfMonth, isAfter } from 'date-fns';
import styled from 'styled-components';

import { BodyShort, ExpansionCard, Label } from '@navikt/ds-react';

import type { IVedtaksperiodeMedBegrunnelser } from '../../../../../typer/vedtaksperiode';
import { hentVedtaksperiodeTittel, Vedtaksperiodetype } from '../../../../../typer/vedtaksperiode';
import {
    dagensDato,
    isoStringTilDateMedFallback,
    tidenesEnde,
    isoDatoPeriodeTilFormatertString,
} from '../../../../../utils/dato';
import { formaterBeløp, summer } from '../../../../../utils/formatter';

const StyledExpansionCard = styled(ExpansionCard)`
    margin-bottom: 1rem;
`;

const StyledExpansionHeader = styled(ExpansionCard.Header)`
    align-items: center;
`;

const StyledExpansionTitle = styled(ExpansionCard.Title)`
    display: grid;
    grid-template-columns: minmax(6rem, 12rem) minmax(6rem, 15rem) auto;
    grid-gap: 0.5rem;
    margin-left: 0;
`;

interface IEkspanderbartBegrunnelsePanelProps extends PropsWithChildren {
    vedtaksperiodeMedBegrunnelser: IVedtaksperiodeMedBegrunnelser;
    åpen: boolean;
    onClick?: () => void;
}

const slutterSenereEnnInneværendeMåned = (tom?: string) =>
    isAfter(
        isoStringTilDateMedFallback({ isoString: tom, fallbackDate: tidenesEnde }),
        endOfMonth(dagensDato)
    );

const EkspanderbartBegrunnelsePanel: React.FC<IEkspanderbartBegrunnelsePanelProps> = ({
    vedtaksperiodeMedBegrunnelser,
    åpen,
    onClick,
    children,
}) => {
    const periode = {
        fom: vedtaksperiodeMedBegrunnelser.fom,
        tom: vedtaksperiodeMedBegrunnelser.tom,
    };

    const vedtaksperiodeTittel = hentVedtaksperiodeTittel(vedtaksperiodeMedBegrunnelser);

    return (
        <StyledExpansionCard
            key={`${periode.fom}_${periode.tom}`}
            size={'small'}
            open={åpen}
            onToggle={onClick}
            aria-label={`Periode ${periode.fom}_${periode.tom}`}
        >
            <StyledExpansionHeader>
                <StyledExpansionTitle>
                    {periode.fom && (
                        <Label>
                            {isoDatoPeriodeTilFormatertString({
                                fom: periode.fom,
                                tom: slutterSenereEnnInneværendeMåned(periode.tom)
                                    ? ''
                                    : periode.tom,
                            })}
                        </Label>
                    )}
                    <BodyShort>{vedtaksperiodeTittel}</BodyShort>
                    {(vedtaksperiodeMedBegrunnelser.type === Vedtaksperiodetype.UTBETALING ||
                        vedtaksperiodeMedBegrunnelser.type ===
                            Vedtaksperiodetype.UTBETALING_MED_REDUKSJON_FRA_SIST_IVERKSATTE_BEHANDLING) &&
                        vedtaksperiodeMedBegrunnelser.utbetalingsperiodeDetaljer.length > 0 && (
                            <BodyShort>
                                {formaterBeløp(
                                    summer(
                                        vedtaksperiodeMedBegrunnelser.utbetalingsperiodeDetaljer.map(
                                            utbetalingsperiodeDetalj =>
                                                utbetalingsperiodeDetalj.utbetaltPerMnd
                                        )
                                    )
                                )}
                            </BodyShort>
                        )}
                </StyledExpansionTitle>
            </StyledExpansionHeader>
            <ExpansionCard.Content>{children}</ExpansionCard.Content>
        </StyledExpansionCard>
    );
};

export default EkspanderbartBegrunnelsePanel;

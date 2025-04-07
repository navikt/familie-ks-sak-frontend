import type { PropsWithChildren } from 'react';
import React from 'react';

import { endOfMonth, isAfter, isSameDay } from 'date-fns';
import styled from 'styled-components';

import { BodyShort, ExpansionCard, Label } from '@navikt/ds-react';

import type { IVedtaksperiodeMedBegrunnelser } from '../../../../../../../typer/vedtaksperiode';
import {
    hentVedtaksperiodeTittel,
    Vedtaksperiodetype,
} from '../../../../../../../typer/vedtaksperiode';
import {
    dagensDato,
    isoStringTilDateMedFallback,
    tidenesEnde,
    isoDatoPeriodeTilFormatertString,
    parseFraOgMedDato,
    type IsoDatoString,
} from '../../../../../../../utils/dato';
import { formaterBeløp, summer } from '../../../../../../../utils/formatter';

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
    sisteVedtaksperiodeFom?: string;
    vedtaksperiodeInneholderOvergangsordningBegrunnelse: boolean;
    åpen: boolean;
    onClick?: () => void;
}

const erSammeFom = (dato1?: IsoDatoString, dato2?: IsoDatoString): boolean =>
    isSameDay(parseFraOgMedDato(dato1), parseFraOgMedDato(dato2));

const slutterSenereEnnInneværendeMåned = (tom?: string) =>
    isAfter(
        isoStringTilDateMedFallback({ isoString: tom, fallbackDate: tidenesEnde }),
        endOfMonth(dagensDato)
    );

const finnPresentertTomDato = (
    vedtaksperiodeInneholderOvergangsordningBegrunnelse: boolean,
    periodeFom?: string,
    periodeTom?: string,
    sisteVedtaksperiodeFom?: string
) => {
    if (vedtaksperiodeInneholderOvergangsordningBegrunnelse) {
        return periodeTom;
    }

    if (erSammeFom(periodeFom, sisteVedtaksperiodeFom)) {
        return slutterSenereEnnInneværendeMåned(periodeTom) ? '' : periodeTom;
    }
    return periodeTom;
};

const EkspanderbartBegrunnelsePanel: React.FC<IEkspanderbartBegrunnelsePanelProps> = ({
    vedtaksperiodeMedBegrunnelser,
    sisteVedtaksperiodeFom,
    vedtaksperiodeInneholderOvergangsordningBegrunnelse,
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
                                tom: finnPresentertTomDato(
                                    vedtaksperiodeInneholderOvergangsordningBegrunnelse,
                                    periode.fom,
                                    periode.tom,
                                    sisteVedtaksperiodeFom
                                ),
                            })}
                        </Label>
                    )}
                    <BodyShort>{vedtaksperiodeTittel}</BodyShort>
                    {vedtaksperiodeMedBegrunnelser.type === Vedtaksperiodetype.UTBETALING &&
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

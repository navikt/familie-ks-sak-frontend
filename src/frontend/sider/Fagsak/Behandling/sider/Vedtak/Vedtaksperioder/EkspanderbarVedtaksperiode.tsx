import type { PropsWithChildren } from 'react';

import { useVedtaksperiodeContext } from '@sider/Fagsak/Behandling/sider/Vedtak/Vedtaksperioder/VedtaksperiodeContext';
import { Standardbegrunnelse } from '@typer/vedtak';
import { hentVedtaksperiodeTittel, Vedtaksperiodetype } from '@typer/vedtaksperiode';
import {
    hentDagensDato,
    isoDatoPeriodeTilFormatertString,
    type IsoDatoString,
    isoStringTilDateMedFallback,
    parseFraOgMedDato,
    tidenesEnde,
} from '@utils/dato';
import { formaterBeløp, summer } from '@utils/formatter';
import { endOfMonth, isAfter, isSameDay } from 'date-fns';

import { BodyShort, ExpansionCard, HGrid, Label } from '@navikt/ds-react';

interface Props extends PropsWithChildren {
    sisteVedtaksperiodeFom?: string;
}

function erSammeFom(dato1?: IsoDatoString, dato2?: IsoDatoString): boolean {
    return isSameDay(parseFraOgMedDato(dato1), parseFraOgMedDato(dato2));
}

function slutterSenereEnnInneværendeMåned(tom?: string) {
    return isAfter(
        isoStringTilDateMedFallback({ isoString: tom, fallbackDate: tidenesEnde }),
        endOfMonth(hentDagensDato())
    );
}

function finnPresentertTomDato(
    vedtaksperiodeInneholderOvergangsordningBegrunnelse: boolean,
    periodeFom?: string,
    periodeTom?: string,
    sisteVedtaksperiodeFom?: string
) {
    if (vedtaksperiodeInneholderOvergangsordningBegrunnelse) {
        return periodeTom;
    }
    if (erSammeFom(periodeFom, sisteVedtaksperiodeFom)) {
        return slutterSenereEnnInneværendeMåned(periodeTom) ? '' : periodeTom;
    }
    return periodeTom;
}

export function EkspanderbarVedtaksperiode({ sisteVedtaksperiodeFom, children }: Props) {
    const { vedtaksperiodeMedBegrunnelser, erPanelEkspandert, onPanelClose } = useVedtaksperiodeContext();

    const { begrunnelser, type, utbetalingsperiodeDetaljer, fom, tom } = vedtaksperiodeMedBegrunnelser;

    const vedtaksperiodeInneholderOvergangsordningBegrunnelse = begrunnelser.some(
        ({ begrunnelse }) =>
            begrunnelse === Standardbegrunnelse.INNVILGET_OVERGANGSORDNING ||
            begrunnelse === Standardbegrunnelse.INNVILGET_OVERGANGSORDNING_GRADERT_UTBETALING ||
            begrunnelse === Standardbegrunnelse.INNVILGET_OVERGANGSORDNING_DELT_BOSTED
    );

    const erUtbetaling = type === Vedtaksperiodetype.UTBETALING;
    const harUtbetalingsperiodeDetaljer = utbetalingsperiodeDetaljer.length > 0;
    const skalViseSum = erUtbetaling && harUtbetalingsperiodeDetaljer;
    const sum = summer(utbetalingsperiodeDetaljer.map(detalj => detalj.utbetaltPerMnd));
    const tittel = hentVedtaksperiodeTittel(vedtaksperiodeMedBegrunnelser);

    const periode = isoDatoPeriodeTilFormatertString({
        fom: fom,
        tom: finnPresentertTomDato(
            vedtaksperiodeInneholderOvergangsordningBegrunnelse,
            fom,
            tom,
            sisteVedtaksperiodeFom
        ),
    });

    return (
        <ExpansionCard
            aria-label={`Begrunnelse - Periode ${fom}_${tom}`}
            size={'small'}
            open={erPanelEkspandert}
            onToggle={() => onPanelClose(true)}
        >
            <ExpansionCard.Header>
                <ExpansionCard.Title>
                    <HGrid columns={'minmax(6rem, 12rem) minmax(6rem, 15rem) auto'} gap={'space-8'}>
                        {fom && <Label>{periode}</Label>}
                        <BodyShort>{tittel}</BodyShort>
                        {skalViseSum && <BodyShort>{formaterBeløp(sum)}</BodyShort>}
                    </HGrid>
                </ExpansionCard.Title>
            </ExpansionCard.Header>
            <ExpansionCard.Content>{children}</ExpansionCard.Content>
        </ExpansionCard>
    );
}

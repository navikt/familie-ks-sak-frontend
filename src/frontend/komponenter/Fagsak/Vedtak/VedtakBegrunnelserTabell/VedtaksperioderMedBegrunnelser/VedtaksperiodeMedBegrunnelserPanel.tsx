import React from 'react';

import { BodyShort, ErrorMessage, Label } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer/dist/ressurs';

import BegrunnelserMultiselect from './BegrunnelserMultiselect';
import EkspanderbartBegrunnelsePanel from './EkspanderbartBegrunnelsePanel';
import FritekstVedtakbegrunnelser from './FritekstVedtakbegrunnelser';
import type { Begrunnelse } from '../../../../../typer/vedtak';
import { Standardbegrunnelse, BegrunnelseType } from '../../../../../typer/vedtak';
import type {
    IRestVedtaksbegrunnelse,
    IVedtaksperiodeMedBegrunnelser,
} from '../../../../../typer/vedtaksperiode';
import { Vedtaksperiodetype } from '../../../../../typer/vedtaksperiode';
import { useVedtaksperiodeMedBegrunnelser } from '../Context/VedtaksperiodeMedBegrunnelserContext';
import Utbetalingsresultat from '../Felles/Utbetalingsresultat';

interface IProps {
    vedtaksperiodeMedBegrunnelser: IVedtaksperiodeMedBegrunnelser;
}

const VedtaksperiodeMedBegrunnelserPanel: React.FC<IProps> = ({
    vedtaksperiodeMedBegrunnelser,
}) => {
    const { erPanelEkspandert, onPanelClose, genererteBrevbegrunnelser } =
        useVedtaksperiodeMedBegrunnelser();

    const ugyldigeReduksjonsteksterForÅTriggeFritekst: Begrunnelse[] = [
        Standardbegrunnelse.REDUKSJON_SATSENDRING,
        Standardbegrunnelse.REDUKSJON_UNDER_6_ÅR,
        Standardbegrunnelse.REDUKSJON_UNDER_18_ÅR,
    ];

    const vedtaksperiodeInneholderFramtidigOpphørBegrunnelse =
        vedtaksperiodeMedBegrunnelser.begrunnelser.filter(
            vedtaksBegrunnelser =>
                (vedtaksBegrunnelser.begrunnelse as Standardbegrunnelse) ===
                Standardbegrunnelse.OPPHØR_FRAMTIDIG_OPPHØR_BARNEHAGEPLASS
        ).length > 0;

    const vedtaksperiodeInneholderEtterbetaling3MånedBegrunnelse = () =>
        vedtaksperiodeMedBegrunnelser.begrunnelser.filter(
            vedtaksBegrunnelser =>
                (vedtaksBegrunnelser.begrunnelse as Standardbegrunnelse) ===
                Standardbegrunnelse.ETTER_ENDRET_UTBETALING_ETTERBETALING
        ).length > 0;

    const vedtaksperiodeInneholderBegrunnelseSomStøtterFritekst = () => {
        const alleBegrunnelser = [
            ...vedtaksperiodeMedBegrunnelser.begrunnelser,
            ...vedtaksperiodeMedBegrunnelser.eøsBegrunnelser,
        ];
        return alleBegrunnelser.some(vedtaksbegrunnelse => vedtaksbegrunnelse.støtterFritekst);
    };

    const erReduksjonsbegrunnelseSomSkalViseFritekst = (
        vedtaksBegrunnelse: IRestVedtaksbegrunnelse
    ) =>
        !ugyldigeReduksjonsteksterForÅTriggeFritekst.includes(vedtaksBegrunnelse.begrunnelse) &&
        vedtaksBegrunnelse.begrunnelseType === BegrunnelseType.REDUKSJON;

    const visFritekster = () => {
        const begrunnelser = [
            ...vedtaksperiodeMedBegrunnelser.begrunnelser,
            ...vedtaksperiodeMedBegrunnelser.eøsBegrunnelser,
        ];
        return (
            (vedtaksperiodeMedBegrunnelser.type !== Vedtaksperiodetype.UTBETALING &&
                vedtaksperiodeMedBegrunnelser.type !== Vedtaksperiodetype.ENDRET_UTBETALING) ||
            vedtaksperiodeInneholderEtterbetaling3MånedBegrunnelse() ||
            vedtaksperiodeInneholderBegrunnelseSomStøtterFritekst() ||
            begrunnelser.filter(begrunnelse =>
                erReduksjonsbegrunnelseSomSkalViseFritekst(begrunnelse)
            ).length > 0
        );
    };

    return (
        <EkspanderbartBegrunnelsePanel
            vedtaksperiodeMedBegrunnelser={vedtaksperiodeMedBegrunnelser}
            åpen={erPanelEkspandert}
            onClick={() => onPanelClose(true)}
        >
            <Utbetalingsresultat
                utbetalingsperiodeDetaljer={
                    vedtaksperiodeMedBegrunnelser.utbetalingsperiodeDetaljer
                }
            />
            {vedtaksperiodeMedBegrunnelser.type !== Vedtaksperiodetype.AVSLAG && (
                <BegrunnelserMultiselect
                    ikkeRedigerbar={vedtaksperiodeInneholderFramtidigOpphørBegrunnelse}
                />
            )}
            {genererteBrevbegrunnelser.status === RessursStatus.SUKSESS &&
                genererteBrevbegrunnelser.data.length > 0 && (
                    <>
                        <Label>Begrunnelse(r)</Label>
                        <ul>
                            {genererteBrevbegrunnelser.data.map(
                                (begrunnelse: string, index: number) => (
                                    <li key={`begrunnelse-${index}`}>
                                        <BodyShort children={begrunnelse} />
                                    </li>
                                )
                            )}
                        </ul>
                    </>
                )}
            {genererteBrevbegrunnelser.status === RessursStatus.FEILET && (
                <>
                    <ErrorMessage>{genererteBrevbegrunnelser.frontendFeilmelding}</ErrorMessage>
                </>
            )}
            {visFritekster() && <FritekstVedtakbegrunnelser />}
        </EkspanderbartBegrunnelsePanel>
    );
};
export default VedtaksperiodeMedBegrunnelserPanel;

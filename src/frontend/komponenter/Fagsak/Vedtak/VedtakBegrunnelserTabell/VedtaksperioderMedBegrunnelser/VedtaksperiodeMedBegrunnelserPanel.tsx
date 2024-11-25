import React from 'react';

import { BodyShort, ErrorMessage, Label } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer/dist/ressurs';

import BegrunnelserMultiselect from './BegrunnelserMultiselect';
import EkspanderbartBegrunnelsePanel from './EkspanderbartBegrunnelsePanel';
import FritekstVedtakbegrunnelser from './FritekstVedtakbegrunnelser';
import { Standardbegrunnelse } from '../../../../../typer/vedtak';
import type { IVedtaksperiodeMedBegrunnelser } from '../../../../../typer/vedtaksperiode';
import { Vedtaksperiodetype } from '../../../../../typer/vedtaksperiode';
import { useVedtaksperiodeMedBegrunnelser } from '../Context/VedtaksperiodeMedBegrunnelserContext';
import Utbetalingsresultat from '../Felles/Utbetalingsresultat';

interface IProps {
    vedtaksperiodeMedBegrunnelser: IVedtaksperiodeMedBegrunnelser;
    sisteVedtaksperiodeFom?: string;
}

const VedtaksperiodeMedBegrunnelserPanel: React.FC<IProps> = ({
    vedtaksperiodeMedBegrunnelser,
    sisteVedtaksperiodeFom,
}) => {
    const { erPanelEkspandert, onPanelClose, genererteBrevbegrunnelser } =
        useVedtaksperiodeMedBegrunnelser();

    const vedtaksperiodeInneholderFramtidigOpphørBegrunnelse =
        vedtaksperiodeMedBegrunnelser.begrunnelser.filter(
            vedtaksBegrunnelser =>
                (vedtaksBegrunnelser.begrunnelse as Standardbegrunnelse) ===
                Standardbegrunnelse.OPPHØR_FRAMTIDIG_OPPHØR_BARNEHAGEPLASS
        ).length > 0;

    const vedtaksperiodeInneholderOvergangsordningBegrunnelse = false;

    const vedtaksperiodeStøtterFritekst =
        vedtaksperiodeMedBegrunnelser.støtterFritekst ||
        vedtaksperiodeMedBegrunnelser.fritekster.length > 0;

    return (
        <EkspanderbartBegrunnelsePanel
            vedtaksperiodeMedBegrunnelser={vedtaksperiodeMedBegrunnelser}
            sisteVedtaksperiodeFom={sisteVedtaksperiodeFom}
            vedtaksperiodeInneholderOvergangsordningBegrunnelse={
                vedtaksperiodeInneholderOvergangsordningBegrunnelse
            }
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
                    tillatKunLesevisning={
                        vedtaksperiodeInneholderFramtidigOpphørBegrunnelse ||
                        vedtaksperiodeInneholderOvergangsordningBegrunnelse
                    }
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
            {vedtaksperiodeStøtterFritekst && <FritekstVedtakbegrunnelser />}
        </EkspanderbartBegrunnelsePanel>
    );
};
export default VedtaksperiodeMedBegrunnelserPanel;

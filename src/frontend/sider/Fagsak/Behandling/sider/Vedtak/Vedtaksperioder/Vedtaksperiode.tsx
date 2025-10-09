import { BodyShort, ErrorMessage, Label } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer/dist/ressurs';

import BegrunnelserMultiselect from './BegrunnelserMultiselect';
import EkspanderbarVedtaksperiode from './EkspanderbarVedtaksperiode';
import FritekstVedtakbegrunnelser from './FritekstVedtakbegrunnelser';
import Utbetalingsresultat from './Utbetalingsresultat';
import { useVedtaksperiodeContext } from './VedtaksperiodeContext';
import { Standardbegrunnelse } from '../../../../../../typer/vedtak';
import { Vedtaksperiodetype, type IVedtaksperiodeMedBegrunnelser } from '../../../../../../typer/vedtaksperiode';

interface IProps {
    vedtaksperiodeMedBegrunnelser: IVedtaksperiodeMedBegrunnelser;
    sisteVedtaksperiodeFom?: string;
}

const Vedtaksperiode: React.FC<IProps> = ({ vedtaksperiodeMedBegrunnelser, sisteVedtaksperiodeFom }) => {
    const { erPanelEkspandert, onPanelClose, genererteBrevbegrunnelser } = useVedtaksperiodeContext();

    const vedtaksperiodeInneholderFramtidigOpphørBegrunnelse =
        vedtaksperiodeMedBegrunnelser.begrunnelser.filter(
            vedtaksBegrunnelser =>
                (vedtaksBegrunnelser.begrunnelse as Standardbegrunnelse) ===
                Standardbegrunnelse.OPPHØR_FRAMTIDIG_OPPHØR_BARNEHAGEPLASS
        ).length > 0;

    const vedtaksperiodeInneholderOvergangsordningBegrunnelse =
        vedtaksperiodeMedBegrunnelser.begrunnelser.filter(
            vedtaksBegrunnelser =>
                (vedtaksBegrunnelser.begrunnelse as Standardbegrunnelse) ===
                    Standardbegrunnelse.INNVILGET_OVERGANGSORDNING ||
                (vedtaksBegrunnelser.begrunnelse as Standardbegrunnelse) ===
                    Standardbegrunnelse.INNVILGET_OVERGANGSORDNING_GRADERT_UTBETALING ||
                (vedtaksBegrunnelser.begrunnelse as Standardbegrunnelse) ===
                    Standardbegrunnelse.INNVILGET_OVERGANGSORDNING_DELT_BOSTED
        ).length > 0;

    const vedtaksperiodeStøtterFritekst =
        vedtaksperiodeMedBegrunnelser.støtterFritekst || vedtaksperiodeMedBegrunnelser.fritekster.length > 0;

    return (
        <EkspanderbarVedtaksperiode
            vedtaksperiodeMedBegrunnelser={vedtaksperiodeMedBegrunnelser}
            sisteVedtaksperiodeFom={sisteVedtaksperiodeFom}
            vedtaksperiodeInneholderOvergangsordningBegrunnelse={vedtaksperiodeInneholderOvergangsordningBegrunnelse}
            åpen={erPanelEkspandert}
            onClick={() => onPanelClose(true)}
        >
            <Utbetalingsresultat
                utbetalingsperiodeDetaljer={vedtaksperiodeMedBegrunnelser.utbetalingsperiodeDetaljer}
            />
            {vedtaksperiodeMedBegrunnelser.type !== Vedtaksperiodetype.AVSLAG && (
                <BegrunnelserMultiselect tillatKunLesevisning={vedtaksperiodeInneholderFramtidigOpphørBegrunnelse} />
            )}
            {genererteBrevbegrunnelser.status === RessursStatus.SUKSESS &&
                genererteBrevbegrunnelser.data.length > 0 && (
                    <>
                        <Label>Begrunnelse(r)</Label>
                        <ul>
                            {genererteBrevbegrunnelser.data.map((begrunnelse: string, index: number) => (
                                <li key={`begrunnelse-${index}`}>
                                    <BodyShort children={begrunnelse} />
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            {genererteBrevbegrunnelser.status === RessursStatus.FEILET && (
                <>
                    <ErrorMessage>{genererteBrevbegrunnelser.frontendFeilmelding}</ErrorMessage>
                </>
            )}
            {vedtaksperiodeStøtterFritekst && <FritekstVedtakbegrunnelser />}
        </EkspanderbarVedtaksperiode>
    );
};
export default Vedtaksperiode;

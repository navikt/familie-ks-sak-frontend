import { BodyShort, ErrorMessage, HStack, Label, Loader } from '@navikt/ds-react';

import BegrunnelserMultiselect from './BegrunnelserMultiselect';
import EkspanderbarVedtaksperiode from './EkspanderbarVedtaksperiode';
import FritekstVedtakbegrunnelser from './FritekstVedtakbegrunnelser';
import Utbetalingsresultat from './Utbetalingsresultat';
import { useVedtaksperiodeContext } from './VedtaksperiodeContext';
import { useHentGenererteBrevbegrunnelser } from '../../../../../../hooks/useHentGenererteBrevbegrunnelser';
import { Standardbegrunnelse } from '../../../../../../typer/vedtak';
import { type IVedtaksperiodeMedBegrunnelser, Vedtaksperiodetype } from '../../../../../../typer/vedtaksperiode';

interface IProps {
    vedtaksperiodeMedBegrunnelser: IVedtaksperiodeMedBegrunnelser;
    sisteVedtaksperiodeFom?: string;
}

const Vedtaksperiode = ({ vedtaksperiodeMedBegrunnelser, sisteVedtaksperiodeFom }: IProps) => {
    const { erPanelEkspandert, onPanelClose } = useVedtaksperiodeContext();
    const {
        data: genererteBrevbegrunnelser,
        isPending: genererteBrevbegrunnelserPending,
        error: genererteBrevbegrunnelserError,
    } = useHentGenererteBrevbegrunnelser({ vedtaksperiodeId: vedtaksperiodeMedBegrunnelser.id });

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
            {genererteBrevbegrunnelserPending ? (
                <HStack justify={'center'} align={'center'} paddingBlock={'space-32'} gap={'space-8'}>
                    <Loader size={'small'} />
                    <BodyShort>Laster genererte brevbegrunnelser...</BodyShort>
                </HStack>
            ) : genererteBrevbegrunnelserError ? (
                <ErrorMessage>{genererteBrevbegrunnelserError.message}</ErrorMessage>
            ) : (
                genererteBrevbegrunnelser &&
                genererteBrevbegrunnelser.length > 0 && (
                    <>
                        <Label>Begrunnelse(r)</Label>
                        <ul>
                            {genererteBrevbegrunnelser.map((begrunnelse: string, index: number) => (
                                <li key={`begrunnelse-${index}`}>
                                    <BodyShort children={begrunnelse} />
                                </li>
                            ))}
                        </ul>
                    </>
                )
            )}
            {vedtaksperiodeStøtterFritekst && <FritekstVedtakbegrunnelser />}
        </EkspanderbarVedtaksperiode>
    );
};
export default Vedtaksperiode;

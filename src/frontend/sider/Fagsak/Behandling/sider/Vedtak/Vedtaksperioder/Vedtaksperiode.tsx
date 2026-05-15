import { GenererteBrevbegrunnelser } from '@sider/Fagsak/Behandling/sider/Vedtak/Vedtaksperioder/GenererteBrevbegrunnelser';
import { Vedtaksperiodetype } from '@typer/vedtaksperiode';

import { VStack } from '@navikt/ds-react';

import { BegrunnelserMultiselect } from './BegrunnelserMultiselect';
import { EkspanderbarVedtaksperiode } from './EkspanderbarVedtaksperiode';
import { FritekstVedtakbegrunnelser } from './FritekstVedtakbegrunnelser';
import { Utbetalingsresultat } from './Utbetalingsresultat';
import { useVedtaksperiodeContext } from './VedtaksperiodeContext';

interface Props {
    sisteVedtaksperiodeFom?: string;
}

export function Vedtaksperiode({ sisteVedtaksperiodeFom }: Props) {
    const { vedtaksperiodeMedBegrunnelser } = useVedtaksperiodeContext();

    const vedtaksperiodeStøtterFritekst =
        vedtaksperiodeMedBegrunnelser.støtterFritekst || vedtaksperiodeMedBegrunnelser.fritekster.length > 0;

    return (
        <EkspanderbarVedtaksperiode sisteVedtaksperiodeFom={sisteVedtaksperiodeFom}>
            <VStack gap={'space-20'}>
                {vedtaksperiodeMedBegrunnelser.utbetalingsperiodeDetaljer.length !== 0 && <Utbetalingsresultat />}
                {vedtaksperiodeMedBegrunnelser.type !== Vedtaksperiodetype.AVSLAG && <BegrunnelserMultiselect />}
                <GenererteBrevbegrunnelser />
                {vedtaksperiodeStøtterFritekst && (
                    <div>
                        <FritekstVedtakbegrunnelser />
                    </div>
                )}
            </VStack>
        </EkspanderbarVedtaksperiode>
    );
}

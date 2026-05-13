import { GenererteBrevbegrunnelser } from '@sider/Fagsak/Behandling/sider/Vedtak/Vedtaksperioder/GenererteBrevbegrunnelser';
import { skalViseFritekstbegrunnelser, Vedtaksperiodetype } from '@typer/vedtaksperiode';

import { VStack } from '@navikt/ds-react';

import { BegrunnelserMultiselect } from './BegrunnelserMultiselect';
import { EkspanderbarVedtaksperiode } from './EkspanderbarVedtaksperiode';
import { Fritekstbegrunnelser } from './Fritekstbegrunnelser';
import { Utbetalingsresultat } from './Utbetalingsresultat';
import { useVedtaksperiodeContext } from './VedtaksperiodeContext';

interface Props {
    sisteVedtaksperiodeFom?: string;
}

export function Vedtaksperiode({ sisteVedtaksperiodeFom }: Props) {
    const { vedtaksperiodeMedBegrunnelser } = useVedtaksperiodeContext();

    return (
        <EkspanderbarVedtaksperiode sisteVedtaksperiodeFom={sisteVedtaksperiodeFom}>
            <VStack gap={'space-20'}>
                {vedtaksperiodeMedBegrunnelser.utbetalingsperiodeDetaljer.length !== 0 && <Utbetalingsresultat />}
                {vedtaksperiodeMedBegrunnelser.type !== Vedtaksperiodetype.AVSLAG && <BegrunnelserMultiselect />}
                <GenererteBrevbegrunnelser />
                {skalViseFritekstbegrunnelser(vedtaksperiodeMedBegrunnelser) && <Fritekstbegrunnelser />}
            </VStack>
        </EkspanderbarVedtaksperiode>
    );
}

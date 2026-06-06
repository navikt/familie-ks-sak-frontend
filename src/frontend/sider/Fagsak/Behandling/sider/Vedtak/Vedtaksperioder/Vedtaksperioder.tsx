import { useBehandling } from '@hooks/useBehandling';
import type { IVedtaksperiodeMedBegrunnelser } from '@typer/vedtaksperiode';
import { Vedtaksperiodetype } from '@typer/vedtaksperiode';
import { partition } from '@utils/commons';

import { Heading, HelpText, HStack, VStack } from '@navikt/ds-react';

import { filtrerOgSorterPerioderMedBegrunnelseBehov } from './utils';
import { Vedtaksperiode } from './Vedtaksperiode';
import { VedtaksperiodeProvider } from './VedtaksperiodeContext';
import { useVedtaksperioderContext } from './VedtaksperioderContext';

export function Vedtaksperioder() {
    const { vedtaksperioder } = useVedtaksperioderContext();
    const behandling = useBehandling();

    const sorterteVedtaksperioderSomSkalvises = filtrerOgSorterPerioderMedBegrunnelseBehov(
        vedtaksperioder,
        behandling.resultat,
        behandling.status,
        behandling.sisteVedtaksperiodeVisningDato
    );

    const [sorterteAvslagsperioder, sorterteAndreVedtaksperioder] = partition(
        vedtaksperiode => vedtaksperiode.type === Vedtaksperiodetype.AVSLAG,
        sorterteVedtaksperioderSomSkalvises
    );

    if (sorterteVedtaksperioderSomSkalvises.length <= 0) {
        return null;
    }

    return (
        <VStack gap={'space-32'} marginBlock={'space-32'}>
            <GrupperteVedtaksperioder
                vedtaksperioderMedBegrunnelser={sorterteAndreVedtaksperioder}
                overskrift={'Begrunnelser i vedtaksbrev'}
                hjelpetekst={'Her skal du sette begrunnelsestekster for innvilgelse, reduksjon og opphør.'}
            />
            <GrupperteVedtaksperioder
                vedtaksperioderMedBegrunnelser={sorterteAvslagsperioder}
                overskrift={'Begrunnelser for avslag i vedtaksbrev'}
                hjelpetekst={'Her har vi hentet begrunnelser for avslag som er satt tidligere i behandlingen.'}
            />
        </VStack>
    );
}

function GrupperteVedtaksperioder({
    vedtaksperioderMedBegrunnelser,
    overskrift,
    hjelpetekst,
}: {
    vedtaksperioderMedBegrunnelser: IVedtaksperiodeMedBegrunnelser[];
    overskrift: string;
    hjelpetekst: string;
}) {
    if (vedtaksperioderMedBegrunnelser.length === 0) {
        return null;
    }

    const sisteVedtaksperiodeFom = vedtaksperioderMedBegrunnelser[vedtaksperioderMedBegrunnelser.length - 1].fom;

    return (
        <VStack gap={'space-0'}>
            <Heading level={'2'} size={'small'} spacing={true}>
                <HStack align={'center'} justify={'start'} gap={'space-4'}>
                    {overskrift}
                    <HelpText placement={'right'}>{hjelpetekst}</HelpText>
                </HStack>
            </Heading>
            <VStack gap={'space-20'}>
                {vedtaksperioderMedBegrunnelser.map(vedtaksperiodeMedBegrunnelser => (
                    <VedtaksperiodeProvider
                        key={vedtaksperiodeMedBegrunnelser.id}
                        vedtaksperiodeMedBegrunnelser={vedtaksperiodeMedBegrunnelser}
                    >
                        <Vedtaksperiode sisteVedtaksperiodeFom={sisteVedtaksperiodeFom} />
                    </VedtaksperiodeProvider>
                ))}
            </VStack>
        </VStack>
    );
}

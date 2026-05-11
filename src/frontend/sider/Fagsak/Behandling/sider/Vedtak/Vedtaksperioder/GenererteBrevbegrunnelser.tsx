import { useHentGenererteBrevbegrunnelser } from '@hooks/useHentGenererteBrevbegrunnelser';
import { useVedtaksperiodeContext } from '@sider/Fagsak/Behandling/sider/Vedtak/Vedtaksperioder/VedtaksperiodeContext';

import { BodyShort, ErrorMessage, HStack, Label, Loader, VStack } from '@navikt/ds-react';

export function GenererteBrevbegrunnelser() {
    const { vedtaksperiodeMedBegrunnelser } = useVedtaksperiodeContext();

    const {
        data: genererteBrevbegrunnelser,
        isPending: genererteBrevbegrunnelserIsPending,
        error: genererteBrevbegrunnelserError,
    } = useHentGenererteBrevbegrunnelser(vedtaksperiodeMedBegrunnelser.id);

    if (genererteBrevbegrunnelserIsPending) {
        return (
            <VStack gap={'space-4'}>
                <Label>Begrunnelse(r)</Label>
                <HStack gap={'space-6'}>
                    <Loader size={'xsmall'} />
                    Laster begrunnelse(r)...
                </HStack>
            </VStack>
        );
    }

    if (genererteBrevbegrunnelserError) {
        return (
            <VStack gap={'space-4'}>
                <Label>Begrunnelse(r)</Label>
                <ErrorMessage>{genererteBrevbegrunnelserError.message}</ErrorMessage>
            </VStack>
        );
    }

    if (genererteBrevbegrunnelser.length === 0) {
        return (
            <VStack gap={'space-4'}>
                <Label>Begrunnelse(r)</Label>
                <BodyShort size={'small'}>Ingen begrunnelse(r).</BodyShort>
            </VStack>
        );
    }

    return (
        <VStack gap={'space-0'}>
            <Label>Begrunnelse(r)</Label>
            <ul>
                {(genererteBrevbegrunnelser ?? []).map((begrunnelse, index) => (
                    <li key={`begrunnelse-${index}`}>
                        <BodyShort>{begrunnelse}</BodyShort>
                    </li>
                ))}
            </ul>
        </VStack>
    );
}

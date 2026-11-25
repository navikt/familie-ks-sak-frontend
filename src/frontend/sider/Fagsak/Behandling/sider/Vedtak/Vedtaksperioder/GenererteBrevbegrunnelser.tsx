import { useBehandlingId } from '@hooks/useBehandlingId';
import { useHentGenererteBrevbegrunnelser } from '@hooks/useHentGenererteBrevbegrunnelser';
import { BodyShort, ErrorMessage, HStack, Label, Loader, VStack } from '@navikt/ds-react';
import { useVedtaksperiodeContext } from '@sider/Fagsak/Behandling/sider/Vedtak/Vedtaksperioder/VedtaksperiodeContext';

export function GenererteBrevbegrunnelser() {
    const { vedtaksperiodeMedBegrunnelser } = useVedtaksperiodeContext();
    const behandlingId = useBehandlingId();

    const {
        data: genererteBrevbegrunnelser,
        isPending: genererteBrevbegrunnelserIsPending,
        error: genererteBrevbegrunnelserError,
    } = useHentGenererteBrevbegrunnelser(behandlingId, vedtaksperiodeMedBegrunnelser.id);

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
                {genererteBrevbegrunnelser
                    .toSorted((b1, b2) => b1.localeCompare(b2))
                    .map((begrunnelse, index) => (
                        <li key={`begrunnelse-${index}`}>
                            <BodyShort>{begrunnelse}</BodyShort>
                        </li>
                    ))}
            </ul>
        </VStack>
    );
}

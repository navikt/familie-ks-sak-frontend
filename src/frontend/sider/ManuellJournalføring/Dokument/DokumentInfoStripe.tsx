import { DokumentIkon } from '@ikoner/DokumentIkon';
import { EksternLenke } from '@ikoner/EksternLenke';

import { BodyShort, Box, HStack } from '@navikt/ds-react';
import type { IDokumentInfo } from '@navikt/familie-typer';

import FamilieBaseKnapp from '../../../komponenter/FamilieBaseKnapp';

interface IDokumentInfoStripeProps {
    valgt: boolean;
    journalpostId: string;
    dokument: IDokumentInfo;
}

export const DokumentInfoStripe = ({ valgt, journalpostId, dokument }: IDokumentInfoStripeProps) => {
    return (
        <HStack align={'start'} height={'100%'} width={'100%'} wrap={false}>
            <Box minWidth={'48'} minHeight={'48'} marginBlock={'space-0'} marginInline={'space-0 space-16'}>
                <DokumentIkon filled={valgt} width={48} height={48} />
            </Box>
            <HStack gap={'space-8'} align={'center'}>
                <BodyShort size={'large'} weight={'semibold'}>
                    {dokument.tittel || 'Ukjent'}
                </BodyShort>
                <FamilieBaseKnapp
                    onClick={() => {
                        window.open(
                            `/familie-ks-sak/api/journalpost/${journalpostId}/dokument/${dokument.dokumentInfoId}/pdf`,
                            '_blank'
                        );
                    }}
                >
                    <EksternLenke />
                </FamilieBaseKnapp>
                {dokument.logiskeVedlegg.map((it, index) => (
                    <BodyShort key={index}>{it.tittel}</BodyShort>
                ))}
            </HStack>
        </HStack>
    );
};

import type { ReactNode } from 'react';

import { ExpansionCard, HStack, VStack } from '@navikt/ds-react';

interface DeltagerProps {
    ikon: ReactNode;
    navn: string;
    ident: string;
    undertittel: string;
    children?: ReactNode | ReactNode[];
}

export const DeltagerInfo = ({ ikon, navn, undertittel, ident }: DeltagerProps) => {
    return (
        <HStack gap={'space-16'}>
            {ikon}
            <VStack>
                <ExpansionCard.Title size={'small'} as={'h2'}>
                    {ident ? `${navn} | ${ident}` : navn}
                </ExpansionCard.Title>
                <ExpansionCard.Description>{undertittel}</ExpansionCard.Description>
            </VStack>
        </HStack>
    );
};

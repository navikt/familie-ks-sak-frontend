import { useErLesevisningFagsak } from '@hooks/useErLesevisningFagsak';
import { lagBarnLabel } from '@utils/formatter';
import { type FieldArrayWithId, useFormContext } from 'react-hook-form';

import { TrashIcon } from '@navikt/aksel-icons';
import { BodyShort, Box, Button, Checkbox, HStack } from '@navikt/ds-react';

import type { DokumentutsendingFeltnavn, DokumentutsendingFormValues } from '../useDokumentutsendingSkjema';

interface Props {
    barn: FieldArrayWithId<DokumentutsendingFormValues, DokumentutsendingFeltnavn.VALGTE_BARN>;
    onFjern: () => void;
}

export function BarnCheckbox({ barn, onFjern }: Props) {
    const erLesevisning = useErLesevisningFagsak();
    const {
        formState: { isSubmitting },
    } = useFormContext<DokumentutsendingFormValues>();

    return (
        <Box marginInline={'space-16 space-0'}>
            <HStack wrap={false} gap={'space-16'}>
                <Checkbox value={barn.id}>
                    <BodyShort truncate>{lagBarnLabel(barn)}</BodyShort>
                </Checkbox>
                {barn.manueltRegistrert && !erLesevisning && (
                    <Box asChild height={'space-32'}>
                        <Button
                            variant={'tertiary'}
                            id={`fjern__${barn.ident}`}
                            size={'small'}
                            type={'button'}
                            onClick={onFjern}
                            icon={<TrashIcon />}
                            disabled={isSubmitting}
                        >
                            Fjern barn
                        </Button>
                    </Box>
                )}
            </HStack>
        </Box>
    );
}

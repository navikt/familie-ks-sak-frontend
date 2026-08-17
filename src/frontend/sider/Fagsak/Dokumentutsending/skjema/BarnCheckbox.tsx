import type { IBarnMedOpplysninger } from '@typer/søknad';
import { lagBarnLabel } from '@utils/formatter';
import { useFormContext } from 'react-hook-form';

import { TrashIcon } from '@navikt/aksel-icons';
import { BodyShort, Box, Button, Checkbox, HStack } from '@navikt/ds-react';

import type { DokumentutsendingFormValues } from './useDokumentutsendingSkjema';
import { DokumentutsendingFeltnavn } from './useDokumentutsendingSkjema';

interface Props {
    barn: IBarnMedOpplysninger;
}

export function BarnCheckbox({ barn }: Props) {
    const { getValues, setValue } = useFormContext<DokumentutsendingFormValues>();

    const navnOgIdentTekst = lagBarnLabel(barn);

    const fjernBarn = () => {
        setValue(
            DokumentutsendingFeltnavn.VALGTE_BARN,
            getValues(DokumentutsendingFeltnavn.VALGTE_BARN).filter(
                (barnMedOpplysninger: IBarnMedOpplysninger) =>
                    barnMedOpplysninger.ident !== barn.ident ||
                    barnMedOpplysninger.navn !== barn.navn ||
                    barnMedOpplysninger.fødselsdato !== barn.fødselsdato
            ),
            { shouldValidate: true }
        );
    };

    return (
        <HStack wrap={false} gap={'space-16'}>
            <Box marginInline={'space-16 space-0'}>
                <Checkbox value={barn.ident}>
                    <BodyShort truncate title={navnOgIdentTekst}>
                        {navnOgIdentTekst}
                    </BodyShort>
                </Checkbox>
            </Box>
            {barn.manueltRegistrert && (
                <Box asChild height={'space-32'}>
                    <Button
                        variant={'tertiary'}
                        id={`fjern__${barn.ident}`}
                        size={'small'}
                        type={'button'}
                        onClick={fjernBarn}
                        icon={<TrashIcon />}
                    >
                        {'Fjern barn'}
                    </Button>
                </Box>
            )}
        </HStack>
    );
}

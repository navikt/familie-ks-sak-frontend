import type { IBarnMedOpplysninger } from '@typer/søknad';
import { lagBarnLabel } from '@utils/formatter';

import { TrashIcon } from '@navikt/aksel-icons';
import { BodyShort, Box, Button, Checkbox, HStack } from '@navikt/ds-react';
import type { Felt } from '@navikt/familie-skjema';

interface IProps {
    barn: IBarnMedOpplysninger;
    barnIBrevFelt: Felt<IBarnMedOpplysninger[]>;
}

const BarnCheckbox = ({ barn, barnIBrevFelt }: IProps) => {
    const navnOgIdentTekst = lagBarnLabel(barn);

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
                        onClick={() => {
                            barnIBrevFelt.validerOgSettFelt([
                                ...barnIBrevFelt.verdi.filter(
                                    barnIBrev =>
                                        barnIBrev.ident !== barn.ident ||
                                        barnIBrev.navn !== barn.navn ||
                                        barnIBrev.fødselsdato !== barn.fødselsdato
                                ),
                            ]);
                        }}
                        icon={<TrashIcon />}
                    >
                        {'Fjern barn'}
                    </Button>
                </Box>
            )}
        </HStack>
    );
};

export default BarnCheckbox;

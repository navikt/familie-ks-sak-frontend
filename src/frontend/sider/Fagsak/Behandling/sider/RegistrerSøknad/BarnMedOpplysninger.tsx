import { useErLesevisning } from '@hooks/useErLesevisning';
import type { IBarnMedOpplysninger } from '@typer/søknad';
import { formaterIdent, hentAlderSomString } from '@utils/formatter';
import classNames from 'classnames';
import { useFormContext } from 'react-hook-form';

import { BodyShort, Box, Button, Checkbox, HStack } from '@navikt/ds-react';

import styles from './BarnMedOpplysninger.module.css';
import { RegistrerSøknadFelt, type RegistrerSøknadFormValues, useSøknadContext } from './SøknadContext';
import Slett from '../../../../../ikoner/Slett';

interface IProps {
    barn: IBarnMedOpplysninger;
}

export const BarnMedOpplysninger = ({ barn }: IProps) => {
    const { barnMedLøpendeUtbetaling } = useSøknadContext();

    const erLesevisning = useErLesevisning();

    const { getValues, setValue } = useFormContext<RegistrerSøknadFormValues>();

    const barnetHarLøpendeUtbetaling = barnMedLøpendeUtbetaling.has(barn.ident);

    const navnOgIdentTekst = `${barn.navn ?? 'Navn ukjent'} (${hentAlderSomString(
        barn.fødselsdato
    )}) | ${formaterIdent(barn.ident)} ${barnetHarLøpendeUtbetaling ? '(løpende)' : ''}`;

    const fjernBarn = () => {
        setValue(
            RegistrerSøknadFelt.BARNA_MED_OPPLYSNINGER,
            getValues(RegistrerSøknadFelt.BARNA_MED_OPPLYSNINGER).filter(
                barnMedOpplysninger =>
                    barnMedOpplysninger.ident !== barn.ident ||
                    barnMedOpplysninger.navn !== barn.navn ||
                    barnMedOpplysninger.fødselsdato !== barn.fødselsdato
            ),
            { shouldValidate: true, shouldDirty: true }
        );
    };

    return (
        <HStack gap={'space-16'}>
            {erLesevisning ? (
                barn.merket ? (
                    <BodyShort
                        title={navnOgIdentTekst}
                        className={classNames('skjemaelement', 'lese-felt')}
                        children={navnOgIdentTekst}
                    />
                ) : null
            ) : (
                <Box marginInline={'space-16 space-0'}>
                    <Checkbox className={styles.checkbox} value={barn.ident}>
                        <HStack className={styles.labelContent}>
                            <p title={navnOgIdentTekst}>{navnOgIdentTekst}</p>
                        </HStack>
                    </Checkbox>
                </Box>
            )}
            {barn.manueltRegistrert && !erLesevisning && (
                <Button
                    variant={'tertiary'}
                    id={`fjern__${barn.ident}`}
                    size={'small'}
                    icon={<Slett />}
                    onClick={fjernBarn}
                >
                    {'Fjern barn'}
                </Button>
            )}
        </HStack>
    );
};

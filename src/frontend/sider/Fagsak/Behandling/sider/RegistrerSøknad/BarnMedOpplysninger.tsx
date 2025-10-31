import classNames from 'classnames';

import { BodyShort, Button, Checkbox, HStack } from '@navikt/ds-react';

import styles from './BarnMedOpplysninger.module.css';
import { useSøknadContext } from './SøknadContext';
import Slett from '../../../../../ikoner/Slett';
import type { IBarnMedOpplysninger } from '../../../../../typer/søknad';
import { formaterIdent, hentAlderSomString } from '../../../../../utils/formatter';
import { useBehandlingContext } from '../../context/BehandlingContext';

interface IProps {
    barn: IBarnMedOpplysninger;
}

const BarnMedOpplysninger = ({ barn }: IProps) => {
    const { skjema, barnMedLøpendeUtbetaling } = useSøknadContext();
    const { vurderErLesevisning } = useBehandlingContext();
    const erLesevisning = vurderErLesevisning();
    const barnetHarLøpendeUtbetaling = barnMedLøpendeUtbetaling.has(barn.ident);

    const navnOgIdentTekst = `${barn.navn ?? 'Navn ukjent'} (${hentAlderSomString(
        barn.fødselsdato
    )}) | ${formaterIdent(barn.ident)} ${barnetHarLøpendeUtbetaling ? '(løpende)' : ''}`;

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
                <Checkbox className={styles.checkbox} value={barn.ident}>
                    <HStack className={styles.labelContent}>
                        <p title={navnOgIdentTekst}>{navnOgIdentTekst}</p>
                    </HStack>
                </Checkbox>
            )}
            {barn.manueltRegistrert && !erLesevisning && (
                <Button
                    variant={'tertiary'}
                    id={`fjern__${barn.ident}`}
                    size={'small'}
                    icon={<Slett />}
                    onClick={() => {
                        skjema.felter.barnaMedOpplysninger.validerOgSettFelt([
                            ...skjema.felter.barnaMedOpplysninger.verdi.filter(
                                barnMedOpplysninger =>
                                    barnMedOpplysninger.ident !== barn.ident ||
                                    barnMedOpplysninger.navn !== barn.navn ||
                                    barnMedOpplysninger.fødselsdato !== barn.fødselsdato
                            ),
                        ]);
                    }}
                >
                    {'Fjern barn'}
                </Button>
            )}
        </HStack>
    );
};
export default BarnMedOpplysninger;

import {
    CalendarIcon,
    FlowerPetalFallingIcon,
    GlobeIcon,
    HeartIcon,
    HouseIcon,
    InformationSquareIcon,
    PassportIcon,
} from '@navikt/aksel-icons';
import { Box, Detail, Heading, InfoCard } from '@navikt/ds-react';
import { Space16 } from '@navikt/ds-tokens/dist/tokens';

import styles from './Registeropplysninger.module.css';
import RegisteropplysningerTabell from './RegisteropplysningerTabell';
import type { IRestRegisterhistorikk } from '../../../../../../typer/person';
import { Registeropplysning } from '../../../../../../typer/registeropplysning';
import { Datoformat, isoStringTilFormatertString } from '../../../../../../utils/dato';

interface IRegisteropplysningerProps {
    opplysninger: IRestRegisterhistorikk;
    fødselsdato: string;
}

const Registeropplysninger = ({ opplysninger, fødselsdato }: IRegisteropplysningerProps) => {
    const manglerRegisteropplysninger = opplysninger.statsborgerskap.length === 0;

    const personErDød = opplysninger.dødsboadresse.length > 0;

    return (
        <>
            <Heading level={'3'} className={styles.regularHeading} size="medium">
                Registeropplysninger
            </Heading>
            {manglerRegisteropplysninger ? (
                <Box marginBlock={'space-16 space-0'}>
                    <InfoCard data-color="info">
                        <InfoCard.Message icon={<InformationSquareIcon aria-hidden />}>
                            Det ble ikke hentet inn registeropplysninger på denne behandlingen.
                        </InfoCard.Message>
                    </InfoCard>
                </Box>
            ) : (
                <Box width={'32rem'}>
                    <Detail
                        textColor="subtle"
                        style={{ marginBottom: Space16 }}
                        children={
                            'Sist hentet fra Folkeregisteret ' +
                            isoStringTilFormatertString({
                                isoString: opplysninger.hentetTidspunkt,
                                tilFormat: Datoformat.DATO_TID_SEKUNDER,
                            })
                        }
                    />
                    <RegisteropplysningerTabell
                        opplysningstype={Registeropplysning.FØDSELSDATO}
                        ikon={<CalendarIcon fontSize={'1.5rem'} title="Kalender-ikon" focusable="false" />}
                        historikk={[
                            {
                                verdi: isoStringTilFormatertString({
                                    isoString: fødselsdato,
                                    tilFormat: Datoformat.DATO,
                                }),
                            },
                        ]}
                    />
                    {personErDød && (
                        <RegisteropplysningerTabell
                            opplysningstype={Registeropplysning.DØDSBOADRESSE}
                            ikon={<FlowerPetalFallingIcon fontSize={'1.5rem'} title="Blomst-ikon" focusable="false" />}
                            historikk={opplysninger.dødsboadresse}
                        />
                    )}
                    <RegisteropplysningerTabell
                        opplysningstype={Registeropplysning.SIVILSTAND}
                        ikon={<HeartIcon fontSize={'1.5rem'} title="Hjerte-ikon" focusable="false" />}
                        historikk={opplysninger.sivilstand}
                    />
                    <RegisteropplysningerTabell
                        opplysningstype={Registeropplysning.OPPHOLD}
                        ikon={<PassportIcon fontSize={'1.5rem'} title="Pass-ikon" focusable="false" />}
                        historikk={opplysninger.oppholdstillatelse}
                    />
                    <RegisteropplysningerTabell
                        opplysningstype={Registeropplysning.STATSBORGERSKAP}
                        ikon={<GlobeIcon fontSize={'1.5rem'} title="Globe-ikon" focusable="false" />}
                        historikk={opplysninger.statsborgerskap}
                    />
                    <RegisteropplysningerTabell
                        opplysningstype={Registeropplysning.BOSTEDSADRESSE}
                        ikon={<HouseIcon fontSize={'1.5rem'} title="Hjem-ikon" focusable="false" />}
                        historikk={opplysninger.bostedsadresse}
                    />
                    <RegisteropplysningerTabell
                        opplysningstype={Registeropplysning.OPPHOLDSADRESSE}
                        ikon={<HouseIcon fontSize={'1.5rem'} title="Hjem-ikon" focusable="false" />}
                        historikk={opplysninger.oppholdsadresse}
                    />
                </Box>
            )}
        </>
    );
};

export default Registeropplysninger;

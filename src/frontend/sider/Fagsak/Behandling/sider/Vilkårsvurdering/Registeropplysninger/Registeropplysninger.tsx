import React from 'react';

import styled from 'styled-components';

import {
    CalendarIcon,
    FlowerPetalFallingIcon,
    GlobeIcon,
    HeartIcon,
    HouseIcon,
    PassportIcon,
} from '@navikt/aksel-icons';
import { Alert, Detail, Heading } from '@navikt/ds-react';
import { AFontWeightRegular, ASpacing4 } from '@navikt/ds-tokens/dist/tokens';

import RegisteropplysningerTabell from './RegisteropplysningerTabell';
import { useAppContext } from '../../../../../../context/AppContext';
import type { IRestRegisterhistorikk } from '../../../../../../typer/person';
import { Registeropplysning } from '../../../../../../typer/registeropplysning';
import { ToggleNavn } from '../../../../../../typer/toggles';
import { Datoformat, isoStringTilFormatertString } from '../../../../../../utils/dato';

const Container = styled.div`
    width: 32rem;
`;

const SemiBoldHeading = styled(Heading)`
    font-weight: ${AFontWeightRegular};
`;

interface IRegisteropplysningerProps {
    opplysninger: IRestRegisterhistorikk;
    fødselsdato: string;
}

const Registeropplysninger: React.FC<IRegisteropplysningerProps> = ({
    opplysninger,
    fødselsdato,
}) => {
    const { toggles } = useAppContext();
    const manglerRegisteropplysninger = opplysninger.statsborgerskap.length === 0;

    const personErDød = opplysninger.dødsboadresse.length > 0;

    return (
        <>
            <SemiBoldHeading level={'3'} size="medium">
                Registeropplysninger
            </SemiBoldHeading>
            {manglerRegisteropplysninger ? (
                <Alert variant="info" style={{ marginTop: ASpacing4 }}>
                    Det ble ikke hentet inn registeropplysninger på denne behandlingen.
                </Alert>
            ) : (
                <Container>
                    <Detail
                        textColor="subtle"
                        style={{ marginBottom: ASpacing4 }}
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
                        ikon={
                            <CalendarIcon
                                fontSize={'1.5rem'}
                                title="Kalender-ikon"
                                focusable="false"
                            />
                        }
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
                            ikon={
                                <FlowerPetalFallingIcon
                                    fontSize={'1.5rem'}
                                    title="Blomst-ikon"
                                    focusable="false"
                                />
                            }
                            historikk={opplysninger.dødsboadresse}
                        />
                    )}
                    <RegisteropplysningerTabell
                        opplysningstype={Registeropplysning.SIVILSTAND}
                        ikon={
                            <HeartIcon fontSize={'1.5rem'} title="Hjerte-ikon" focusable="false" />
                        }
                        historikk={opplysninger.sivilstand}
                    />
                    <RegisteropplysningerTabell
                        opplysningstype={Registeropplysning.OPPHOLD}
                        ikon={
                            <PassportIcon fontSize={'1.5rem'} title="Pass-ikon" focusable="false" />
                        }
                        historikk={opplysninger.oppholdstillatelse}
                    />
                    <RegisteropplysningerTabell
                        opplysningstype={Registeropplysning.STATSBORGERSKAP}
                        ikon={
                            <GlobeIcon fontSize={'1.5rem'} title="Globe-ikon" focusable="false" />
                        }
                        historikk={opplysninger.statsborgerskap}
                    />
                    <RegisteropplysningerTabell
                        opplysningstype={Registeropplysning.BOSTEDSADRESSE}
                        ikon={<HouseIcon fontSize={'1.5rem'} title="Hjem-ikon" focusable="false" />}
                        historikk={opplysninger.bostedsadresse}
                    />
                    {toggles[ToggleNavn.skalViseOppholdsadresse] && (
                        <RegisteropplysningerTabell
                            opplysningstype={Registeropplysning.OPPHOLDSADRESSE}
                            ikon={
                                <HouseIcon
                                    fontSize={'1.5rem'}
                                    title="Hjem-ikon"
                                    focusable="false"
                                />
                            }
                            historikk={opplysninger.oppholdsadresse}
                        />
                    )}
                </Container>
            )}
        </>
    );
};

export default Registeropplysninger;

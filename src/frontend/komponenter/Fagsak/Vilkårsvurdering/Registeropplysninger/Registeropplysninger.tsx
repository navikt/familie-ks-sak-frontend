import React from 'react';

import styled from 'styled-components';

import { FlowerBladeFall, Globe, Heart, Home, Passport } from '@navikt/ds-icons';
import { Alert, Detail, Heading } from '@navikt/ds-react';
import { AFontWeightRegular, ASpacing4 } from '@navikt/ds-tokens/dist/tokens';

import RegisteropplysningerTabell from './RegisteropplysningerTabell';
import type { IRestRegisterhistorikk } from '../../../../typer/person';
import { Registeropplysning } from '../../../../typer/registeropplysning';
import { Datoformat, isoStringTilFormatertString } from '../../../../utils/dato';

const Container = styled.div`
    width: 32rem;
`;

const SemiBoldHeading = styled(Heading)`
    font-weight: ${AFontWeightRegular};
`;

interface IRegisteropplysningerProps {
    opplysninger: IRestRegisterhistorikk;
}

const Registeropplysninger: React.FC<IRegisteropplysningerProps> = ({ opplysninger }) => {
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
                    {personErDød && (
                        <RegisteropplysningerTabell
                            opplysningstype={Registeropplysning.DØDSBOADRESSE}
                            ikon={
                                <FlowerBladeFall
                                    style={{ fontSize: '1.5rem' }}
                                    aria-label="Blomst ikon"
                                    role="img"
                                    focusable="false"
                                />
                            }
                            historikk={opplysninger.dødsboadresse}
                        />
                    )}
                    <RegisteropplysningerTabell
                        opplysningstype={Registeropplysning.SIVILSTAND}
                        ikon={
                            <Heart
                                style={{ fontSize: '1.5rem' }}
                                aria-label="Hjerte ikon"
                                role="img"
                                focusable="false"
                            />
                        }
                        historikk={opplysninger.sivilstand}
                    />
                    <RegisteropplysningerTabell
                        opplysningstype={Registeropplysning.OPPHOLD}
                        ikon={
                            <Passport
                                style={{ fontSize: '1.5rem' }}
                                aria-label="Pass ikon"
                                role="img"
                                focusable="false"
                            />
                        }
                        historikk={opplysninger.oppholdstillatelse}
                    />
                    <RegisteropplysningerTabell
                        opplysningstype={Registeropplysning.STATSBORGERSKAP}
                        ikon={
                            <Globe
                                style={{ fontSize: '1.5rem' }}
                                aria-label="Globe ikon"
                                role="img"
                                focusable="false"
                            />
                        }
                        historikk={opplysninger.statsborgerskap}
                    />
                    <RegisteropplysningerTabell
                        opplysningstype={Registeropplysning.BOSTEDSADRESSE}
                        ikon={
                            <Home
                                style={{ fontSize: '1.5rem' }}
                                aria-label="Hjem ikon"
                                role="img"
                                focusable="false"
                            />
                        }
                        historikk={opplysninger.bostedsadresse}
                    />
                </Container>
            )}
        </>
    );
};

export default Registeropplysninger;

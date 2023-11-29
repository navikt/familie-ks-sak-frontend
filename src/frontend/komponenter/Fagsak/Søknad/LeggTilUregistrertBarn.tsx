import React from 'react';

import classNames from 'classnames';
import styled from 'styled-components';

import { BodyShort, Checkbox, Label, TextField } from '@navikt/ds-react';
import type { ISkjema } from '@navikt/familie-skjema';

import { useBehandling } from '../../../context/behandlingContext/BehandlingContext';
import type { IPersonInfo } from '../../../typer/person';
import Datovelger from '../../Felleskomponenter/Datovelger/Datovelger';
import type { IRegistrerBarnSkjema } from '../../Felleskomponenter/LeggTilBarn';

interface IProps {
    registrerBarnSkjema: ISkjema<IRegistrerBarnSkjema, IPersonInfo>;
}

const Container = styled.div`
    margin: 1rem 0;
`;

const UregistrertBarnInputs = styled.div`
    margin: 1rem 0 1rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const LeggTilUregistrertBarn: React.FC<IProps> = ({ registrerBarnSkjema }) => {
    const { vurderErLesevisning } = useBehandling();

    return (
        <Container>
            {vurderErLesevisning() ? (
                !registrerBarnSkjema.felter.erFolkeregistrert.verdi && (
                    <BodyShort
                        children={'Barnet er ikke folkeregistrert / har ikke fødselsnummer'}
                        className={classNames('skjemaelement', 'lese-felt')}
                    />
                )
            ) : (
                <Checkbox
                    id={registrerBarnSkjema.felter.erFolkeregistrert.id}
                    value={'Barnet er ikke folkeregistrert / har ikke fødselsnummer'}
                    checked={!registrerBarnSkjema.felter.erFolkeregistrert.verdi}
                    onChange={() => {
                        registrerBarnSkjema.felter.erFolkeregistrert.validerOgSettFelt(
                            !registrerBarnSkjema.felter.erFolkeregistrert.verdi
                        );
                        registrerBarnSkjema.felter.ident.nullstill();
                    }}
                >
                    {'Barnet er ikke folkeregistrert / har ikke fødselsnummer'}
                </Checkbox>
            )}

            {registrerBarnSkjema.felter.uregistrertBarnFødselsdato.erSynlig &&
                registrerBarnSkjema.felter.uregistrertBarnNavn.erSynlig && (
                    <UregistrertBarnInputs>
                        <Label>Tilgjengelige opplysninger om barnet</Label>
                        <Datovelger
                            felt={registrerBarnSkjema.felter.uregistrertBarnFødselsdato}
                            label={'Fødselsdato (valgfri)'}
                            datoMåFyllesUt={false}
                            visFeilmeldinger={registrerBarnSkjema.visFeilmeldinger}
                            kanKunVelgeFortid
                        />
                        <TextField
                            {...registrerBarnSkjema.felter.uregistrertBarnNavn.hentNavInputProps(
                                registrerBarnSkjema.visFeilmeldinger
                            )}
                            label={'Barnets navn'}
                        />
                    </UregistrertBarnInputs>
                )}
        </Container>
    );
};

export default LeggTilUregistrertBarn;

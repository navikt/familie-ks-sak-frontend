import React from 'react';

import styled from 'styled-components';

import { Label, Radio, RadioGroup, TextField } from '@navikt/ds-react';
import { ASpacing3 } from '@navikt/ds-tokens/dist/tokens';
import type { ISkjema } from '@navikt/familie-skjema';
import { Valideringsstatus } from '@navikt/familie-skjema';
import type { Country } from '@navikt/land-verktoy';

import Månedvelger, { DagIMåneden } from '../../../../../../komponenter/Datovelger/Månedvelger';
import type { IBehandling } from '../../../../../../typer/behandling';
import type { IRefusjonEøsSkjemaFelter } from '../../../../../../typer/refusjon-eøs';
import { randomUUID } from '../../../../../../utils/commons';
import { useBehandlingContext } from '../../../context/BehandlingContext';
import { FamilieLandvelger } from '../../Behandlingsresultat/Eøs/EøsKomponenter/FamilieLandvelger';

interface IRefusjonEøsSkjemaProps {
    skjema: ISkjema<IRefusjonEøsSkjemaFelter, IBehandling>;
}

const StyledFamilieLandvelger = styled(FamilieLandvelger)`
    max-width: 24rem;
    > * {
        margin: 0;
    }
`;

const FlexDatoInputWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${ASpacing3};
`;

const FlexRowDiv = styled.div`
    display: flex;
`;

const StyledTextField = styled(TextField)`
    width: 11rem;
    .navds-label {
        width: 18rem;
    }
    .navds-text-field__input {
        width: 11rem;
    }
`;

const RefusjonEøsSkjema: React.FunctionComponent<IRefusjonEøsSkjemaProps> = ({ skjema }) => {
    const { vurderErLesevisning } = useBehandlingContext();
    const erLesevisning = vurderErLesevisning();

    const inputUuid = randomUUID();
    return (
        <>
            <StyledFamilieLandvelger
                erLesevisning={erLesevisning}
                label={'EØS-land'}
                id={`refusjon-eøs-land-${inputUuid}`}
                value={skjema.felter.land.verdi}
                placeholder={'Velg'}
                onChange={(value: Country) => {
                    skjema.felter.land.validerOgSettFelt(value.value);
                }}
                kunEøs
                eksluderLand={['NO']}
                feil={
                    skjema.visFeilmeldinger &&
                    skjema.felter.land.valideringsstatus === Valideringsstatus.FEIL
                        ? skjema.felter.land.feilmelding?.toString()
                        : ''
                }
            />

            <RadioGroup
                readOnly={erLesevisning}
                legend="Tekst i vedtaksbrev"
                value={skjema.felter.refusjonAvklart.verdi}
                onChange={(val: boolean | undefined) =>
                    skjema.felter.refusjonAvklart.validerOgSettFelt(val)
                }
                error={skjema.visFeilmeldinger && skjema.felter.refusjonAvklart.feilmelding}
                size="small"
            >
                <Radio
                    name={'refusjonAvklart'}
                    value={true}
                    id={`ja-refusjon-er-avklart-${inputUuid}`}
                >
                    {'Refusjon avklart'}
                </Radio>
                <Radio
                    name={'refusjonAvklart'}
                    value={false}
                    id={`nei-refusjon-er-ikke-avklart-${inputUuid}`}
                >
                    {'Refusjon ikke avklart'}
                </Radio>
            </RadioGroup>
            <FlexDatoInputWrapper>
                <Label size="small">Angi periode som skal refunderes til EØS-land</Label>
                <FlexRowDiv style={{ gap: '2rem' }}>
                    <Månedvelger
                        felt={skjema.felter.fom}
                        label={'F.o.m'}
                        readOnly={erLesevisning}
                        visFeilmeldinger={skjema.visFeilmeldinger}
                        dagIMåneden={DagIMåneden.FØRSTE_DAG}
                        kanKunVelgeFortid
                    />
                    <Månedvelger
                        felt={skjema.felter.tom}
                        label={'T.o.m'}
                        visFeilmeldinger={skjema.visFeilmeldinger}
                        readOnly={erLesevisning}
                        dagIMåneden={DagIMåneden.SISTE_DAG}
                        tilhørendeFomFelt={skjema.felter.fom}
                        kanKunVelgeFortid
                    />
                </FlexRowDiv>
            </FlexDatoInputWrapper>
            <StyledTextField
                {...skjema.felter.refusjonsbeløp.hentNavBaseSkjemaProps(skjema.visFeilmeldinger)}
                size="small"
                label="Refusjonsbeløp (kr/mnd)"
                value={skjema.felter.refusjonsbeløp.verdi}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                onChange={changeEvent =>
                    skjema.felter.refusjonsbeløp.validerOgSettFelt(changeEvent.target.value)
                }
                readOnly={erLesevisning}
            />
        </>
    );
};

export default RefusjonEøsSkjema;

import React from 'react';

import { useLocation } from 'react-router';
import styled from 'styled-components';

import { Alert, Fieldset, HStack, Select, Spacer, TextField, VStack } from '@navikt/ds-react';
import type { ISkjema } from '@navikt/familie-skjema';
import { Valideringsstatus } from '@navikt/familie-skjema';

import type { ILeggTilFjernBrevmottakerSkjemaFelter } from './useBrevmottakerSkjema';
import { Mottaker, mottakerVisningsnavn } from './useBrevmottakerSkjema';
import type { IBehandling } from '../../../../../typer/behandling';
import { hentFrontendFeilmelding } from '../../../../../utils/ressursUtils';
import { FamilieLandvelger } from '../../../Behandling/sider/Behandlingsresultat/Eøs/EøsKomponenter/FamilieLandvelger';

const StyledTextField = styled(TextField)<{ $width: string }>`
    width: ${props => props.$width};
    height: fit-content;
`;

interface Props {
    skjema: ISkjema<ILeggTilFjernBrevmottakerSkjemaFelter, IBehandling>;
    erLesevisning: boolean;
    navnErPreutfylt: boolean;
}

const BrevmottakerSkjema = ({ erLesevisning, skjema, navnErPreutfylt }: Props) => {
    const erPåDokumentutsendingPåFagsak = useLocation().pathname.includes('dokumentutsending');

    const gyldigeMottakerTyper = erPåDokumentutsendingPåFagsak
        ? Object.values(Mottaker).filter(mottakerType => mottakerType !== Mottaker.DØDSBO)
        : Object.values(Mottaker);

    return (
        <>
            <Fieldset
                legend="Skjema for å legge til eller fjerne brevmottaker"
                hideLegend
                error={skjema.visFeilmeldinger && hentFrontendFeilmelding(skjema.submitRessurs)}
            >
                <VStack gap={'6'}>
                    <Select
                        {...skjema.felter.mottaker.hentNavBaseSkjemaProps(skjema.visFeilmeldinger)}
                        readOnly={erLesevisning}
                        label="Mottaker"
                        onChange={(event: React.ChangeEvent<HTMLSelectElement>): void => {
                            skjema.felter.mottaker.validerOgSettFelt(event.target.value as Mottaker);
                        }}
                    >
                        <option value="">Velg</option>
                        {gyldigeMottakerTyper.map(mottaker => (
                            <option value={mottaker} key={mottaker}>
                                {mottakerVisningsnavn[mottaker]}
                            </option>
                        ))}
                    </Select>
                    <TextField
                        {...skjema.felter.navn.hentNavBaseSkjemaProps(skjema.visFeilmeldinger)}
                        readOnly={erLesevisning || navnErPreutfylt}
                        label={'Navn'}
                        onChange={(event): void => {
                            skjema.felter.navn.validerOgSettFelt(event.target.value);
                        }}
                    />
                    <FamilieLandvelger
                        id={'land'}
                        value={skjema.felter.land.verdi !== '' ? skjema.felter.land.verdi : undefined}
                        label={'Land'}
                        medFlag
                        utenMargin
                        eksluderLand={
                            skjema.felter.mottaker.verdi === Mottaker.BRUKER_MED_UTENLANDSK_ADRESSE
                                ? ['NO', 'XU']
                                : ['XU']
                        }
                        feil={
                            skjema.visFeilmeldinger && skjema.felter.land.valideringsstatus === Valideringsstatus.FEIL
                                ? skjema.felter.land.feilmelding?.toString()
                                : ''
                        }
                        erLesevisning={erLesevisning}
                        onChange={land => {
                            skjema.felter.land.validerOgSettFelt(land.value);
                        }}
                    />
                    {skjema.felter.land.verdi && (
                        <>
                            <TextField
                                {...skjema.felter.adresselinje1.hentNavBaseSkjemaProps(skjema.visFeilmeldinger)}
                                readOnly={erLesevisning}
                                label={'Adresselinje 1'}
                                onChange={(event): void => {
                                    skjema.felter.adresselinje1.validerOgSettFelt(event.target.value);
                                }}
                            />
                            <TextField
                                {...skjema.felter.adresselinje2.hentNavBaseSkjemaProps(skjema.visFeilmeldinger)}
                                readOnly={erLesevisning}
                                label={'Adresselinje 2 (valgfri)'}
                                onChange={(event): void => {
                                    skjema.felter.adresselinje2.validerOgSettFelt(event.target.value);
                                }}
                            />
                            {skjema.felter.land.verdi !== 'NO' && (
                                <Alert variant="info">
                                    Ved utenlandsk adresse skal postnummer og poststed legges i adresselinjene.
                                </Alert>
                            )}
                            <HStack>
                                <StyledTextField
                                    {...skjema.felter.postnummer.hentNavBaseSkjemaProps(skjema.visFeilmeldinger)}
                                    readOnly={erLesevisning}
                                    disabled={skjema.felter.land.verdi !== 'NO'}
                                    label={'Postnummer'}
                                    onChange={(event): void => {
                                        skjema.felter.postnummer.validerOgSettFelt(event.target.value);
                                    }}
                                    $width={'10rem'}
                                />
                                <Spacer />
                                <StyledTextField
                                    {...skjema.felter.poststed.hentNavBaseSkjemaProps(skjema.visFeilmeldinger)}
                                    readOnly={erLesevisning}
                                    disabled={skjema.felter.land.verdi !== 'NO'}
                                    label={'Poststed'}
                                    onChange={(event): void => {
                                        skjema.felter.poststed.validerOgSettFelt(event.target.value);
                                    }}
                                    $width={'19.5rem'}
                                />
                            </HStack>
                        </>
                    )}
                </VStack>
            </Fieldset>
        </>
    );
};

export default BrevmottakerSkjema;

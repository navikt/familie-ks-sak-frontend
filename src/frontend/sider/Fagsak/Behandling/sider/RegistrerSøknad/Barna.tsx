import { differenceInMilliseconds } from 'date-fns';

import { Alert, CheckboxGroup, Heading, HStack, Label, VStack } from '@navikt/ds-react';

import BarnMedOpplysninger from './BarnMedOpplysninger';
import { useSøknadContext } from './SøknadContext';
import RødError from '../../../../../ikoner/RødError';
import type { IForelderBarnRelasjonMaskert } from '../../../../../typer/person';
import { adressebeskyttelsestyper, ForelderBarnRelasjonRolle } from '../../../../../typer/person';
import type { IBarnMedOpplysninger } from '../../../../../typer/søknad';
import { isoStringTilDate } from '../../../../../utils/dato';
import { useBrukerContext } from '../../../BrukerContext';
import { useBehandlingContext } from '../../context/BehandlingContext';

const Barna = () => {
    const { vurderErLesevisning } = useBehandlingContext();
    const lesevisning = vurderErLesevisning();
    const { bruker } = useBrukerContext();
    const { skjema } = useSøknadContext();

    const sorterteBarnMedOpplysninger = skjema.felter.barnaMedOpplysninger.verdi.sort(
        (a: IBarnMedOpplysninger, b: IBarnMedOpplysninger) => {
            if (!a.fødselsdato) {
                return 1;
            }

            if (!b.fødselsdato) {
                return -1;
            }

            return !a.ident
                ? 1
                : differenceInMilliseconds(isoStringTilDate(b.fødselsdato), isoStringTilDate(a.fødselsdato));
        }
    );

    const maskerteRelasjoner = bruker.forelderBarnRelasjonMaskert.filter(
        (forelderBarnRelasjonMaskert: IForelderBarnRelasjonMaskert) =>
            forelderBarnRelasjonMaskert.relasjonRolle === ForelderBarnRelasjonRolle.BARN
    );

    const oppdaterBarnMedMerketStatus = (barnaSomErSjekketAv: string[]) => {
        skjema.felter.barnaMedOpplysninger.validerOgSettFelt(
            skjema.felter.barnaMedOpplysninger.verdi.map((barnMedOpplysninger: IBarnMedOpplysninger) => ({
                ...barnMedOpplysninger,
                merket: barnaSomErSjekketAv.includes(barnMedOpplysninger.ident),
            }))
        );
    };

    return (
        <VStack marginBlock={'space-16'}>
            <Heading size={'medium'} level={'2'} children={'Opplysninger om barn'} />
            {maskerteRelasjoner.map((forelderBarnRelasjonMaskert: IForelderBarnRelasjonMaskert, index: number) => {
                return (
                    <HStack
                        margin={'space-8'}
                        align="center"
                        wrap={false}
                        key={`${index}_${forelderBarnRelasjonMaskert.relasjonRolle}`}
                    >
                        <HStack marginInline={'space-0 space-16'}>
                            <RødError height={24} width={24} />
                        </HStack>
                        {`Bruker har barn med diskresjonskode ${
                            adressebeskyttelsestyper[forelderBarnRelasjonMaskert.adressebeskyttelseGradering] ??
                            'ukjent'
                        }`}
                    </HStack>
                );
            })}
            <br />
            <CheckboxGroup
                {...skjema.felter.barnaMedOpplysninger.hentNavBaseSkjemaProps(skjema.visFeilmeldinger)}
                legend={
                    !lesevisning ? <Label>Velg hvilke barn det er søkt om</Label> : <Label>Barn det er søkt om</Label>
                }
                value={skjema.felter.barnaMedOpplysninger.verdi
                    .filter(barnMedOpplysninger => barnMedOpplysninger.merket)
                    .map(barnMedOpplysninger => barnMedOpplysninger.ident)}
                onChange={(merkedeBarn: string[]) => oppdaterBarnMedMerketStatus(merkedeBarn)}
            >
                {sorterteBarnMedOpplysninger.map((barnMedOpplysninger: IBarnMedOpplysninger) => (
                    <BarnMedOpplysninger key={barnMedOpplysninger.ident} barn={barnMedOpplysninger} />
                ))}
                {sorterteBarnMedOpplysninger.length === 0 && maskerteRelasjoner.length === 0 && (
                    <VStack marginBlock={'space-0 space-20'}>
                        <Alert variant="info" children={'Folkeregisteret har ikke registrerte barn på denne søkeren'} />
                    </VStack>
                )}
            </CheckboxGroup>
        </VStack>
    );
};

export default Barna;

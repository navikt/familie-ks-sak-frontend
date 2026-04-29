import { BodyShort, CopyButton, Heading, HStack } from '@navikt/ds-react';

import { useBruker } from '../../hooks/useBruker';
import { type IGrunnlagPerson, type IPersonInfo, personTypeMap } from '../../typer/person';
import { formaterIdent, hentAlder } from '../../utils/formatter';
import DødsfallTag from '../DødsfallTag';
import { PersonIkon } from '../PersonIkon';
import Styles from './PersonInformasjon.module.css';
import { erAdresseBeskyttet } from '../../utils/validators';

function hentAdresseBeskyttelseGradering(bruker: IPersonInfo, personIdent: string): boolean | undefined {
    if (bruker.personIdent === personIdent) {
        return erAdresseBeskyttet(bruker.adressebeskyttelseGradering);
    }
    const forelderBarnRelasjon = bruker.forelderBarnRelasjon.find(rel => rel.personIdent === personIdent);
    if (forelderBarnRelasjon?.personIdent === personIdent) {
        return erAdresseBeskyttet(forelderBarnRelasjon.adressebeskyttelseGradering);
    }
}

function Skillelinje({ erHeading = false }: { erHeading?: boolean }) {
    if (erHeading) {
        return (
            <Heading level={'2'} size={'medium'} as={'span'}>
                |
            </Heading>
        );
    }
    return <BodyShort>|</BodyShort>;
}

interface Props {
    person: IGrunnlagPerson;
}

export function PersonInformasjon({ person }: Props) {
    const bruker = useBruker();

    const alder = hentAlder(person.fødselsdato);
    const navnOgAlder = `${person.navn} (${alder} år)`;
    const formatertIdent = formaterIdent(person.personIdent);

    const erAdresseBeskyttet = hentAdresseBeskyttelseGradering(bruker, person.personIdent);
    const erEgenAnsatt = bruker.erEgenAnsatt;

    return (
        <HStack gap={'space-24'} wrap={false} align={'center'}>
            <PersonIkon
                erBarn={alder < 18}
                kjønn={person.kjønn}
                størrelse={'m'}
                erAdresseBeskyttet={erAdresseBeskyttet}
                erEgenAnsatt={erEgenAnsatt}
            />
            <HStack gap={'space-24'} align={'center'} wrap={false}>
                <Heading level={'2'} size={'medium'} title={navnOgAlder} className={Styles.headingUtenOverflow}>
                    {navnOgAlder}
                </Heading>
                <Skillelinje erHeading={true} />
                <HStack gap={'space-4'} align={'center'} wrap={false}>
                    <Heading level={'2'} size={'medium'} as={'span'}>
                        {formatertIdent}
                    </Heading>
                    <CopyButton size={'small'} copyText={person.personIdent} />
                </HStack>
                <Skillelinje erHeading={true} />
                <Heading level={'2'} size={'medium'} as={'span'}>{`${personTypeMap[person.type]}`}</Heading>
                {person.dødsfallDato?.length && <DødsfallTag dødsfallDato={person.dødsfallDato} />}
            </HStack>
        </HStack>
    );
}

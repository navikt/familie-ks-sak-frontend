import { BodyShort, CopyButton, HStack } from '@navikt/ds-react';

import { useBruker } from '../../../hooks/useBruker';
import { PersonIkon } from '../../../komponenter/PersonIkon';
import { type IGrunnlagPerson, type IPersonInfo, personTypeMap } from '../../../typer/person';
import { formaterIdent, hentAlder } from '../../../utils/formatter';
import { erAdresseBeskyttet } from '../../../utils/validators';

function hentAdresseBeskyttelseGradering(bruker: IPersonInfo, personIdent: string): boolean | undefined {
    if (bruker.personIdent === personIdent) {
        return erAdresseBeskyttet(bruker.adressebeskyttelseGradering);
    }
    const forelderBarnRelasjon = bruker.forelderBarnRelasjon.find(rel => rel.personIdent === personIdent);
    if (forelderBarnRelasjon?.personIdent === personIdent) {
        return erAdresseBeskyttet(forelderBarnRelasjon.adressebeskyttelseGradering);
    }
}

interface Props {
    person: IGrunnlagPerson;
}

export function PersonInformasjonUtbetaling({ person }: Props) {
    const bruker = useBruker();

    const alder = hentAlder(person.fødselsdato);
    const navnOgAlder = `${person.navn} (${alder} år)`;
    const formatertIdent = formaterIdent(person.personIdent);

    const erAdresseBeskyttet = hentAdresseBeskyttelseGradering(bruker, person.personIdent);
    const erEgenAnsatt = bruker.erEgenAnsatt;

    return (
        <HStack gap={'space-8'} align={'center'} wrap={false}>
            <PersonIkon
                erBarn={alder < 18}
                kjønn={person.kjønn}
                størrelse={'m'}
                erAdresseBeskyttet={erAdresseBeskyttet}
                erEgenAnsatt={erEgenAnsatt}
            />
            <BodyShort className={'navn'} title={navnOgAlder}>
                {navnOgAlder}
            </BodyShort>
            <BodyShort>|</BodyShort>
            <HStack gap={'space-4'} wrap={false} align={'center'}>
                <BodyShort>{formatertIdent}</BodyShort>
                <CopyButton size={'small'} copyText={person.personIdent} />
            </HStack>
            <BodyShort>|</BodyShort>
            <BodyShort>{`${personTypeMap[person.type]} `}</BodyShort>
        </HStack>
    );
}

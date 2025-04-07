import * as React from 'react';

import styled from 'styled-components';

import { BodyShort, CopyButton, Heading, HStack } from '@navikt/ds-react';
import { FamilieIkonVelger } from '@navikt/familie-ikoner';

import type { IGrunnlagPerson } from '../../typer/person';
import { personTypeMap } from '../../typer/person';
import { hentAlder, formaterIdent } from '../../utils/formatter';
import DødsfallTag from '../DødsfallTag';

interface IProps {
    person: IGrunnlagPerson;
    somOverskrift?: boolean;
    width?: string;
}

const HeadingUtenOverflow = styled(Heading)`
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const Skillelinje: React.FC<{ erHeading?: boolean }> = ({ erHeading = false }) => {
    if (erHeading) {
        return (
            <Heading level="2" size="medium" as="span">
                |
            </Heading>
        );
    }
    return <BodyShort>|</BodyShort>;
};

const PersonInformasjon: React.FunctionComponent<IProps> = ({ person, somOverskrift = false }) => {
    const alder = hentAlder(person.fødselsdato);
    const navnOgAlder = `${person.navn} (${alder} år)`;
    const formatertIdent = formaterIdent(person.personIdent);

    if (somOverskrift) {
        return (
            <HStack gap="6" wrap={false} align="center">
                <FamilieIkonVelger className={'familie-ikon'} alder={alder} kjønn={person.kjønn} />
                <HStack gap="4" align="center" wrap={false}>
                    <HeadingUtenOverflow level="2" size="medium" title={navnOgAlder}>
                        {navnOgAlder}
                    </HeadingUtenOverflow>
                    <Skillelinje erHeading />
                    <HStack gap="1" wrap={false} align="center">
                        <Heading level="2" size="medium" as="span">
                            {formatertIdent}
                        </Heading>
                        <CopyButton size="small" copyText={person.personIdent} />
                    </HStack>
                    <Skillelinje erHeading />
                    <Heading level="2" size="medium" as="span">{`${
                        personTypeMap[person.type]
                    } `}</Heading>
                    {person.dødsfallDato?.length && (
                        <DødsfallTag dødsfallDato={person.dødsfallDato} />
                    )}
                </HStack>
            </HStack>
        );
    }

    return (
        <HStack gap="2" align="center" wrap={false}>
            <FamilieIkonVelger
                className={'familie-ikon--for-normaltekst'}
                width={24}
                height={24}
                alder={alder}
                kjønn={person.kjønn}
            />
            <BodyShort className={'navn'} title={navnOgAlder}>
                {navnOgAlder}
            </BodyShort>
            <Skillelinje />
            <HStack gap="1" wrap={false} align="center">
                <BodyShort>{formatertIdent}</BodyShort>
                <CopyButton size="small" copyText={person.personIdent} />
            </HStack>
            <Skillelinje />
            <BodyShort>{`${personTypeMap[person.type]} `}</BodyShort>
        </HStack>
    );
};

export default PersonInformasjon;

import * as React from 'react';

import styled from 'styled-components';

import { BodyShort, CopyButton, Heading } from '@navikt/ds-react';
import { FamilieIkonVelger } from '@navikt/familie-ikoner';

import type { IGrunnlagPerson } from '../../../typer/person';
import { personTypeMap } from '../../../typer/person';
import { hentAlder, formaterIdent } from '../../../utils/formatter';
import DødsfallTag from '../DødsfallTag';

interface IProps {
    person: IGrunnlagPerson;
    somOverskrift?: boolean;
    width?: string;
}

const FlexBox = styled.div`
    display: flex;
    align-items: center;
    gap: 0.25rem;
`;

const PersonInformasjon: React.FunctionComponent<IProps> = ({ person, somOverskrift = false }) => {
    const alder = hentAlder(person.fødselsdato);
    const navnOgAlder = `${person.navn} (${alder} år)`;
    const formatertIdent = formaterIdent(person.personIdent);

    return (
        <div className={'personinformasjon'}>
            {somOverskrift && (
                <>
                    <FamilieIkonVelger
                        className={'familie-ikon'}
                        alder={alder}
                        kjønn={person.kjønn}
                    />
                    <Heading level="2" size="medium" className={'navn'} title={navnOgAlder}>
                        {navnOgAlder}
                    </Heading>
                    <Heading level="2" size="medium" as="span">
                        &ensp;|&ensp;
                    </Heading>
                    <FlexBox>
                        <Heading level="2" size="medium" as="span">
                            {formatertIdent}
                        </Heading>
                        <CopyButton size="small" copyText={person.personIdent} />
                    </FlexBox>
                    <Heading level="2" size="medium" as="span">
                        &ensp;|&ensp;
                    </Heading>
                    <Heading level="2" size="medium" as="span">{`${
                        personTypeMap[person.type]
                    } `}</Heading>
                    {person.dødsfallDato?.length && (
                        <>
                            <Heading level="2" size="medium" as="span">
                                &ensp;&ensp;
                            </Heading>
                            <DødsfallTag dødsfallDato={person.dødsfallDato} />
                        </>
                    )}
                </>
            )}

            {!somOverskrift && (
                <>
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
                    <BodyShort>&ensp;|&ensp;</BodyShort>
                    <FlexBox>
                        <BodyShort>{formatertIdent}</BodyShort>
                        <CopyButton size="small" copyText={person.personIdent} />
                    </FlexBox>
                    <BodyShort>&ensp;|&ensp;</BodyShort>
                    <BodyShort>{`${personTypeMap[person.type]} `}</BodyShort>
                </>
            )}
        </div>
    );
};

export default PersonInformasjon;

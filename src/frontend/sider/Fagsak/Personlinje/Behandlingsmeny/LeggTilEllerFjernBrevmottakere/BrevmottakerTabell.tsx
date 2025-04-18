import React from 'react';

import styled from 'styled-components';

import { TrashIcon } from '@navikt/aksel-icons';
import { Alert, Button, Heading, HStack, Spacer } from '@navikt/ds-react';
import { AFontWeightBold } from '@navikt/ds-tokens/dist/tokens';
import CountryData from '@navikt/land-verktoy';

import type { IRestBrevmottaker, SkjemaBrevmottaker } from './useBrevmottakerSkjema';
import { mottakerVisningsnavn } from './useBrevmottakerSkjema';

const MarginTop = styled.div`
    margin-top: 2.5rem;
`;

const DefinitionList = styled.dl`
    display: grid;
    grid-gap: 1rem;
    grid-template-columns: 10rem 20rem;
    margin-left: 1rem;

    dt {
        font-weight: ${AFontWeightBold};
    }

    dd {
        margin-left: 0;
    }
`;

interface Props<T extends SkjemaBrevmottaker | IRestBrevmottaker> {
    mottaker: T;
    fjernMottaker: (mottaker: T) => void;
    erLesevisning: boolean;
}

const BrevmottakerTabell = <T extends SkjemaBrevmottaker | IRestBrevmottaker>({
    mottaker,
    fjernMottaker,
    erLesevisning,
}: Props<T>) => {
    const land = CountryData.getCountryInstance('nb').findByValue(mottaker.landkode);

    return (
        <MarginTop>
            <HStack>
                <Heading size="medium" children={mottakerVisningsnavn[mottaker.type]} />
                {!erLesevisning && (
                    <>
                        <Spacer />
                        <Button
                            variant={'tertiary'}
                            onClick={() => fjernMottaker(mottaker)}
                            loading={false}
                            disabled={false}
                            size={'small'}
                            icon={<TrashIcon />}
                        >
                            {'Fjern'}
                        </Button>
                    </>
                )}
            </HStack>
            <DefinitionList>
                <dt>Navn</dt>
                <dd>{mottaker.navn}</dd>
                <dt>Land</dt>
                <dd>{land.label}</dd>
                <dt>Adresselinje 1</dt>
                <dd>{mottaker.adresselinje1}</dd>
                <dt>Adresselinje 2</dt>
                <dd>{mottaker.adresselinje2 || '-'}</dd>
                <dt>Postnummer</dt>
                <dd>{mottaker.postnummer || '-'}</dd>
                <dt>Poststed</dt>
                <dd>{mottaker.poststed || '-'}</dd>
            </DefinitionList>

            {mottaker.landkode !== 'NO' && (
                <Alert variant="info" inline>
                    Ved utenlandsk adresse skal postnummer og poststed legges i adresselinjene.
                </Alert>
            )}
        </MarginTop>
    );
};

export default BrevmottakerTabell;

import React from 'react';

import styled from 'styled-components';

import navFarger from 'nav-frontend-core';

import { Tag } from '@navikt/ds-react';

import { Datoformat, isoStringTilFormatertString } from '../../utils/dato';

const StyletTag = styled(Tag)`
    color: white;
    background-color: ${navFarger.navMorkGra};
    border-color: ${navFarger.navMorkGra};
`;

interface IDødsfallTagProps {
    dødsfallDato: string;
}

const DødsfallTag: React.FC<IDødsfallTagProps> = ({ dødsfallDato }) => {
    const formatertDato = isoStringTilFormatertString({
        isoString: dødsfallDato,
        tilFormat: Datoformat.DATO,
    });
    return <StyletTag variant="info">{`Død ${formatertDato}`}</StyletTag>;
};

export default DødsfallTag;

import React from 'react';

import styled from 'styled-components';

import { ArrowDownIcon, ArrowsUpDownIcon, ArrowUpIcon } from '@navikt/aksel-icons';
import { Link } from '@navikt/ds-react';

import { useBarnehagebarnInfotrygd } from '../../context/BarnehagebarnInfotrygdContext';

interface IProps {
    displayValue: string;
    fieldName: string;
}

const StyledLink = styled(Link)`
    display: block;
    text-decoration: none;
    cursor: pointer;
`;
const BarnehagebarnInfotrygdSortLink: React.FunctionComponent<IProps> = ({
    displayValue,
    fieldName,
}) => {
    const { barnehagebarnRequestParams, updateSortByAscDesc } = useBarnehagebarnInfotrygd();
    return (
        <StyledLink
            onClick={(e: Event) => {
                e.preventDefault();
                updateSortByAscDesc(fieldName);
            }}
        >
            <span title={'Sorter på: ' + displayValue}>{displayValue}</span>
            {barnehagebarnRequestParams.sortBy !== fieldName && (
                <ArrowsUpDownIcon title="Sorter" fontSize="1rem" />
            )}
            {barnehagebarnRequestParams.sortBy === fieldName &&
                barnehagebarnRequestParams.sortAsc && (
                    <ArrowUpIcon title="Sortert stigende" fontSize="1rem" />
                )}
            {barnehagebarnRequestParams.sortBy === fieldName &&
                !barnehagebarnRequestParams.sortAsc && (
                    <ArrowDownIcon title="Sortert synkende" fontSize="1rem" />
                )}
        </StyledLink>
    );
};
export default BarnehagebarnInfotrygdSortLink;

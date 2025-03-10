import React from 'react';

import styled from 'styled-components';

import { HStack, Select } from '@navikt/ds-react';
import { Pagination } from '@navikt/ds-react';
import { type Ressurs, RessursStatus } from '@navikt/familie-typer';

import type {
    IBarnehagebarn,
    IBarnehagebarnInfotrygd,
    IBarnehagebarnRequestParams,
    IBarnehagebarnResponse,
} from '../../typer/barnehagebarn';

const StyledHStack = styled(HStack)`
    margin-bottom: 1rem;
`;

const StyledSelect = styled(Select)`
    margin-right: auto;
`;

interface IBarnehagebarnListNavigatorProps<T> {
    barnehagebarnRequestParams: IBarnehagebarnRequestParams;
    barnehagebarnResponse: Ressurs<IBarnehagebarnResponse<T>>;
    data: readonly T[];
    updateOffset: (offset: number) => void;
    updateLimit: (limit: number) => void;
    updateSortByAscDesc: (fieldName: string) => void;
}

const BarnehagebarnListNavigator = <T = IBarnehagebarn | IBarnehagebarnInfotrygd,>(
    props: IBarnehagebarnListNavigatorProps<T>
) => {
    const { barnehagebarnResponse, updateOffset, updateLimit, barnehagebarnRequestParams } = props;

    return (
        <StyledHStack>
            {barnehagebarnResponse.status === RessursStatus.SUKSESS &&
                barnehagebarnResponse.data.content.length >= 0 && (
                    <>
                        <StyledSelect
                            hideLabel
                            label="Antall per side"
                            size="medium"
                            aria-labelledby={'Antall per side'}
                            value={barnehagebarnRequestParams.limit}
                            onChange={event => updateLimit(+event.target.value)}
                        >
                            <option value="1">Vis 1 per side</option>
                            <option value="2">Vis 2 per side</option>
                            <option value="3">Vis 3 per side</option>
                            <option value="4">Vis 4 per side</option>
                            <option value="20">Vis 20 per side</option>
                            <option value="50">Vis 50 per side</option>
                            <option value="100">Vis 100 per side</option>
                            <option value="200">Vis 200 per side</option>
                        </StyledSelect>
                        {barnehagebarnResponse.data.totalElements > 0 ? (
                            <HStack gap="2" align="center">
                                |
                                <span>
                                    <b>
                                        Side {barnehagebarnResponse.data.number + 1} av{' '}
                                        {barnehagebarnResponse.data.totalPages}{' '}
                                    </b>
                                    ({barnehagebarnResponse.data.pageable.offset + 1} -{' '}
                                    {barnehagebarnResponse.data.pageable.offset +
                                        barnehagebarnResponse.data.numberOfElements}{' '}
                                    av {barnehagebarnResponse.data.totalElements} totalt)
                                </span>
                                |
                            </HStack>
                        ) : (
                            <div>Ingen resultater</div>
                        )}
                        {barnehagebarnResponse?.data?.totalPages > 0 && (
                            <Pagination
                                size="medium"
                                page={barnehagebarnResponse.data.number + 1}
                                count={barnehagebarnResponse.data.totalPages}
                                onPageChange={(side: number) => updateOffset(side - 1)}
                                boundaryCount={1}
                                siblingCount={1}
                            />
                        )}
                    </>
                )}
        </StyledHStack>
    );
};

export default BarnehagebarnListNavigator;

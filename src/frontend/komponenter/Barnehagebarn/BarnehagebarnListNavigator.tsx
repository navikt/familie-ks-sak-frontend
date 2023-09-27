import React from 'react';

import styled from 'styled-components';

import { Select } from '@navikt/ds-react';
import { Pagination } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer';

import { useBarnehagebarn } from '../../context/BarnehagebarnContext';

const StyledSelect = styled(Select)`
    max-width: 200px;
`;
const BarnehagebarnListNavigator: React.FunctionComponent = () => {
    const { barnehagebarnResponse, updateOffset, updateLimit, barnehagebarnRequestParams } =
        useBarnehagebarn();
    return barnehagebarnResponse.status === RessursStatus.SUKSESS &&
        barnehagebarnResponse.data.content.length >= 0 ? (
        <div className="barnhagebarn-navigasjon-wrapper">
            <div className="barnhagebarn-navigasjon">
                <div className="barnhagebarn-navigasjon-left">
                    <StyledSelect
                        hideLabel
                        label="Antall per side"
                        size="small"
                        aria-labelledby={'Antall per side'}
                        value={barnehagebarnRequestParams.limit}
                        onChange={event => updateLimit(+event.target.value)}
                    >
                        <option value="1">Vis 1 per side</option>
                        <option value="2">Vis 2 per side</option>
                        <option value="3">Vis 3 per side</option>{' '}
                        <option value="4">Vis 4 per side</option>
                        <option value="20">Vis 20 per side</option>
                        <option value="50">Vis 50 per side</option>
                        <option value="100">Vis 100 per side</option>
                        <option value="200">Vis 200 per side</option>
                    </StyledSelect>
                </div>
                <div className="barnhagebarn-navigasjon-center">
                    <Pagination
                        size="small"
                        page={barnehagebarnResponse.data.number + 1}
                        count={barnehagebarnResponse.data.totalPages}
                        onPageChange={(side: number) => updateOffset(side - 1)}
                        boundaryCount={1}
                        siblingCount={1}
                    />
                </div>
                <div className="barnhagebarn-navigasjon-right">
                    <b>
                        Side {barnehagebarnResponse.data.number + 1} av{' '}
                        {barnehagebarnResponse.data.totalPages}
                    </b>{' '}
                    <span>
                        ({barnehagebarnResponse.data.pageable.offset + 1} -{' '}
                        {barnehagebarnResponse.data.pageable.offset +
                            barnehagebarnResponse.data.numberOfElements}{' '}
                        av {barnehagebarnResponse.data.totalElements} totalt)
                    </span>
                </div>
            </div>
        </div>
    ) : null;
};
export default BarnehagebarnListNavigator;

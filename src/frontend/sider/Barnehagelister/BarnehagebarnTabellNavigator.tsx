import { useHentBarnehagebarn } from '@hooks/useHentBarnehagebarn';
import type { BarnehagebarnRequestParams } from '@typer/barnehagebarn';

import { HStack, Pagination, Select } from '@navikt/ds-react';

interface BarnehagebarnTabellNavigatorProps {
    barnehagebarnRequestParams: BarnehagebarnRequestParams;
    updateOffset: (offset: number) => void;
    updateLimit: (limit: number) => void;
    updateSortByAscDesc: (fieldName: string) => void;
}

const BarnehagebarnTabellNavigator = (props: BarnehagebarnTabellNavigatorProps) => {
    const { updateOffset, updateLimit, barnehagebarnRequestParams } = props;

    const { data, isPending, error } = useHentBarnehagebarn(barnehagebarnRequestParams);

    if (isPending || error) {
        return null;
    }

    return (
        <HStack marginBlock={'space-0 space-16'}>
            {data.content.length >= 0 && (
                <HStack justify={'space-between'} width={'100%'}>
                    <Select
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
                    </Select>
                    <HStack>
                        {data.totalElements > 0 ? (
                            <HStack gap="space-8" align="center">
                                |
                                <span>
                                    <b>
                                        Side {data.number + 1} av {data.totalPages}{' '}
                                    </b>
                                    ({data.pageable.offset + 1} - {data.pageable.offset + data.numberOfElements} av{' '}
                                    {data.totalElements} totalt)
                                </span>
                                |
                            </HStack>
                        ) : (
                            <div>Ingen resultater</div>
                        )}
                        {data?.totalPages > 0 && (
                            <Pagination
                                size="medium"
                                page={data.number + 1}
                                count={data.totalPages}
                                onPageChange={(side: number) => updateOffset(side - 1)}
                                boundaryCount={1}
                                siblingCount={1}
                            />
                        )}
                    </HStack>
                </HStack>
            )}
        </HStack>
    );
};

export default BarnehagebarnTabellNavigator;

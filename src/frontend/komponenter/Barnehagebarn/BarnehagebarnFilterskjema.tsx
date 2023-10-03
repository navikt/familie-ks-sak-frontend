import React from 'react';

import styled from 'styled-components';

import { FunnelIcon, FileResetIcon } from '@navikt/aksel-icons';
import { Button, Checkbox, Fieldset, TextField } from '@navikt/ds-react';

import { useBarnehagebarn } from '../../context/BarnehagebarnContext';

const FlexDiv = styled.div`
    display: flex;
    align-items: end;
    gap: 1rem;
    margin-bottom: 1rem;
`;

const StyledFieldset = styled(Fieldset)`
    margin-top: 1rem;
`;

const BarnehagebarnFilterskjema: React.FunctionComponent = () => {
    const {
        barnehagebarnRequestParams,
        hentBarnehagebarnResponseRessurs,
        updateIdent,
        updateKommuneNavn,
        updateKunLøpendeFagsak,
        fjernBarnehagebarnFiltere,
    } = useBarnehagebarn();

    return (
        <StyledFieldset
            size="small"
            aria-label="Barnehagebarn filterskjema"
            legend="Filterskjema"
            description="Filtrer barnehagebarn resultater"
            hideLegend
        >
            <FlexDiv>
                <TextField
                    label="Barns ident"
                    title="Filtrer på barns ident"
                    size="small"
                    maxLength={11}
                    value={barnehagebarnRequestParams.ident}
                    onChange={(event): void => {
                        updateIdent(event.target.value);
                    }}
                />
                <TextField
                    label="Kommunenavn"
                    title="Filtrer på kommunenavn"
                    size="small"
                    maxLength={200}
                    value={barnehagebarnRequestParams.kommuneNavn}
                    onChange={(event): void => {
                        updateKommuneNavn(event.target.value);
                    }}
                />
                <Checkbox
                    id="kun-loepende-fagsak"
                    title="Vis kun løpende fagsaker"
                    checked={barnehagebarnRequestParams.kunLøpendeFagsak}
                    onChange={(): void => {
                        updateKunLøpendeFagsak();
                    }}
                >
                    Kun løpende fagsaker
                </Checkbox>
            </FlexDiv>
            <FlexDiv>
                <Button
                    variant="primary"
                    size="small"
                    onClick={() => hentBarnehagebarnResponseRessurs()}
                    icon={<FunnelIcon aria-hidden />}
                >
                    Filtrer
                </Button>
                <Button
                    variant="primary"
                    size="small"
                    onClick={() => {
                        fjernBarnehagebarnFiltere();
                    }}
                    icon={<FileResetIcon aria-hidden />}
                >
                    Fjern filtre
                </Button>
            </FlexDiv>
        </StyledFieldset>
    );
};

export default BarnehagebarnFilterskjema;

import React from 'react';

import { FunnelIcon, FileResetIcon } from '@navikt/aksel-icons';
import { Button, Checkbox, Fieldset, Label, TextField } from '@navikt/ds-react';

import { useBarnehagebarnInfotrygd } from '../../context/BarnehagebarnInfotrygdContext';
const BarnehagebarnInfotrygdFilterskjema: React.FunctionComponent = () => {
    const {
        barnehagebarnRequestParams,
        hentBarnehagebarnResponseRessurs,
        updateIdent,
        updateKommuneNavn,
        updateKunLøpendeFagsak,
        fjernBarnehagebarnFiltere,
    } = useBarnehagebarnInfotrygd();

    return (
        <Fieldset
            size="small"
            className="barnehagebarnskjema"
            aria-label="barnehagebarn-filterskjema"
            legend="Filterskjema"
            description="Filtrer barnehagebarn resultater"
            hideLegend
        >
            <div className="barnhagebarn-filtere">
                <div className="bb-filter">
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
                </div>
                <div className="bb-filter">
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
                </div>
                <div className="bb-filter">
                    <Label size="small" htmlFor="kun-loepende-fagsak">
                        Kun løpende fagsaker
                    </Label>
                    <Checkbox
                        id="kun-loepende-fagsak"
                        title="Vis kun løpende fagsaker"
                        checked={barnehagebarnRequestParams.kunLøpendeFagsak}
                        hideLabel
                        onChange={(): void => {
                            updateKunLøpendeFagsak();
                        }}
                    >
                        Vis kun løpende fagsaker
                    </Checkbox>
                </div>
            </div>
            <div className="barnhagebarn-actions">
                <div className="bb-filter">
                    <Button
                        variant="primary"
                        size="small"
                        onClick={() => hentBarnehagebarnResponseRessurs()}
                    >
                        <FunnelIcon title="Filtrer på angitte verdier" /> Filtrer
                    </Button>
                </div>
                <div className="bb-filter">
                    <Button
                        variant="primary"
                        size="small"
                        onClick={() => {
                            fjernBarnehagebarnFiltere();
                        }}
                    >
                        <FileResetIcon title="Fjern filtrering" /> Fjern filtere
                    </Button>
                </div>
            </div>
        </Fieldset>
    );
};

export default BarnehagebarnInfotrygdFilterskjema;

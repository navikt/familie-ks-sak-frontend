import React from 'react';

import { FunnelIcon, FileResetIcon } from '@navikt/aksel-icons';
import { Button, Checkbox, CheckboxGroup, Fieldset, TextField } from '@navikt/ds-react';

import { useBarnehagebarn } from '../../context/BarnehagebarnContext';
const BarnehagebarnFilterskjema: React.FunctionComponent = () => {
    const {
        barnehagebarnRequestParams,
        hentBarnehagebarnResponseRessurs,
        updateIdent,
        updateKommuneNavn,
        updateKommuneNr,
        updateKunLøpendeFagsak,
        fjernBarnehagebarnFiltere,
    } = useBarnehagebarn();

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
                        label="Personident"
                        title="Filtrer på personident"
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
                    <TextField
                        label="Kommunenr."
                        title="Filtrer på kommunenummer"
                        size="small"
                        maxLength={4}
                        value={barnehagebarnRequestParams.kommuneNr}
                        onChange={(event): void => {
                            updateKommuneNr(event.target.value);
                        }}
                    />
                </div>
                <div className="bb-filter">
                    <CheckboxGroup legend="Kun løpende fagsaker" size="small">
                        <Checkbox
                            value={barnehagebarnRequestParams.kunLøpendeFagsak}
                            hideLabel
                            onChange={(): void => {
                                updateKunLøpendeFagsak();
                            }}
                        >
                            Kun løpende fagsaker
                        </Checkbox>
                    </CheckboxGroup>
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

export default BarnehagebarnFilterskjema;

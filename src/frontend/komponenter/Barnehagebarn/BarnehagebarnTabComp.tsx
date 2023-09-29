import React from 'react';

import { TeddyBearIcon } from '@navikt/aksel-icons';
import { Tabs } from '@navikt/ds-react';

import { BarnehagebarnComp } from '../../context/BarnehagebarnContext';
import { BarnehagebarnInfotrygdComp } from '../../context/BarnehagebarnInfotrygdContext';
const BarnehagebarnTabComp: React.FunctionComponent = () => {
    return (
        <Tabs defaultValue="barnehageliste-ks-sak">
            <Tabs.List>
                <Tabs.Tab
                    value="barnehageliste-ks-sak"
                    label="Barnehageliste KS sak"
                    icon={<TeddyBearIcon title="Barnehageliste KS sak" />}
                />
                <Tabs.Tab
                    value="barnehageliste-infotrygd"
                    label="Barnehageliste Infotrygd"
                    icon={<TeddyBearIcon title="Barnehageliste Infotrygd" />}
                />
            </Tabs.List>
            <Tabs.Panel value="barnehageliste-ks-sak">
                <BarnehagebarnComp />
            </Tabs.Panel>
            <Tabs.Panel value="barnehageliste-infotrygd">
                <BarnehagebarnInfotrygdComp />
            </Tabs.Panel>
        </Tabs>
    );
};

export default BarnehagebarnTabComp;

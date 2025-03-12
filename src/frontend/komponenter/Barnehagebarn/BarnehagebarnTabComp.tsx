import React from 'react';

import { TeddyBearIcon } from '@navikt/aksel-icons';
import { Tabs } from '@navikt/ds-react';

import Barnehagebarn from './Barnehagebarn';
import BarnehagebarnInfotrygd from './infotrygd/BarnehagebarnInfotrygd';
const BarnehagebarnTabComp: React.FunctionComponent = () => {
    return (
        <Tabs defaultValue="barnehageliste-ks-sak">
            <Tabs.List>
                <Tabs.Tab
                    value="barnehageliste-ks-sak"
                    label="Barnehageliste KS sak"
                    icon={<TeddyBearIcon title="Barnehageliste KS sak" aria-hidden />}
                />
                <Tabs.Tab
                    value="barnehageliste-infotrygd"
                    label="Barnehageliste Infotrygd"
                    icon={<TeddyBearIcon title="Barnehageliste Infotrygd" aria-hidden />}
                />
            </Tabs.List>
            <Tabs.Panel value="barnehageliste-ks-sak">
                <Barnehagebarn />
            </Tabs.Panel>
            <Tabs.Panel value="barnehageliste-infotrygd">
                <BarnehagebarnInfotrygd />
            </Tabs.Panel>
        </Tabs>
    );
};

export default BarnehagebarnTabComp;

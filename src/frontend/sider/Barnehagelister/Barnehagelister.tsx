import React from 'react';

import { TeddyBearIcon } from '@navikt/aksel-icons';
import { Tabs } from '@navikt/ds-react';

import BarnehagelisterInnhold from './BarnehagelisterInnhold';
const Barnehagelister: React.FunctionComponent = () => {
    return (
        <Tabs defaultValue="barnehageliste-ks-sak">
            <Tabs.List>
                <Tabs.Tab
                    value="barnehageliste-ks-sak"
                    label="Barnehageliste KS sak"
                    icon={<TeddyBearIcon title="Barnehageliste KS sak" aria-hidden />}
                />
            </Tabs.List>
            <Tabs.Panel value="barnehageliste-ks-sak">
                <BarnehagelisterInnhold />
            </Tabs.Panel>
        </Tabs>
    );
};

export default Barnehagelister;

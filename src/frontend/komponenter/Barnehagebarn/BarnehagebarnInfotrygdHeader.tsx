import React from 'react';

import { Heading } from '@navikt/ds-react';

import BarnehagebarnInfotrygdFilterskjema from './BarnehagebarnInfotrygdFilterskjema';

const BarnehagebarnInfotrygdHeader: React.FunctionComponent = () => {
    return (
        <div className={'barnhagebarn-header'}>
            <div>
                <Heading size={'medium'} level={'2'} className={'barnhagebarn-header__tittel'}>
                    Barnehageliste Infotrygd
                </Heading>
                <BarnehagebarnInfotrygdFilterskjema />
            </div>
        </div>
    );
};

export default BarnehagebarnInfotrygdHeader;

import React from 'react';

import { Heading } from '@navikt/ds-react';

import BarnehagebarnFilterskjema from './BarnehagebarnFilterskjema';

const BarnehagebarnHeader: React.FunctionComponent = () => {
    return (
        <div className={'barnhagebarn-header'}>
            <div>
                <Heading size={'medium'} level={'2'} className={'barnhagebarn-header__tittel'}>
                    Barnehagebarn
                </Heading>

                <BarnehagebarnFilterskjema />
            </div>
        </div>
    );
};

export default BarnehagebarnHeader;

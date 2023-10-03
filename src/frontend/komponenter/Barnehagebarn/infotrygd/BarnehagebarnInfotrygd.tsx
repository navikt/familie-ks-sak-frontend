import React, { useEffect } from 'react';

import BarnehagebarnInfotrygdHeader from './BarnehagebarnInfotrygdHeader';
import BarnehagebarnInfotrygdList from './BarnehagebarnInfotrygdList';
import { useAmplitude } from '../../../utils/amplitude';

const BarnehagebarnInfotrygd: React.FunctionComponent = () => {
    const { loggSidevisning } = useAmplitude();

    useEffect(() => {
        loggSidevisning('barnehageliste infotrygd');
    }, []);

    return (
        <div className="barnehagebarn">
            <BarnehagebarnInfotrygdHeader />
            <BarnehagebarnInfotrygdList />
        </div>
    );
};

export default BarnehagebarnInfotrygd;

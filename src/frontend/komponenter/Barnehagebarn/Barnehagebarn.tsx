import React, { useEffect } from 'react';

import BarnehagebarnHeader from './BarnehagebarnHeader';
import BarnehagebarnList from './BarnehagebarnList';
import { useAmplitude } from '../../utils/amplitude';

const Barnehagebarn: React.FunctionComponent = () => {
    const { loggSidevisning } = useAmplitude();

    useEffect(() => {
        loggSidevisning('barnehageliste ks-sak');
    }, []);

    return (
        <div className="barnehagebarn">
            <BarnehagebarnHeader />
            <BarnehagebarnList />
        </div>
    );
};

export default Barnehagebarn;

import React from 'react';

import { Select } from '@navikt/ds-react';

interface MånedProps {
    måned: string | undefined;
    settMåned: (måned: string | undefined) => void;
    lesevisning?: boolean;
    feil?: boolean;
    label: string;
    className?: string;
}

const månedValg = [
    { mndNr: '01', verdi: 'Januar' },
    { mndNr: '02', verdi: 'Februar' },
    { mndNr: '03', verdi: 'Mars' },
    { mndNr: '04', verdi: 'April' },
    { mndNr: '05', verdi: 'Mai' },
    { mndNr: '06', verdi: 'Juni' },
    { mndNr: '07', verdi: 'Juli' },
    { mndNr: '08', verdi: 'August' },
    { mndNr: '09', verdi: 'September' },
    { mndNr: '10', verdi: 'Oktober' },
    { mndNr: '11', verdi: 'November' },
    { mndNr: '12', verdi: 'Desember' },
];

const MånedVelger: React.FC<MånedProps> = ({
    måned,
    settMåned,
    lesevisning = false,
    feil = false,
    label,
    className,
}) => {
    return (
        <Select
            readOnly={lesevisning}
            value={måned ?? ''}
            label={label}
            onChange={event => {
                event.persist();
                settMåned(event.target.value !== '' ? event.target.value : undefined);
            }}
            error={feil}
            className={className}
        >
            <option value="">Måned</option>
            {månedValg.map(mnd => (
                <option value={mnd.mndNr} key={mnd.mndNr}>
                    {mnd.verdi}
                </option>
            ))}
        </Select>
    );
};

export default MånedVelger;

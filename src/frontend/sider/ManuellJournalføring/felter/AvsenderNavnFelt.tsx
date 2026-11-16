import { TextField } from '@navikt/ds-react';
import { useManuellJournalføringContext } from '../ManuellJournalføringContext';

interface AvsenderNavnFeltProps {
    lesevisning: boolean | undefined;
    brukerErAvsender: boolean;
}

export function AvsenderNavnFelt({ lesevisning, brukerErAvsender }: AvsenderNavnFeltProps) {
    const { skjema } = useManuellJournalføringContext();
    return (
        <TextField
            {...skjema.felter.avsenderNavn.hentNavInputProps(skjema.visFeilmeldinger)}
            readOnly={lesevisning}
            label={'Navn'}
            size={'medium'}
            placeholder={'navn'}
            disabled={brukerErAvsender}
        />
    );
}

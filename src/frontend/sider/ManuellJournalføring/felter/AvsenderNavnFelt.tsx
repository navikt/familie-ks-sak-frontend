import { TextField } from '@navikt/ds-react';
import { useManuellJournalføringContext } from '../ManuellJournalføringContext';

interface AvsenderNavnFeltProps {
    brukerErAvsender: boolean;
}

export function AvsenderNavnFelt({ brukerErAvsender }: AvsenderNavnFeltProps) {
    const { skjema, erLesevisning } = useManuellJournalføringContext();
    return (
        <TextField
            {...skjema.felter.avsenderNavn.hentNavInputProps(skjema.visFeilmeldinger)}
            readOnly={erLesevisning()}
            label={'Navn'}
            size={'medium'}
            placeholder={'navn'}
            disabled={brukerErAvsender}
        />
    );
}

import { TextField } from '@navikt/ds-react';
import { useManuellJournalføringContext } from '../ManuellJournalføringContext';

interface AvsenderIdentFeltProps {
    brukerErAvsender: boolean;
}

export function AvsenderIdentFelt({ brukerErAvsender }: AvsenderIdentFeltProps) {
    const { skjema, erLesevisning } = useManuellJournalføringContext();
    return (
        <TextField
            {...skjema.felter.avsenderIdent.hentNavInputProps(skjema.visFeilmeldinger)}
            readOnly={erLesevisning()}
            label={'Ident'}
            size={'medium'}
            placeholder={'Fnr/dnr/orgnr'}
            disabled={brukerErAvsender}
        />
    );
}

import type { ChangeEvent } from 'react';

import { Textarea } from '@navikt/ds-react';

import { useDokumentutsendingContext } from '../sider/Fagsak/Dokumentutsending/DokumentutsendingContext';

const FritekstAvsnitt = () => {
    const { skjema } = useDokumentutsendingContext();
    const maksLengdeFritekstAvsnitt = 1000;

    return (
        <Textarea
            label="Skriv inn fritekst avsnitt"
            value={skjema.felter.fritekstAvsnitt.verdi}
            maxLength={maksLengdeFritekstAvsnitt}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                skjema.felter.fritekstAvsnitt.validerOgSettFelt(event.target.value)
            }
            error={skjema.visFeilmeldinger && skjema.felter.fritekstAvsnitt?.feilmelding}
            /* eslint-disable-next-line jsx-a11y/no-autofocus */
            autoFocus
            resize={'vertical'}
        />
    );
};

export default FritekstAvsnitt;

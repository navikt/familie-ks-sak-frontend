import { useHentFagsakPaaPersonError } from '@hooks/useHentFagsakPaaPersonError';
import { KontoSirkel } from '@ikoner/KontoSirkel';
import { ExpansionCard, LocalAlert } from '@navikt/ds-react';
import { useFelt, Valideringsstatus } from '@navikt/familie-skjema';
import { EndreBrukerSkjema } from '@sider/ManuellJournalføring/EndreBrukerSkjema';
import { formaterIdent } from '@utils/formatter';
import { identValidator } from '@utils/validators';
import { useEffect, useState } from 'react';
import styles from './BrukerPanel.module.css';
import { DeltagerInfo } from './DeltagerInfo';
import { useManuellJournalføringContext } from './ManuellJournalføringContext';

export function BrukerPanel() {
    const { skjema, erLesevisning } = useManuellJournalføringContext();

    const [åpen, settÅpen] = useState(false);
    const nyIdent = useFelt({
        verdi: '',
        valideringsfunksjon: identValidator,
    });

    const hentFagsakPaaPersonError = useHentFagsakPaaPersonError(nyIdent.verdi);

    useEffect(() => {
        if (skjema.visFeilmeldinger && skjema.felter.bruker.valideringsstatus === Valideringsstatus.FEIL) {
            settÅpen(true);
        }
    }, [skjema.visFeilmeldinger, skjema.felter.bruker.valideringsstatus]);

    return (
        <ExpansionCard
            open={åpen}
            onToggle={() => {
                settÅpen(!åpen);
            }}
            aria-label={skjema.felter.bruker.verdi?.navn || 'Ukjent bruker'}
            size="small"
        >
            <ExpansionCard.Header>
                <DeltagerInfo
                    ikon={<KontoSirkel filled={åpen} width={48} height={48} />}
                    navn={skjema.felter.bruker.verdi?.navn || 'Ukjent bruker'}
                    undertittel={'Søker/Bruker'}
                    ident={formaterIdent(skjema.felter.bruker.verdi?.personIdent ?? '')}
                />
            </ExpansionCard.Header>
            <ExpansionCard.Content className={styles.innerContent}>
                {!erLesevisning() && (
                    <>
                        <EndreBrukerSkjema nyIdent={nyIdent} />
                        {hentFagsakPaaPersonError && (
                            <LocalAlert status={'error'}>
                                <LocalAlert.Header>
                                    <LocalAlert.Title>Klarte ikke å endre bruker</LocalAlert.Title>
                                </LocalAlert.Header>
                                <LocalAlert.Content>{hentFagsakPaaPersonError?.message}</LocalAlert.Content>
                            </LocalAlert>
                        )}
                    </>
                )}
            </ExpansionCard.Content>
        </ExpansionCard>
    );
}

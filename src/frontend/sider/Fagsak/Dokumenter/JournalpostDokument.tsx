import type { FamilieAxiosRequestConfig } from '@hooks/useDokument';
import type { ITilgangsstyrtJournalpost } from '@typer/journalpost';

import { ExternalLinkIcon, PadlockLockedIcon } from '@navikt/aksel-icons';
import { BodyShort, HStack, Link, VStack } from '@navikt/ds-react';
import type { IDokumentInfo } from '@navikt/familie-typer';

import styles from './JournalpostDokument.module.css';

interface IProps {
    dokument: IDokumentInfo;
    hentForhåndsvisning: <D>(familieAxiosRequestConfig: FamilieAxiosRequestConfig<D>) => void;
    tilgangsstyrtJournalpost: ITilgangsstyrtJournalpost;
}

export const JournalpostDokument = ({ dokument, hentForhåndsvisning, tilgangsstyrtJournalpost }: IProps) => {
    const { journalpost, journalpostTilgang } = tilgangsstyrtJournalpost;

    const hentPdfDokument = (dokumentId: string | undefined) => {
        if (dokumentId !== undefined) {
            hentForhåndsvisning({
                method: 'GET',
                url: `/familie-ks-sak/api/journalpost/${journalpost.journalpostId}/dokument/${dokumentId}`,
            });
        } else {
            alert('Klarer ikke å åpne dokument. Ta kontakt med teamet.');
        }
    };

    const dokumentTittel = dokument.tittel || 'Uten tittel';

    return (
        <li>
            <HStack gap="space-4">
                {journalpostTilgang.harTilgang ? (
                    <>
                        <BodyShort className={styles.text} size="small" title={dokumentTittel}>
                            <Link href="#" onClick={() => hentPdfDokument(dokument.dokumentInfoId)}>
                                {dokumentTittel}
                            </Link>
                        </BodyShort>

                        <Link
                            href={`/familie-ks-sak/api/journalpost/${journalpost.journalpostId}/dokument/${dokument.dokumentInfoId}/pdf`}
                            target="_blank"
                            aria-label="Åpne dokument i ny fane"
                            title="Åpne dokument i ny fane"
                        >
                            <ExternalLinkIcon />
                        </Link>
                    </>
                ) : (
                    <>
                        <BodyShort size="small">{dokumentTittel}</BodyShort>
                        <PadlockLockedIcon
                            title={`Dokumentet krever ekstra tilganger. ${journalpostTilgang.begrunnelse}`}
                        />
                    </>
                )}
            </HStack>

            {dokument.logiskeVedlegg && dokument.logiskeVedlegg.length > 0 && (
                <ul className={styles.vedleggListe}>
                    <VStack gap={'space-16'}>
                        {dokument.logiskeVedlegg.map(vedlegg => (
                            <li key={vedlegg.logiskVedleggId}>
                                <BodyShort className={styles.text} size="small" title={vedlegg.tittel}>
                                    {vedlegg.tittel}
                                </BodyShort>
                            </li>
                        ))}
                    </VStack>
                </ul>
            )}
        </li>
    );
};

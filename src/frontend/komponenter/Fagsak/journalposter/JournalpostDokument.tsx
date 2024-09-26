import React from 'react';

import styled from 'styled-components';

import { ExternalLinkIcon, PadlockLockedIcon } from '@navikt/aksel-icons';
import { BodyShort, HStack, Link } from '@navikt/ds-react';
import type { IDokumentInfo } from '@navikt/familie-typer';

import { Vedleggsliste, EllipsisBodyShort } from './JournalpostListe';
import type { FamilieAxiosRequestConfig } from '../../../context/AppContext';
import type { ITilgangsstyrtJournalpost } from '../../../typer/journalpost';
import { adressebeskyttelsestyper } from '../../../typer/person';

const ListeElement = styled.li`
    margin-bottom: 1rem;
    &:last-child {
        margin-bottom: 0;
    }
`;

interface IProps {
    dokument: IDokumentInfo;
    hentForhåndsvisning: <D>(familieAxiosRequestConfig: FamilieAxiosRequestConfig<D>) => void;
    tilgangsstyrtJournalpost: ITilgangsstyrtJournalpost;
}

export const JournalpostDokument: React.FC<IProps> = ({
    dokument,
    hentForhåndsvisning,
    tilgangsstyrtJournalpost,
}) => {
    const { journalpost, harTilgang, adressebeskyttelsegradering } = tilgangsstyrtJournalpost;

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
        <ListeElement>
            <HStack gap="1">
                {harTilgang ? (
                    <>
                        <EllipsisBodyShort size="small" title={dokumentTittel}>
                            <Link href="#" onClick={() => hentPdfDokument(dokument.dokumentInfoId)}>
                                {dokumentTittel}
                            </Link>
                        </EllipsisBodyShort>

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
                            title={
                                adressebeskyttelsegradering
                                    ? `Dokumentet krever tilgangen ${adressebeskyttelsestyper[adressebeskyttelsegradering]}`
                                    : 'Dokumentet krever ekstra tilganger'
                            }
                        />
                    </>
                )}
            </HStack>

            {dokument.logiskeVedlegg && dokument.logiskeVedlegg.length > 0 && (
                <Vedleggsliste>
                    {dokument.logiskeVedlegg.map(vedlegg => (
                        <ListeElement key={vedlegg.logiskVedleggId}>
                            <EllipsisBodyShort size="small" title={vedlegg.tittel}>
                                {vedlegg.tittel}
                            </EllipsisBodyShort>
                        </ListeElement>
                    ))}
                </Vedleggsliste>
            )}
        </ListeElement>
    );
};

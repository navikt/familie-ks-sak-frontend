import { useEffect, useState } from 'react';

import type { ITilgangsstyrtJournalpost } from '@typer/journalpost';
import { Datoformat, isoStringTilFormatertString } from '@utils/dato';

import { ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon } from '@navikt/aksel-icons';
import { BodyShort, Box, GlobalAlert, Heading, HStack, Table, VStack } from '@navikt/ds-react';
import { useHttp } from '@navikt/familie-http';
import type { IJournalpost, Ressurs } from '@navikt/familie-typer';
import {
    byggHenterRessurs,
    byggTomRessurs,
    journalpoststatus,
    Journalposttype,
    RessursStatus,
} from '@navikt/familie-typer';

import { JournalpostDokument } from './JournalpostDokument';
import {
    formaterFagsak,
    hentDatoRegistrertSendt,
    hentSorterteJournalposter,
    hentSortState,
    Sorteringsrekkefølge,
} from './journalpostUtils';
import useDokument from '../../../hooks/useDokument';
import PdfVisningModal from '../../../komponenter/PdfVisningModal/PdfVisningModal';
import { useBrukerContext } from '../BrukerContext';
import styles from './JournalpostListe.module.css';

const hentIkonForJournalpostType = (journalposttype: Journalposttype) => {
    switch (journalposttype) {
        case Journalposttype.I:
            return <ArrowRightIcon title="Inngående" fontSize={'1.3rem'} />;
        case Journalposttype.U:
            return <ArrowLeftIcon title="Utgående" fontSize={'1.3rem'} />;
        case Journalposttype.N:
            return <ArrowDownIcon title="Notat" fontSize={'1.3rem'} />;
    }
};

const settRiktigDatoMottatForJournalpost = (journalpost: IJournalpost): IJournalpost => {
    return {
        ...journalpost,
        datoMottatt:
            journalpost.datoMottatt ||
            hentDatoRegistrertSendt(journalpost.relevanteDatoer, journalpost.journalposttype),
    };
};

export function JournalpostListe() {
    const { bruker } = useBrukerContext();
    const { request } = useHttp();
    const [journalposterRessurs, settJournalposterRessurs] =
        useState<Ressurs<ITilgangsstyrtJournalpost[]>>(byggTomRessurs());
    const [sortering, settSortering] = useState<Sorteringsrekkefølge>(Sorteringsrekkefølge.INGEN_SORTERING);
    const { visDokumentModal, hentetDokument, settVisDokumentModal, hentForhåndsvisning } = useDokument();

    useEffect(() => {
        settJournalposterRessurs(byggHenterRessurs());

        const ident = bruker.personIdent;

        request<{ ident: string }, ITilgangsstyrtJournalpost[]>({
            method: 'POST',
            data: { ident },
            url: `/familie-ks-sak/api/journalpost/bruker`,
            påvirkerSystemLaster: true,
        }).then(journalposterRessurs => {
            settJournalposterRessurs(journalposterRessurs);
        });
    }, [bruker]);

    const settNesteSorteringsrekkefølge = (): void => {
        switch (sortering) {
            case Sorteringsrekkefølge.INGEN_SORTERING:
                settSortering(Sorteringsrekkefølge.STIGENDE);
                break;
            case Sorteringsrekkefølge.STIGENDE:
                settSortering(Sorteringsrekkefølge.SYNKENDE);
                break;
            case Sorteringsrekkefølge.SYNKENDE:
            default:
                settSortering(Sorteringsrekkefølge.INGEN_SORTERING);
                break;
        }
    };

    if (
        journalposterRessurs.status === RessursStatus.FEILET ||
        journalposterRessurs.status === RessursStatus.FUNKSJONELL_FEIL ||
        journalposterRessurs.status === RessursStatus.IKKE_TILGANG
    ) {
        return (
            <Box padding={'space-32'} overflow={'auto'}>
                <GlobalAlert status={'error'}>
                    <GlobalAlert.Header>
                        <GlobalAlert.Title>Klarte ikke å hente inn journalposter for fagsak.</GlobalAlert.Title>
                    </GlobalAlert.Header>
                </GlobalAlert>
            </Box>
        );
    }

    if (journalposterRessurs.status === RessursStatus.SUKSESS) {
        const journalposterMedOverstyrtDato = journalposterRessurs.data?.map(tilgangsstyrtJournalpost => {
            const { journalpostTilgang, journalpost } = tilgangsstyrtJournalpost;
            return {
                journalpostTilgang,
                journalpost: settRiktigDatoMottatForJournalpost(journalpost),
            };
        });
        const sorterteJournalPoster = hentSorterteJournalposter(journalposterMedOverstyrtDato, sortering);
        return (
            <Box padding={'space-32'} overflow={'auto'}>
                <Heading level="2" size="large" spacing>
                    Dokumentoversikt
                </Heading>

                <Table
                    className={styles.table}
                    size="small"
                    zebraStripes
                    sort={hentSortState(sortering, 'datoRegistrertSendt')}
                    onSortChange={settNesteSorteringsrekkefølge}
                >
                    <Table.Header>
                        <Table.Row className={styles.headerRow}>
                            <Table.HeaderCell>Inn/ut</Table.HeaderCell>
                            <Table.ColumnHeader sortKey="datoRegistrertSendt" sortable>
                                Registrert/sendt
                            </Table.ColumnHeader>

                            <Table.HeaderCell>Dokumenter</Table.HeaderCell>
                            <Table.HeaderCell>Fagsystem | Saksid</Table.HeaderCell>
                            <Table.HeaderCell>Avsender/Mottaker</Table.HeaderCell>
                            <Table.HeaderCell>Journalpost</Table.HeaderCell>
                            <Table.HeaderCell>Status</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {sorterteJournalPoster.map(tilgangsstyrtJournalpost => (
                            <Table.Row key={tilgangsstyrtJournalpost.journalpost.journalpostId}>
                                <Table.DataCell className={styles.dataCell}>
                                    <HStack align={'center'} gap={'space-8'} justify={'center'} wrap={false}>
                                        {hentIkonForJournalpostType(
                                            tilgangsstyrtJournalpost.journalpost.journalposttype
                                        )}
                                        <BodyShort weight={'semibold'}>
                                            {tilgangsstyrtJournalpost.journalpost.journalposttype}
                                        </BodyShort>
                                    </HStack>
                                </Table.DataCell>
                                <Table.DataCell className={styles.dataCell}>
                                    {isoStringTilFormatertString({
                                        isoString: tilgangsstyrtJournalpost.journalpost.datoMottatt,
                                        tilFormat: Datoformat.DATO_TID,
                                        defaultString: '-',
                                    })}
                                </Table.DataCell>

                                <Table.DataCell className={styles.dataCell}>
                                    {(tilgangsstyrtJournalpost.journalpost.dokumenter?.length ?? 0) > 0 ? (
                                        <ul className={styles.vedleggListe}>
                                            <VStack gap={'space-16'}>
                                                {tilgangsstyrtJournalpost.journalpost.dokumenter?.map(dokument => (
                                                    <JournalpostDokument
                                                        dokument={dokument}
                                                        key={dokument.dokumentInfoId}
                                                        hentForhåndsvisning={hentForhåndsvisning}
                                                        tilgangsstyrtJournalpost={tilgangsstyrtJournalpost}
                                                    />
                                                ))}
                                            </VStack>
                                        </ul>
                                    ) : (
                                        <BodyShort>Ingen dokumenter</BodyShort>
                                    )}
                                </Table.DataCell>

                                <Table.DataCell className={styles.dataCell}>
                                    <BodyShort
                                        className={styles.text}
                                        size="small"
                                        title={formaterFagsak(
                                            tilgangsstyrtJournalpost.journalpost.sak?.fagsaksystem,
                                            tilgangsstyrtJournalpost.journalpost.sak?.fagsakId
                                        )}
                                    >
                                        {formaterFagsak(
                                            tilgangsstyrtJournalpost.journalpost.sak?.fagsaksystem,
                                            tilgangsstyrtJournalpost.journalpost.sak?.fagsakId
                                        )}
                                    </BodyShort>
                                </Table.DataCell>
                                <Table.DataCell className={styles.dataCell}>
                                    <BodyShort
                                        className={styles.text}
                                        size="small"
                                        title={tilgangsstyrtJournalpost.journalpost.avsenderMottaker?.navn}
                                    >
                                        {tilgangsstyrtJournalpost.journalpost.avsenderMottaker?.navn}
                                    </BodyShort>
                                </Table.DataCell>
                                <Table.DataCell className={styles.dataCell}>
                                    <BodyShort
                                        className={styles.text}
                                        size="small"
                                        title={tilgangsstyrtJournalpost.journalpost.tittel}
                                    >
                                        {tilgangsstyrtJournalpost.journalpost.tittel}
                                    </BodyShort>
                                </Table.DataCell>
                                <Table.DataCell className={styles.dataCell}>
                                    <BodyShort
                                        className={styles.text}
                                        size="small"
                                        title={journalpoststatus[tilgangsstyrtJournalpost.journalpost.journalstatus]}
                                    >
                                        {journalpoststatus[tilgangsstyrtJournalpost.journalpost.journalstatus]}
                                    </BodyShort>
                                </Table.DataCell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table>
                {visDokumentModal && (
                    <PdfVisningModal onRequestClose={() => settVisDokumentModal(false)} pdfdata={hentetDokument} />
                )}
            </Box>
        );
    } else {
        return null;
    }
}

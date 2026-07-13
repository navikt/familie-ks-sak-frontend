import type { ChangeEvent } from 'react';

import { useSaksbehandler } from '@hooks/useSaksbehandler';
import { BrevmottakereAlert } from '@komponenter/BrevmottakereAlert';
import { LeggTilBarnModal } from '@komponenter/Modal/LeggTilBarn/LeggTilBarnModal';
import { LeggTilBarnModalContextProvider } from '@komponenter/Modal/LeggTilBarn/LeggTilBarnModalContext';
import type { IBarnMedOpplysninger } from '@typer/søknad';

import { FileTextIcon, InformationSquareIcon } from '@navikt/aksel-icons';
import { Box, Button, Fieldset, Heading, HStack, InfoCard, Label, Select } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer';

import BarnIBrevSkjema from './BarnIBrev/BarnIBrevSkjema';
import { dokumentÅrsak, DokumentÅrsak, useDokumentutsendingContext } from './DokumentutsendingContext';
import { LeggTilBarnKnapp } from './LeggTilBarnKnapp';
import FritekstAvsnitt from '../../../komponenter/FritekstAvsnitt';
import MålformVelger from '../../../komponenter/MålformVelger';
import { useBrukerContext } from '../BrukerContext';
import { useManuelleBrevmottakerePåFagsakContext } from '../ManuelleBrevmottakerePåFagsakContext';

enum BarnIBrevÅrsak {
    BARN_SØKT_FOR,
    BARN_BOSATT_MED_SØKER,
}

export function DokumentutsendingSkjema() {
    const { bruker } = useBrukerContext();

    const saksbehandler = useSaksbehandler();

    const {
        hentForhåndsvisningPåFagsak,
        hentetDokument,
        skjema,
        nullstillSkjema,
        senderBrev,
        sendBrevPåFagsak,
        skjemaErLåst,
        hentSkjemaFeilmelding,
        settVisfeilmeldinger,
        visForhåndsvisningBeskjed,
    } = useDokumentutsendingContext();

    const { manuelleBrevmottakerePåFagsak } = useManuelleBrevmottakerePåFagsakContext();

    const årsakVerdi = skjema.felter.årsak.verdi;

    const finnBarnIBrevÅrsak = (årsak: DokumentÅrsak | undefined): BarnIBrevÅrsak | undefined => {
        switch (årsak) {
            case DokumentÅrsak.KAN_SØKE_EØS:
            case DokumentÅrsak.TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_HAR_FÅTT_EN_SØKNAD_FRA_ANNEN_FORELDER:
            case DokumentÅrsak.TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_VARSEL_OM_REVURDERING:
            case DokumentÅrsak.TIL_FORELDER_OMFATTET_NORSK_LOVGIVNING_HENTER_IKKE_REGISTEROPPLYSNINGER:
                return BarnIBrevÅrsak.BARN_SØKT_FOR;
            case DokumentÅrsak.KAN_HA_RETT_TIL_PENGESTØTTE_FRA_NAV:
                return BarnIBrevÅrsak.BARN_BOSATT_MED_SØKER;
            default:
                return undefined;
        }
    };

    const barnIBrevÅrsakTilTittel: Record<BarnIBrevÅrsak, string> = {
        [BarnIBrevÅrsak.BARN_SØKT_FOR]: 'Hvilke barn er søkt for?',
        [BarnIBrevÅrsak.BARN_BOSATT_MED_SØKER]: 'Hvilke barn er bosatt med søker?',
    };

    const barnIBrevÅrsak = finnBarnIBrevÅrsak(årsakVerdi);

    const skalViseFritekstAvsnitt = årsakVerdi === DokumentÅrsak.INNHENTE_OPPLYSNINGER_KLAGE;

    const erLesevisning = !saksbehandler.harSkrivetilgang;

    function onLeggTilBarn(barn: IBarnMedOpplysninger) {
        skjema.felter.barnIBrev.validerOgSettFelt([...skjema.felter.barnIBrev.verdi, barn]);
    }

    return (
        <LeggTilBarnModalContextProvider
            barn={skjema.felter.barnIBrev.verdi}
            onLeggTilBarn={onLeggTilBarn}
            harBrevmottaker={manuelleBrevmottakerePåFagsak.length > 0}
        >
            {!erLesevisning && <LeggTilBarnModal />}
            <Box padding={'space-32'} overflow={'auto'}>
                <Heading size={'large'} level={'1'} children={'Send informasjonsbrev'} />
                {manuelleBrevmottakerePåFagsak.length > 0 && (
                    <Box marginBlock={'space-16'}>
                        <BrevmottakereAlert
                            erPåBehandling={false}
                            brevmottakere={manuelleBrevmottakerePåFagsak}
                            bruker={bruker}
                        />
                    </Box>
                )}
                <Box asChild maxWidth={'30rem'} marginBlock={'space-32 space-0'}>
                    <Fieldset
                        error={hentSkjemaFeilmelding()}
                        errorPropagation={false}
                        legend="Send informasjonsbrev"
                        hideLegend
                    >
                        <Select
                            {...skjema.felter.årsak.hentNavBaseSkjemaProps(skjema.visFeilmeldinger)}
                            label={'Velg årsak'}
                            value={skjema.felter.årsak.verdi || ''}
                            onChange={(event: ChangeEvent<HTMLSelectElement>): void => {
                                skjema.felter.årsak.onChange(event.target.value as DokumentÅrsak);
                            }}
                            size={'medium'}
                        >
                            <option value="">Velg</option>
                            {Object.values(DokumentÅrsak).map(årsak => {
                                return (
                                    <option
                                        key={årsak}
                                        aria-selected={skjema.felter.årsak.verdi === årsak}
                                        value={årsak}
                                    >
                                        {dokumentÅrsak[årsak]}
                                    </option>
                                );
                            })}
                        </Select>
                        {skalViseFritekstAvsnitt && (
                            <Box paddingBlock={'space-4 space-0'}>
                                <FritekstAvsnitt />
                            </Box>
                        )}
                        <Box marginBlock={'space-8 space-32'}>
                            {barnIBrevÅrsak != undefined && (
                                <>
                                    <BarnIBrevSkjema
                                        barnIBrevFelt={skjema.felter.barnIBrev}
                                        visFeilmeldinger={skjema.visFeilmeldinger}
                                        settVisFeilmeldinger={settVisfeilmeldinger}
                                        tittel={barnIBrevÅrsakTilTittel[barnIBrevÅrsak]}
                                    />
                                    {!erLesevisning && <LeggTilBarnKnapp />}
                                </>
                            )}
                        </Box>
                        <MålformVelger
                            målformFelt={skjema.felter.målform}
                            visFeilmeldinger={skjema.visFeilmeldinger}
                            erLesevisning={false}
                            Legend={<Label children={'Målform'} />}
                        />
                        {årsakVerdi && visForhåndsvisningBeskjed() && (
                            <Box marginBlock={'space-16'}>
                                <InfoCard data-color="info">
                                    <InfoCard.Message icon={<InformationSquareIcon aria-hidden />}>
                                        Du har gjort endringer i brevet som ikke er forhåndsvist
                                    </InfoCard.Message>
                                </InfoCard>
                            </Box>
                        )}
                    </Fieldset>
                </Box>
                <HStack justify={'space-between'} marginBlock={'space-24 space-0'}>
                    <HStack gap={'space-16'}>
                        <Button
                            size="medium"
                            variant="primary"
                            loading={senderBrev()}
                            disabled={skjemaErLåst()}
                            onClick={sendBrevPåFagsak}
                        >
                            Send brev
                        </Button>

                        <Button size="medium" variant="tertiary" onClick={nullstillSkjema}>
                            Avbryt
                        </Button>
                    </HStack>
                    {skjema.felter.årsak.verdi && (
                        <Button
                            variant={'tertiary'}
                            id={'forhandsvis-vedtaksbrev'}
                            size={'medium'}
                            loading={hentetDokument.status === RessursStatus.HENTER}
                            disabled={skjemaErLåst()}
                            onClick={hentForhåndsvisningPåFagsak}
                            icon={<FileTextIcon />}
                        >
                            {'Forhåndsvis'}
                        </Button>
                    )}
                </HStack>
            </Box>
        </LeggTilBarnModalContextProvider>
    );
}

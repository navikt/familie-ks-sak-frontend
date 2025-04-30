import React from 'react';

import styled from 'styled-components';

import { FileTextIcon } from '@navikt/aksel-icons';
import { Alert, Box, Button, Fieldset, Heading, Label, Select } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer';

import BarnIBrevSkjema from './BarnIBrev/BarnIBrevSkjema';
import { useAppContext } from '../../../context/AppContext';
import {
    dokumentÅrsak,
    DokumentÅrsak,
    useDokumentutsendingContext,
} from '../../../context/DokumentutsendingContext';
import { useFagsakContext } from '../../../context/fagsak/FagsakContext';
import { BrevmottakereAlert } from '../../../komponenter/BrevmottakereAlert';
import FritekstAvsnitt from '../../../komponenter/FritekstAvsnitt';
import MålformVelger from '../../../komponenter/MålformVelger';
import type { IPersonInfo } from '../../../typer/person';
import { ToggleNavn } from '../../../typer/toggles';

interface Props {
    bruker: IPersonInfo;
}

const Container = styled.div`
    padding: 2rem;
    overflow: auto;
`;

const StyledFieldset = styled(Fieldset)`
    max-width: 30rem;
    margin-top: 2rem;
`;

const FeltMargin = styled.div`
    margin-bottom: 2rem;
`;

const StyledAlert = styled(Alert)`
    margin: 1rem 0;
`;

const Handlinger = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 1.5rem;
`;

const SendBrevKnapp = styled(Button)`
    margin-right: 1rem;
`;

const StyledBrevmottakereAlert = styled(BrevmottakereAlert)`
    margin: 1rem 0;
`;

enum BarnIBrevÅrsak {
    BARN_SØKT_FOR,
    BARN_BOSATT_MED_SØKER,
}

const DokumentutsendingSkjema: React.FC<Props> = ({ bruker }) => {
    const { toggles } = useAppContext();
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

    const { manuelleBrevmottakerePåFagsak } = useFagsakContext();

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

    return (
        <Container>
            <Heading size={'large'} level={'1'} children={'Send informasjonsbrev'} />

            {manuelleBrevmottakerePåFagsak.length > 0 && (
                <StyledBrevmottakereAlert
                    erPåBehandling={false}
                    brevmottakere={manuelleBrevmottakerePåFagsak}
                    bruker={bruker}
                />
            )}

            <StyledFieldset
                error={hentSkjemaFeilmelding()}
                errorPropagation={false}
                legend="Send informasjonsbrev"
                hideLegend
            >
                <Select
                    {...skjema.felter.årsak.hentNavBaseSkjemaProps(skjema.visFeilmeldinger)}
                    label={'Velg årsak'}
                    value={skjema.felter.årsak.verdi || ''}
                    onChange={(event: React.ChangeEvent<HTMLSelectElement>): void => {
                        skjema.felter.årsak.onChange(event.target.value as DokumentÅrsak);
                    }}
                    size={'medium'}
                >
                    <option value="">Velg</option>
                    {Object.values(DokumentÅrsak)
                        .filter(årsak => {
                            if (årsak === DokumentÅrsak.INNHENTE_OPPLYSNINGER_KLAGE) {
                                return toggles[ToggleNavn.innhenteOpplysningerKlageBrev];
                            }
                            return true;
                        })
                        .map(årsak => {
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
                    <Box paddingBlock={'space-4 0'}>
                        <FritekstAvsnitt />
                    </Box>
                )}

                <FeltMargin>
                    {barnIBrevÅrsak != undefined && (
                        <BarnIBrevSkjema
                            barnIBrevFelt={skjema.felter.barnIBrev}
                            visFeilmeldinger={skjema.visFeilmeldinger}
                            settVisFeilmeldinger={settVisfeilmeldinger}
                            tittel={barnIBrevÅrsakTilTittel[barnIBrevÅrsak]}
                        />
                    )}
                </FeltMargin>

                <MålformVelger
                    målformFelt={skjema.felter.målform}
                    visFeilmeldinger={skjema.visFeilmeldinger}
                    erLesevisning={false}
                    Legend={<Label children={'Målform'} />}
                />

                {årsakVerdi && visForhåndsvisningBeskjed() && (
                    <StyledAlert variant="info">
                        Du har gjort endringer i brevet som ikke er forhåndsvist
                    </StyledAlert>
                )}
            </StyledFieldset>

            <Handlinger>
                <div>
                    <SendBrevKnapp
                        size="medium"
                        variant="primary"
                        loading={senderBrev()}
                        disabled={skjemaErLåst()}
                        onClick={sendBrevPåFagsak}
                    >
                        Send brev
                    </SendBrevKnapp>

                    <Button size="medium" variant="tertiary" onClick={nullstillSkjema}>
                        Avbryt
                    </Button>
                </div>
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
            </Handlinger>
        </Container>
    );
};

export default DokumentutsendingSkjema;

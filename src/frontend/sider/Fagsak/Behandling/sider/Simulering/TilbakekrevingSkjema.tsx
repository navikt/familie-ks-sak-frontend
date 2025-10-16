import styled from 'styled-components';

import { ExternalLinkIcon, FileTextIcon } from '@navikt/aksel-icons';
import {
    Alert,
    BodyLong,
    BodyShort,
    Button,
    ErrorSummary,
    Fieldset,
    Heading,
    HelpText,
    HStack,
    Label,
    Link,
    Radio,
    RadioGroup,
    Spacer,
    Tag,
    Textarea,
} from '@navikt/ds-react';
import type { Ressurs } from '@navikt/familie-typer';
import { RessursStatus } from '@navikt/familie-typer';

import { useSimuleringContext } from './SimuleringContext';
import { ModalType } from '../../../../../context/ModalContext';
import { useModal } from '../../../../../hooks/useModal';
import {
    mutationKey,
    useOpprettForhåndsvisbarTilbakekrevingVarselbrevPdf,
} from '../../../../../hooks/useOpprettForhåndsvisbarTilbakekrevingVarselbrevPdf';
import type { BrevmottakereAlertBehandlingProps } from '../../../../../komponenter/BrevmottakereAlert';
import { BrevmottakereAlert } from '../../../../../komponenter/BrevmottakereAlert';
import { Tilbakekrevingsvalg, visTilbakekrevingsvalg } from '../../../../../typer/simulering';
import type { Målform } from '../../../../../typer/søknad';
import { målform } from '../../../../../typer/søknad';
import { useFagsakContext } from '../../../FagsakContext';
import { useBehandlingContext } from '../../context/BehandlingContext';

const ForhåndsvisVarselKnappContainer = styled.div`
    display: flex;
    justify-content: flex-end;
    margin-bottom: 1rem;
`;

const FritekstVarsel = styled.div`
    margin-left: 2rem;
`;

const StyledHelpText = styled(HelpText)`
    margin-left: 1rem;
`;

const StyledHelpTextContainer = styled.div`
    max-width: 20rem;
`;

const StyledFieldset = styled(Fieldset)`
    margin-top: 4rem;
    width: 90%;
    max-width: 40rem;
`;

const StyledAlert = styled(Alert)`
    margin-top: 1.5rem;
`;

const StyledLabel = styled(Label)`
    margin-top: 4rem;
`;

const StyledBrevmottakereAlert = styled(BrevmottakereAlert)<BrevmottakereAlertBehandlingProps>`
    margin: 1rem 0 3rem 2rem;
`;

const TilbakekrevingSkjema = ({
    søkerMålform,
    harÅpenTilbakekrevingRessurs,
}: {
    søkerMålform: Målform;
    harÅpenTilbakekrevingRessurs: Ressurs<boolean>;
}) => {
    const { vurderErLesevisning, åpenBehandling } = useBehandlingContext();
    const { tilbakekrevingSkjema, hentFeilTilOppsummering, maksLengdeTekst } = useSimuleringContext();
    const { fritekstVarsel, begrunnelse, tilbakekrevingsvalg } = tilbakekrevingSkjema.felter;

    const { åpneModal: åpneForhåndsvisOpprettingAvPdfModal } = useModal(ModalType.FORHÅNDSVIS_OPPRETTING_AV_PDF);

    const { mutate: opprettTilbakekrevingVarselBrevPdf, isPending: isOpprettTilbakekrevingVarselBrevPdfPending } =
        useOpprettForhåndsvisbarTilbakekrevingVarselbrevPdf({
            onMutate: () => åpneForhåndsvisOpprettingAvPdfModal({ mutationKey }),
        });

    const { bruker: brukerRessurs } = useFagsakContext();
    const bruker = brukerRessurs.status === RessursStatus.SUKSESS ? brukerRessurs.data : undefined;

    const erLesevisning = vurderErLesevisning();

    const radioOnChange = (tilbakekrevingsalternativ: Tilbakekrevingsvalg) => {
        tilbakekrevingSkjema.felter.tilbakekrevingsvalg.validerOgSettFelt(tilbakekrevingsalternativ);
    };

    if (
        harÅpenTilbakekrevingRessurs.status === RessursStatus.FEILET ||
        harÅpenTilbakekrevingRessurs.status === RessursStatus.FUNKSJONELL_FEIL ||
        harÅpenTilbakekrevingRessurs.status === RessursStatus.IKKE_TILGANG
    ) {
        return (
            <StyledAlert variant="error">
                Det har skjedd er feil:
                {harÅpenTilbakekrevingRessurs.frontendFeilmelding}
            </StyledAlert>
        );
    }

    if (
        harÅpenTilbakekrevingRessurs.status === RessursStatus.SUKSESS &&
        harÅpenTilbakekrevingRessurs.data &&
        !vurderErLesevisning()
    ) {
        return (
            <>
                <StyledLabel>Tilbakekrevingsvalg</StyledLabel>
                <StyledAlert variant="warning">
                    Det foreligger en åpen tilbakekrevingsbehandling. Endringer i vedtaket vil automatisk oppdatere
                    eksisterende feilutbetalte perioder og beløp.
                </StyledAlert>
            </>
        );
    }

    if (vurderErLesevisning() && !tilbakekrevingSkjema.felter.tilbakekrevingsvalg.verdi) {
        return (
            <>
                <StyledLabel>Tilbakekrevingsvalg</StyledLabel>
                <StyledAlert variant="warning">
                    Tilbakekreving uten varsel er valgt automatisk, da feilutbetailngen ble avdekket etter at saken ble
                    sendt til beslutter.
                </StyledAlert>
            </>
        );
    }

    return (
        <>
            <StyledFieldset legend="Tilbakekreving">
                <Textarea
                    label={
                        <HStack>
                            Årsak til feilutbetaling og videre behandling
                            <StyledHelpText title="Hvordan skal feltet fylles ut?" placement="right">
                                <StyledHelpTextContainer>
                                    <Heading size="xsmall">Hvordan skal feltet fylles ut?</Heading>
                                    <BodyLong size="small">
                                        Pass på at teksten besvarer dette:
                                        <ul>
                                            <li>Hva er årsaken til feilutbetaling?</li>
                                            <li>Hvordan ble feilutbetalingen oppdaget?</li>
                                            <li>Når ble feilutbetalingen oppdaget?</li>
                                        </ul>
                                    </BodyLong>
                                    <Heading size="xsmall">Teksteksempel ved opprett tilbakekreving</Heading>
                                    <BodyLong size="small" spacing={true}>
                                        Barn født 01.02.03 flyttet fra bruker 01.01.2019. Bruker har mottatt
                                        kontantstøtte for barnet etter at barnet ikke lenger bor fast sammen med bruker.
                                    </BodyLong>
                                    <BodyLong size="small" spacing={true}>
                                        Søknaden ble mottatt 11.03.2022. Bruker har ikke meldt fra om dette selv.
                                    </BodyLong>
                                    <Heading size="xsmall">Teksteksempel ved avvent tilbakekreving</Heading>
                                    <BodyLong size="small">
                                        Feilutbetaling gjelder kun inneværende måned, og utbetalingen stoppes antakelig.
                                    </BodyLong>
                                </StyledHelpTextContainer>
                            </StyledHelpText>
                        </HStack>
                    }
                    {...begrunnelse.hentNavInputProps(
                        tilbakekrevingSkjema.visFeilmeldinger || begrunnelse.verdi.length > maksLengdeTekst
                    )}
                    readOnly={vurderErLesevisning()}
                    maxLength={maksLengdeTekst}
                    description="Hva er årsaken til feilutbetaling? Hvordan og når ble feilutbetalingen oppdaget? Begrunn hvordan feilutbetalingen skal behandles videre."
                />
                {erLesevisning ? (
                    <>
                        <Label>Fastsett videre behandling</Label>
                        <BodyShort>
                            {tilbakekrevingsvalg.verdi
                                ? visTilbakekrevingsvalg[tilbakekrevingsvalg.verdi]
                                : 'Ingen valgt'}
                        </BodyShort>
                    </>
                ) : (
                    <RadioGroup
                        {...tilbakekrevingsvalg.hentNavBaseSkjemaProps(tilbakekrevingSkjema.visFeilmeldinger)}
                        value={tilbakekrevingsvalg.verdi}
                        onChange={(val: Tilbakekrevingsvalg) => radioOnChange(val)}
                        legend={
                            <HStack>
                                Fastsett videre behandling
                                <StyledHelpText placement="right">
                                    <StyledHelpTextContainer>
                                        <Heading size="small">Hvordan fastsette videre behandling?</Heading>
                                        <Heading size="xsmall">Opprett tilbakekreving, send varsel</Heading>
                                        <BodyLong size="small" spacing={true}>
                                            Hovedregel er at en feilutbetaling skal varsles, og at bruker får varsel
                                            samtidig med revurderingsvedtaket.
                                        </BodyLong>
                                        <Heading size="xsmall">Opprett tilbakekreving, ikke send varsel</Heading>
                                        <BodyLong size="small" spacing={true}>
                                            Velges unntaksvis når man er usikker på om inneværende måned blir
                                            feilutbetalt eller ikke. Eller at det fremstår som relativt sikkert at
                                            feilutbetalt beløp ikke skal kreves inn.
                                        </BodyLong>
                                        <Heading size="small">Avvent tilbakekreving</Heading>
                                        <BodyLong size="small" spacing={true}>
                                            Velges når man er rimelig sikker på at det ikke blir feilutbetaling.
                                        </BodyLong>
                                    </StyledHelpTextContainer>
                                </StyledHelpText>
                            </HStack>
                        }
                    >
                        {bruker && !bruker.dødsfallDato && (
                            <>
                                <Radio
                                    value={Tilbakekrevingsvalg.OPPRETT_TILBAKEKREVING_MED_VARSEL}
                                    name={'tilbakekreving'}
                                    id={'Opprett-tilbakekreving-send-varsel'}
                                >
                                    Opprett tilbakekreving, send varsel
                                </Radio>
                                {åpenBehandling.status === RessursStatus.SUKSESS &&
                                    tilbakekrevingsvalg.verdi ===
                                        Tilbakekrevingsvalg.OPPRETT_TILBAKEKREVING_MED_VARSEL && (
                                        <StyledBrevmottakereAlert
                                            bruker={bruker}
                                            erPåBehandling={true}
                                            erLesevisning={erLesevisning}
                                            åpenBehandling={åpenBehandling.data}
                                            brevmottakere={åpenBehandling.data.brevmottakere}
                                        />
                                    )}
                                {fritekstVarsel.erSynlig && (
                                    <FritekstVarsel>
                                        <Textarea
                                            label={
                                                <HStack align="center" justify="space-between" wrap={false}>
                                                    <HStack align="center" wrap={false}>
                                                        <Label>Fritekst i varselet</Label>
                                                        <StyledHelpText placement="right">
                                                            <StyledHelpTextContainer>
                                                                <BodyLong size="small" spacing={true}>
                                                                    Her skal du oppgi hvorfor brukeren ikke skulle fått
                                                                    utbetalt ytelsen i perioden(e). Du må også oppgi
                                                                    hvordan feilutbetalingen ble oppdaget, hvem som
                                                                    oppdaget den og når den ble oppdaget eller meldt til
                                                                    Nav.
                                                                </BodyLong>
                                                                <BodyLong size="small" spacing={true}>
                                                                    Eksempel på tekst:
                                                                </BodyLong>
                                                                <BodyLong size="small" spacing={true}>
                                                                    Vi mottok melding fra deg (dato) om at du flyttet
                                                                    utenlands (dato). Du har ikke rett på kontantstøtte
                                                                    når du oppholder deg utenlands. Da vi mottok
                                                                    meldingen fra deg, var det allerede utbetalt
                                                                    kontantstøtte for perioden (Fom dato - Tom dato).
                                                                </BodyLong>
                                                                <Link
                                                                    href="https://navno.sharepoint.com/sites/intranett-kommunikasjon/SitePages/Språk.aspx"
                                                                    target="_blank"
                                                                >
                                                                    <span>Se retningslinjer for klarspråk:</span>
                                                                    <ExternalLinkIcon fontSize={'1.3rem'} />
                                                                </Link>
                                                            </StyledHelpTextContainer>
                                                        </StyledHelpText>
                                                    </HStack>
                                                    <Spacer />
                                                    <Tag variant="neutral" size="small">
                                                        Skriv {målform[søkerMålform].toLowerCase()}
                                                    </Tag>
                                                </HStack>
                                            }
                                            {...fritekstVarsel.hentNavInputProps(
                                                tilbakekrevingSkjema.visFeilmeldinger ||
                                                    fritekstVarsel.verdi.length > maksLengdeTekst
                                            )}
                                            readOnly={vurderErLesevisning()}
                                            maxLength={maksLengdeTekst}
                                        />

                                        <ForhåndsvisVarselKnappContainer>
                                            <Button
                                                variant={'tertiary'}
                                                id={'forhandsvis-varsel'}
                                                onClick={() => {
                                                    if (åpenBehandling.status !== RessursStatus.SUKSESS) {
                                                        // TODO: Fjern når BehanldingContext alltid har en behandling. Dette burde aldri skje.
                                                        return;
                                                    }
                                                    opprettTilbakekrevingVarselBrevPdf({
                                                        behandlingId: åpenBehandling.data.behandlingId,
                                                        payload: { fritekst: fritekstVarsel.verdi },
                                                    });
                                                }}
                                                size={'small'}
                                                icon={<FileTextIcon />}
                                                disabled={isOpprettTilbakekrevingVarselBrevPdfPending}
                                            >
                                                Forhåndsvis varsel
                                            </Button>
                                        </ForhåndsvisVarselKnappContainer>
                                    </FritekstVarsel>
                                )}
                            </>
                        )}
                        <Radio
                            value={Tilbakekrevingsvalg.OPPRETT_TILBAKEKREVING_UTEN_VARSEL}
                            name={'tilbakekreving'}
                            id={'Opprett-tilbakekreving-ikke-send-varsel'}
                        >
                            Opprett tilbakekreving, ikke send varsel
                        </Radio>
                        <Radio
                            value={Tilbakekrevingsvalg.IGNORER_TILBAKEKREVING}
                            name={'tilbakekreving'}
                            id={'avvent-tilbakekreving'}
                        >
                            Avvent tilbakekreving
                        </Radio>
                    </RadioGroup>
                )}
                {vurderErLesevisning() && fritekstVarsel.erSynlig && (
                    <Textarea
                        label="Fritekst i varselet"
                        {...fritekstVarsel.hentNavInputProps(tilbakekrevingSkjema.visFeilmeldinger)}
                        readOnly={vurderErLesevisning()}
                    />
                )}

                {tilbakekrevingSkjema.visFeilmeldinger && hentFeilTilOppsummering().length > 0 && (
                    <ErrorSummary heading={'For å gå videre må du rette opp følgende:'}>
                        {hentFeilTilOppsummering().map(item => (
                            <ErrorSummary.Item href={`#${item.skjemaelementId}`} key={item.skjemaelementId}>
                                {item.feilmelding}
                            </ErrorSummary.Item>
                        ))}
                    </ErrorSummary>
                )}
            </StyledFieldset>
        </>
    );
};
export default TilbakekrevingSkjema;

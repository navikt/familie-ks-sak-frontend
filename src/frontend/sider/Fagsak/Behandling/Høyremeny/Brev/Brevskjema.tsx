import type { ChangeEvent } from 'react';

import { FileTextIcon, PlusCircleIcon, TrashIcon } from '@navikt/aksel-icons';
import { Button, Fieldset, HStack, Label, Select, Tag, Textarea, TextField, VStack } from '@navikt/ds-react';
import { FamilieReactSelect } from '@navikt/familie-form-elements';
import type { FeltState } from '@navikt/familie-skjema';
import type { Ressurs } from '@navikt/familie-typer';
import { RessursStatus } from '@navikt/familie-typer';

import { BarnBrevetGjelder } from './BarnBrevetGjelder';
import BrevmottakerListe from './BrevmottakerListe';
import styles from './Brevskjema.module.css';
import type { BrevtypeSelect, ISelectOptionMedBrevtekst } from './typer';
import { Brevmal, brevmaler, leggTilValuePåOption, opplysningsdokumenter } from './typer';
import { useBrevModul } from './useBrevModul';
import { ModalType } from '../../../../../context/ModalContext';
import { useModal } from '../../../../../hooks/useModal';
import {
    mutationKey,
    useOpprettForhåndsvisbarBehandlingBrevPdf,
} from '../../../../../hooks/useOpprettForhåndsvisbarBehandlingBrevPdf';
import Knapperekke from '../../../../../komponenter/Knapperekke';
import SkjultLegend from '../../../../../komponenter/SkjultLegend';
import type { IBehandling } from '../../../../../typer/behandling';
import type { IManueltBrevRequestPåBehandling } from '../../../../../typer/dokument';
import type { IGrunnlagPerson, IPersonInfo } from '../../../../../typer/person';
import { PersonType } from '../../../../../typer/person';
import { målform } from '../../../../../typer/søknad';
import { lagPersonLabel } from '../../../../../utils/formatter';
import type { IFritekstFelt } from '../../../../../utils/fritekstfelter';
import { hentFrontendFeilmelding } from '../../../../../utils/ressursUtils';
import { useBehandlingContext } from '../../context/BehandlingContext';

interface IProps {
    onSubmitSuccess: () => void;
    bruker: IPersonInfo;
}

export const Brevskjema = ({ onSubmitSuccess, bruker }: IProps) => {
    const { behandling, settÅpenBehandling, vurderErLesevisning, hentLogg } = useBehandlingContext();
    const erLesevisning = vurderErLesevisning();

    const {
        skjema,
        hentSkjemaData,
        kanSendeSkjema,
        mottakersMålform,
        onSubmit,
        personer,
        hentMuligeBrevMaler,
        makslengdeFritekstHvertKulepunkt,
        maksAntallKulepunkter,
        maksLengdeFritekstAvsnitt,
        leggTilFritekst,
        settVisfeilmeldinger,
        erBrevmalMedObligatoriskFritekst,
        brevmottakere,
        visFritekstAvsnittTekstboks,
        settVisFritekstAvsnittTekstboks,
    } = useBrevModul();

    const { åpneModal: åpneForhåndsvisOpprettingAvPdfModal } = useModal(ModalType.FORHÅNDSVIS_OPPRETTING_AV_PDF);

    const { mutate: opprettForhåndsvisbarBrevPdf, isPending: isOpprettForhåndsvisbarBrevPdfPending } =
        useOpprettForhåndsvisbarBehandlingBrevPdf({
            onMutate: () => åpneForhåndsvisOpprettingAvPdfModal({ mutationKey }),
        });

    const brevMaler = hentMuligeBrevMaler();
    const skjemaErLåst = skjema.submitRessurs.status === RessursStatus.HENTER || isOpprettForhåndsvisbarBrevPdfPending;

    const fieldsetId = 'Fritekster-brev';
    const erMaksAntallKulepunkter = skjema.felter.friteksterKulepunkter.verdi.length >= maksAntallKulepunkter;

    const onChangeFritekst = (event: ChangeEvent<HTMLTextAreaElement>, fritekstId: number) =>
        skjema.felter.friteksterKulepunkter.validerOgSettFelt([
            ...skjema.felter.friteksterKulepunkter.verdi.map(mapFritekst => {
                if (mapFritekst.verdi.id === fritekstId) {
                    return mapFritekst.valider({
                        ...mapFritekst,
                        verdi: {
                            ...mapFritekst.verdi,
                            tekst: event.target.value,
                        },
                    });
                } else {
                    return mapFritekst;
                }
            }),
        ]);

    if (erLesevisning) {
        return null;
    }

    return (
        <>
            <Fieldset error={hentFrontendFeilmelding(skjema.submitRessurs)} legend={'Send brev'} hideLegend>
                <Label>Brev sendes til</Label>
                <BrevmottakerListe bruker={bruker} brevmottakere={brevmottakere} />
                <VStack gap={'space-16'}>
                    <Select
                        {...skjema.felter.mottakerIdent.hentNavInputProps(skjema.visFeilmeldinger)}
                        label={'Velg mottaker'}
                        onChange={(event: ChangeEvent<HTMLSelectElement>): void => {
                            skjema.felter.mottakerIdent.onChange(event.target.value);
                        }}
                    >
                        <option value={''}>Velg</option>
                        {personer
                            .filter((person: IGrunnlagPerson) => person.type !== PersonType.BARN)
                            .map((person, index) => {
                                return (
                                    <option
                                        aria-selected={person.personIdent === skjema.felter.mottakerIdent.verdi}
                                        key={`${index}_${person.fødselsdato}`}
                                        value={person.personIdent}
                                    >
                                        {lagPersonLabel(person.personIdent, personer)}
                                    </option>
                                );
                            })}
                    </Select>
                    <Select
                        {...skjema.felter.brevmal.hentNavInputProps(skjema.visFeilmeldinger)}
                        label={'Velg brevmal'}
                        onChange={(event: ChangeEvent<BrevtypeSelect>): void => {
                            skjema.felter.brevmal.onChange(event.target.value);
                            skjema.felter.dokumenter.nullstill();
                        }}
                    >
                        <option value={''}>Velg</option>
                        {brevMaler.map(mal => {
                            return (
                                <option aria-selected={mal === skjema.felter.brevmal.verdi} key={mal} value={mal}>
                                    {brevmaler[mal]}
                                </option>
                            );
                        })}
                    </Select>
                    {skjema.felter.dokumenter.erSynlig && (
                        <FamilieReactSelect
                            {...skjema.felter.dokumenter.hentNavInputProps(skjema.visFeilmeldinger)}
                            label={
                                <HStack marginBlock={'space-16 space-8'} justify={'space-between'}>
                                    <Label
                                        htmlFor={skjema.felter.dokumenter.hentNavInputProps(skjema.visFeilmeldinger).id}
                                    >
                                        Velg dokumenter
                                    </Label>
                                    <Tag variant="neutral" size="small">
                                        Skriv {målform[mottakersMålform()].toLowerCase()}
                                    </Tag>
                                </HStack>
                            }
                            creatable={false}
                            isMulti={true}
                            onChange={valgteOptions => {
                                skjema.felter.dokumenter.onChange(
                                    valgteOptions === null ? [] : (valgteOptions as ISelectOptionMedBrevtekst[])
                                );
                            }}
                            options={opplysningsdokumenter.map(leggTilValuePåOption)}
                        />
                    )}
                    {skjema.felter.friteksterKulepunkter.erSynlig && (
                        <>
                            <Label htmlFor={fieldsetId}>Legg til kulepunkt</Label>
                            <>
                                <Fieldset
                                    id={fieldsetId}
                                    error={skjema.visFeilmeldinger && hentFrontendFeilmelding(skjema.submitRessurs)}
                                    hideLegend
                                    legend={'Legg til kulepunkt'}
                                >
                                    {skjema.felter.friteksterKulepunkter.verdi.map(
                                        (fritekst: FeltState<IFritekstFelt>, index: number) => {
                                            const fritekstId = fritekst.verdi.id;

                                            return (
                                                <HStack key={`fritekst-${fritekstId}`}>
                                                    <SkjultLegend>{`Kulepunkt ${fritekstId}`}</SkjultLegend>
                                                    <Textarea
                                                        key={`fritekst-${fritekstId}`}
                                                        id={`${fritekstId}`}
                                                        label={`Kulepunkt ${fritekstId}`}
                                                        hideLabel
                                                        size={'small'}
                                                        className={styles.textarea}
                                                        value={fritekst.verdi.tekst}
                                                        maxLength={makslengdeFritekstHvertKulepunkt}
                                                        onChange={event => onChangeFritekst(event, fritekstId)}
                                                        error={skjema.visFeilmeldinger && fritekst.feilmelding}
                                                        /* eslint-disable-next-line jsx-a11y/no-autofocus */
                                                        autoFocus
                                                    />
                                                    {!(
                                                        erBrevmalMedObligatoriskFritekst(
                                                            skjema.felter.brevmal.verdi as Brevmal
                                                        ) && index === 0
                                                    ) && (
                                                        <Button
                                                            onClick={() => {
                                                                skjema.felter.friteksterKulepunkter.validerOgSettFelt([
                                                                    ...skjema.felter.friteksterKulepunkter.verdi.filter(
                                                                        mapFritekst =>
                                                                            mapFritekst.verdi.id !== fritekst.verdi.id
                                                                    ),
                                                                ]);
                                                            }}
                                                            id={`fjern_fritekst-${fritekstId}`}
                                                            size={'small'}
                                                            variant={'tertiary'}
                                                            aria-label={'Fjern fritekst'}
                                                            icon={<TrashIcon />}
                                                            className={styles.removeButton}
                                                        >
                                                            {'Fjern'}
                                                        </Button>
                                                    )}
                                                </HStack>
                                            );
                                        }
                                    )}
                                </Fieldset>
                                {!erMaksAntallKulepunkter && (
                                    <Button
                                        onClick={() => leggTilFritekst()}
                                        id={`legg-til-fritekst`}
                                        size={'small'}
                                        variant={'tertiary'}
                                        icon={<PlusCircleIcon />}
                                        className={styles.addButton}
                                    >
                                        {'Legg til kulepunkt'}
                                    </Button>
                                )}
                            </>
                        </>
                    )}
                    {skjema.felter.fritekstAvsnitt.erSynlig && (
                        <>
                            <Label htmlFor={fieldsetId}>Legg til fritekst avsnitt</Label>
                            {visFritekstAvsnittTekstboks ? (
                                <Fieldset legend="Legg til fritekst avsnitt" hideLegend id={fieldsetId}>
                                    <HStack>
                                        <Textarea
                                            label="Skriv inn fritekstavsnitt"
                                            className={styles.freetext}
                                            hideLabel
                                            size={'small'}
                                            value={skjema.felter.fritekstAvsnitt.verdi}
                                            maxLength={maksLengdeFritekstAvsnitt}
                                            onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                                                skjema.felter.fritekstAvsnitt.validerOgSettFelt(event.target.value)
                                            }
                                            error={
                                                skjema.visFeilmeldinger && skjema.felter.fritekstAvsnitt?.feilmelding
                                            }
                                            /* eslint-disable-next-line jsx-a11y/no-autofocus */
                                            autoFocus
                                        />
                                        <Button
                                            variant={'tertiary'}
                                            className={styles.removeButton}
                                            onClick={() => {
                                                skjema.felter.fritekstAvsnitt.nullstill();
                                                settVisFritekstAvsnittTekstboks(false);
                                            }}
                                            id={`fjern_fritekst`}
                                            size={'small'}
                                            aria-label={'Fjern fritekst'}
                                            icon={<TrashIcon />}
                                        >
                                            {'Fjern'}
                                        </Button>
                                    </HStack>
                                </Fieldset>
                            ) : (
                                skjema.felter.fritekstAvsnitt &&
                                !erLesevisning && (
                                    <Button
                                        variant={'tertiary'}
                                        onClick={() => settVisFritekstAvsnittTekstboks(true)}
                                        id={`legg-til-fritekst-avsnitt`}
                                        size={'small'}
                                        className={styles.addButton}
                                        icon={<PlusCircleIcon />}
                                    >
                                        {'Legg til fritekst avsnitt'}
                                    </Button>
                                )
                            )}
                        </>
                    )}
                    {skjema.felter.barnBrevetGjelder.erSynlig && (
                        <BarnBrevetGjelder
                            barnBrevetGjelderFelt={skjema.felter.barnBrevetGjelder}
                            behandlingsSteg={behandling.steg}
                            visFeilmeldinger={skjema.visFeilmeldinger}
                            settVisFeilmeldinger={settVisfeilmeldinger}
                        />
                    )}
                    {skjema.felter.brevmal.verdi === Brevmal.FORLENGET_SVARTIDSBREV && (
                        <TextField
                            className={styles.textField}
                            {...skjema.felter.antallUkerSvarfrist.hentNavInputProps(skjema.visFeilmeldinger)}
                            label={'Antall uker svarfrist'}
                            size={'small'}
                        />
                    )}
                </VStack>
            </Fieldset>
            <Knapperekke>
                <Button
                    id={'forhandsvis-vedtaksbrev'}
                    variant={'secondary'}
                    size={'medium'}
                    disabled={skjemaErLåst}
                    onClick={() => {
                        if (behandling.behandlingId === undefined) {
                            return; // Dette skal aldri skje
                        }
                        if (kanSendeSkjema()) {
                            opprettForhåndsvisbarBrevPdf({
                                behandlingId: behandling.behandlingId,
                                payload: hentSkjemaData(),
                            });
                        }
                    }}
                    icon={<FileTextIcon />}
                >
                    Forhåndsvis
                </Button>
                <Button
                    variant={'primary'}
                    size={'medium'}
                    loading={skjema.submitRessurs.status === RessursStatus.HENTER}
                    disabled={skjemaErLåst}
                    onClick={() => {
                        onSubmit<IManueltBrevRequestPåBehandling>(
                            {
                                method: 'POST',
                                data: hentSkjemaData(),
                                url: `/familie-ks-sak/api/brev/send-brev/${behandling.behandlingId}`,
                            },
                            (ressurs: Ressurs<IBehandling>) => {
                                onSubmitSuccess();
                                settÅpenBehandling(ressurs);
                                hentLogg();
                            }
                        );
                    }}
                >
                    Send brev
                </Button>
            </Knapperekke>
        </>
    );
};

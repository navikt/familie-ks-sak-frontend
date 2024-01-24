import * as React from 'react';
import { useEffect, useState } from 'react';

import styled from 'styled-components';

import navFarger from 'nav-frontend-core';

import { AddCircle, Delete, FileContent } from '@navikt/ds-icons';
import { Button, Fieldset, Label, Select, Tag, Textarea } from '@navikt/ds-react';
import { FamilieInput, FamilieReactSelect } from '@navikt/familie-form-elements';
import type { FeltState } from '@navikt/familie-skjema';
import type { Ressurs } from '@navikt/familie-typer';
import { RessursStatus } from '@navikt/familie-typer';

import BarnBrevetGjelder from './BarnBrevetGjelder';
import { Brevmal, brevmaler, leggTilValuePåOption, opplysningsdokumenter } from './typer';
import type { BrevtypeSelect, ISelectOptionMedBrevtekst } from './typer';
import { useBehandling } from '../../../../context/behandlingContext/BehandlingContext';
import { useBrevModul } from '../../../../context/BrevModulContext';
import useDokument from '../../../../hooks/useDokument';
import type { IBehandling } from '../../../../typer/behandling';
import { BehandlingSteg, hentStegNummer } from '../../../../typer/behandling';
import type { IManueltBrevRequestPåBehandling } from '../../../../typer/dokument';
import type { IGrunnlagPerson } from '../../../../typer/person';
import { PersonType } from '../../../../typer/person';
import { målform } from '../../../../typer/søknad';
import { lagPersonLabel } from '../../../../utils/formatter';
import type { IFritekstFelt } from '../../../../utils/fritekstfelter';
import { hentFrontendFeilmelding } from '../../../../utils/ressursUtils';
import Knapperekke from '../../Knapperekke';
import PdfVisningModal from '../../PdfVisningModal/PdfVisningModal';
import SkjultLegend from '../../SkjultLegend';

interface IProps {
    onSubmitSuccess: () => void;
}

const StyledSelect = styled(Select)`
    margin-top: 1rem;
`;

const StyledFamilieFritekstFelt = styled.div`
    display: flex;
    .navds-form-field {
        width: 100% !important;
    }
`;

const TextareaBegrunnelseFritekst = styled(Textarea)`
    .navds-textarea__wrapper {
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
    }
`;

const StyledButton = styled(Button)`
    height: fit-content;
    align-self: center;
`;

const StyledTag = styled(Tag)`
    background-color: ${navFarger.navLysGra};
    border-color: ${navFarger.navGra60};
`;

const LabelOgEtikett = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
`;

const FritekstWrapper = styled.div`
    margin-bottom: 1rem;
`;

const StyledFamilieInput = styled(FamilieInput)`
    width: fit-content;
`;

const Brevskjema = ({ onSubmitSuccess }: IProps) => {
    const { åpenBehandling, settÅpenBehandling, vurderErLesevisning, hentLogg } = useBehandling();
    const erLesevisning = vurderErLesevisning();
    const { hentForhåndsvisning, hentetDokument } = useDokument();

    const {
        skjema,
        hentSkjemaData,
        kanSendeSkjema,
        mottakersMålform,
        onSubmit,
        personer,
        settNavigerTilOpplysningsplikt,
        hentMuligeBrevMaler,
        makslengdeFritekst,
        maksAntallKulepunkter,
        leggTilFritekst,
        settVisfeilmeldinger,
        erBrevmalMedObligatoriskFritekst,
    } = useBrevModul();

    const [visForhåndsvisningModal, settForhåndsviningModal] = useState(false);

    useEffect(() => {
        if (hentetDokument.status === RessursStatus.SUKSESS) {
            settForhåndsviningModal(true);
        }
    }, [hentetDokument]);

    useEffect(() => {
        settForhåndsviningModal(false);
    }, []);

    const brevMaler = hentMuligeBrevMaler();
    const skjemaErLåst =
        skjema.submitRessurs.status === RessursStatus.HENTER ||
        hentetDokument.status === RessursStatus.HENTER;

    const behandlingId =
        åpenBehandling.status === RessursStatus.SUKSESS && åpenBehandling.data.behandlingId;

    const fieldsetId = 'Fritekster-brev';
    const erMaksAntallKulepunkter = skjema.felter.fritekster.verdi.length >= maksAntallKulepunkter;

    const behandlingSteg =
        åpenBehandling.status === RessursStatus.SUKSESS ? åpenBehandling.data.steg : undefined;

    const onChangeFritekst = (event: React.ChangeEvent<HTMLTextAreaElement>, fritekstId: number) =>
        skjema.felter.fritekster.validerOgSettFelt([
            ...skjema.felter.fritekster.verdi.map(mapFritekst => {
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
        <div>
            {visForhåndsvisningModal && (
                <PdfVisningModal
                    onRequestClose={() => settForhåndsviningModal(false)}
                    pdfdata={hentetDokument}
                />
            )}
            <Fieldset
                error={
                    hentFrontendFeilmelding(skjema.submitRessurs) ||
                    hentFrontendFeilmelding(hentetDokument)
                }
                legend={'Send brev'}
                hideLegend
            >
                <Select
                    {...skjema.felter.mottakerIdent.hentNavInputProps(skjema.visFeilmeldinger)}
                    label={'Velg mottaker'}
                    placeholder={'Velg mottaker'}
                    onChange={(event: React.ChangeEvent<HTMLSelectElement>): void => {
                        skjema.felter.mottakerIdent.onChange(event.target.value);
                    }}
                >
                    <option value={''}>Velg</option>
                    {personer
                        .filter((person: IGrunnlagPerson) => person.type !== PersonType.BARN)
                        .map((person, index) => {
                            return (
                                <option
                                    aria-selected={
                                        person.personIdent === skjema.felter.mottakerIdent.verdi
                                    }
                                    key={`${index}_${person.fødselsdato}`}
                                    value={person.personIdent}
                                >
                                    {lagPersonLabel(person.personIdent, personer)}
                                </option>
                            );
                        })}
                </Select>
                <StyledSelect
                    {...skjema.felter.brevmal.hentNavInputProps(skjema.visFeilmeldinger)}
                    label={'Velg brevmal'}
                    placeholder={'Velg brevmal'}
                    onChange={(event: React.ChangeEvent<BrevtypeSelect>): void => {
                        skjema.felter.brevmal.onChange(event.target.value);
                        skjema.felter.dokumenter.nullstill();
                    }}
                >
                    <option value={''}>Velg</option>
                    {brevMaler.map(mal => {
                        return (
                            <option
                                aria-selected={mal === skjema.felter.brevmal.verdi}
                                key={mal}
                                value={mal}
                            >
                                {brevmaler[mal]}
                            </option>
                        );
                    })}
                </StyledSelect>

                {skjema.felter.dokumenter.erSynlig && (
                    <FamilieReactSelect
                        {...skjema.felter.dokumenter.hentNavInputProps(skjema.visFeilmeldinger)}
                        label={
                            <LabelOgEtikett>
                                <Label
                                    htmlFor={
                                        skjema.felter.dokumenter.hentNavInputProps(
                                            skjema.visFeilmeldinger
                                        ).id
                                    }
                                >
                                    Velg dokumenter
                                </Label>
                                <StyledTag variant="info" size="small">
                                    Skriv {målform[mottakersMålform()].toLowerCase()}
                                </StyledTag>
                            </LabelOgEtikett>
                        }
                        creatable={false}
                        isMulti={true}
                        onChange={valgteOptions => {
                            skjema.felter.dokumenter.onChange(
                                valgteOptions === null
                                    ? []
                                    : (valgteOptions as ISelectOptionMedBrevtekst[])
                            );
                        }}
                        options={opplysningsdokumenter.map(leggTilValuePåOption)}
                    />
                )}
                {skjema.felter.fritekster.erSynlig && (
                    <FritekstWrapper>
                        <Label htmlFor={fieldsetId}>Legg til kulepunkt</Label>
                        <Fieldset
                            id={fieldsetId}
                            error={
                                skjema.visFeilmeldinger &&
                                hentFrontendFeilmelding(skjema.submitRessurs)
                            }
                            legend={''}
                        >
                            {skjema.felter.fritekster.verdi.map(
                                (fritekst: FeltState<IFritekstFelt>, index: number) => {
                                    const fritekstId = fritekst.verdi.id;

                                    return (
                                        <StyledFamilieFritekstFelt key={`fritekst-${fritekstId}`}>
                                            <SkjultLegend>{`Kulepunkt ${fritekstId}`}</SkjultLegend>
                                            <TextareaBegrunnelseFritekst
                                                key={`fritekst-${fritekstId}`}
                                                id={`${fritekstId}`}
                                                label={`Kulepunkt ${fritekstId}`}
                                                hideLabel
                                                size={'small'}
                                                className={'fritekst-textarea'}
                                                value={fritekst.verdi.tekst}
                                                maxLength={makslengdeFritekst}
                                                onChange={event =>
                                                    onChangeFritekst(event, fritekstId)
                                                }
                                                error={
                                                    skjema.visFeilmeldinger && fritekst.feilmelding
                                                }
                                                /* eslint-disable-next-line jsx-a11y/no-autofocus */
                                                autoFocus
                                            />
                                            {!(
                                                erBrevmalMedObligatoriskFritekst(
                                                    skjema.felter.brevmal.verdi as Brevmal
                                                ) && index === 0
                                            ) && (
                                                <StyledButton
                                                    onClick={() => {
                                                        skjema.felter.fritekster.validerOgSettFelt([
                                                            ...skjema.felter.fritekster.verdi.filter(
                                                                mapFritekst =>
                                                                    mapFritekst.verdi.id !==
                                                                    fritekst.verdi.id
                                                            ),
                                                        ]);
                                                    }}
                                                    id={`fjern_fritekst-${fritekstId}`}
                                                    size={'small'}
                                                    variant={'tertiary'}
                                                    aria-label={'Fjern fritekst'}
                                                    icon={<Delete />}
                                                >
                                                    {'Fjern'}
                                                </StyledButton>
                                            )}
                                        </StyledFamilieFritekstFelt>
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
                                icon={<AddCircle />}
                            >
                                {'Legg til kulepunkt'}
                            </Button>
                        )}
                    </FritekstWrapper>
                )}
                {skjema.felter.barnBrevetGjelder.erSynlig && (
                    <BarnBrevetGjelder
                        barnBrevetGjelderFelt={skjema.felter.barnBrevetGjelder}
                        behandlingsSteg={behandlingSteg}
                        visFeilmeldinger={skjema.visFeilmeldinger}
                        settVisFeilmeldinger={settVisfeilmeldinger}
                    />
                )}
                {skjema.felter.brevmal.verdi === Brevmal.FORLENGET_SVARTIDSBREV && (
                    <StyledFamilieInput
                        {...skjema.felter.antallUkerSvarfrist.hentNavInputProps(
                            skjema.visFeilmeldinger
                        )}
                        label={'Antall uker svarfrist'}
                        size={'small'}
                    />
                )}
            </Fieldset>
            <Knapperekke>
                <Button
                    id={'forhandsvis-vedtaksbrev'}
                    variant={'tertiary'}
                    size={'medium'}
                    icon={<FileContent />}
                    loading={hentetDokument.status === RessursStatus.HENTER}
                    disabled={skjemaErLåst}
                    onClick={() => {
                        if (kanSendeSkjema()) {
                            hentForhåndsvisning<IManueltBrevRequestPåBehandling>({
                                method: 'POST',
                                data: hentSkjemaData(),
                                url: `/familie-ks-sak/api/brev/forhaandsvis-brev/${behandlingId}`,
                            });
                        }
                    }}
                >
                    {'Forhåndsvis'}
                </Button>
                <Button
                    variant={'secondary'}
                    size={'medium'}
                    loading={skjema.submitRessurs.status === RessursStatus.HENTER}
                    disabled={skjemaErLåst}
                    onClick={() => {
                        if (åpenBehandling.status === RessursStatus.SUKSESS) {
                            const harRegistrertSøknad =
                                hentStegNummer(åpenBehandling.data.steg) >
                                hentStegNummer(BehandlingSteg.REGISTRERE_SØKNAD);
                            settNavigerTilOpplysningsplikt(
                                harRegistrertSøknad &&
                                    skjema.felter.brevmal.verdi === Brevmal.INNHENTE_OPPLYSNINGER
                            );
                            onSubmit<IManueltBrevRequestPåBehandling>(
                                {
                                    method: 'POST',
                                    data: hentSkjemaData(),
                                    url: `/familie-ks-sak/api/brev/send-brev/${åpenBehandling.data.behandlingId}`,
                                },
                                (ressurs: Ressurs<IBehandling>) => {
                                    onSubmitSuccess();
                                    settÅpenBehandling(ressurs);
                                    hentLogg();
                                }
                            );
                        }
                    }}
                >
                    Send brev
                </Button>
            </Knapperekke>
        </div>
    );
};

export default Brevskjema;

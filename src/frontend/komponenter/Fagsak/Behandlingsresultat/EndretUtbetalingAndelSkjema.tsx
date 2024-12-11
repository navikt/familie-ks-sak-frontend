import * as React from 'react';
import { useEffect } from 'react';

import classNames from 'classnames';
import styled from 'styled-components';

import { TrashIcon } from '@navikt/aksel-icons';
import {
    BodyShort,
    Button,
    Checkbox,
    Fieldset,
    Label,
    Radio,
    RadioGroup,
    Select,
    Textarea,
} from '@navikt/ds-react';
import { ABorderAction } from '@navikt/ds-tokens/dist/tokens';
import { useHttp } from '@navikt/familie-http';
import type { Ressurs } from '@navikt/familie-typer';
import { RessursStatus } from '@navikt/familie-typer';

import { EndretUtbetalingAvslagBegrunnelse } from './EndretUtbetalingAvslagBegrunnelse';
import { useBehandling } from '../../../context/behandlingContext/BehandlingContext';
import { useEndretUtbetalingAndel } from '../../../context/EndretUtbetalingAndelContext';
import type { IBehandling } from '../../../typer/behandling';
import {
    type IRestEndretUtbetalingAndel,
    IEndretUtbetalingAndelÅrsak,
} from '../../../typer/utbetalingAndel';
import {
    IEndretUtbetalingAndelFullSats,
    optionTilsats,
    satser,
    satsTilOption,
    årsaker,
    årsakTekst,
} from '../../../typer/utbetalingAndel';
import type { IsoMånedString } from '../../../utils/dato';
import { lagPersonLabel } from '../../../utils/formatter';
import { hentFrontendFeilmelding } from '../../../utils/ressursUtils';
import Datovelger from '../../Felleskomponenter/Datovelger/Datovelger';
import Knapperekke from '../../Felleskomponenter/Knapperekke';
import MånedÅrVelger from '../../Felleskomponenter/MånedÅrInput/MånedÅrVelger';

const KnapperekkeVenstre = styled.div`
    display: flex;
    flex-direction: row;
`;

const StyledFieldset = styled(Fieldset)`
    margin-top: 1rem;
    margin-bottom: 1.5rem;
    padding-left: 2rem;
    margin-right: 2rem;
    border-left: 0.0625rem solid ${ABorderAction};
    max-width: 30rem;
`;

const StyledPersonvelger = styled(Select)`
    max-width: 20rem;
    z-index: 1000;
`;

const StyledSatsvelger = styled(Select)`
    max-width: 10rem;
`;

const Feltmargin = styled.div`
    margin-bottom: 1rem;
`;

const StyledFerdigKnapp = styled(Button)`
    margin-right: 0.5rem;
`;

const StyledTextarea = styled(Textarea)`
    min-height: 8rem;
`;

interface IEndretUtbetalingAndelSkjemaProps {
    åpenBehandling: IBehandling;
    lukkSkjema: () => void;
}

const EndretUtbetalingAndelSkjema: React.FunctionComponent<IEndretUtbetalingAndelSkjemaProps> = ({
    åpenBehandling,
    lukkSkjema,
}) => {
    const { request } = useHttp();
    const { vurderErLesevisning, settÅpenBehandling } = useBehandling();

    const {
        endretUtbetalingAndel,
        skjema,
        kanSendeSkjema,
        onSubmit,
        hentSkjemaData,
        settFelterTilDefault,
    } = useEndretUtbetalingAndel();

    const oppdaterEndretUtbetaling = (avbrytEndringAvUtbetalingsperiode: () => void) => {
        if (kanSendeSkjema()) {
            onSubmit<IRestEndretUtbetalingAndel>(
                {
                    method: 'PUT',
                    url: `/familie-ks-sak/api/endretutbetalingandel/${åpenBehandling.behandlingId}/${endretUtbetalingAndel.id}`,
                    påvirkerSystemLaster: true,
                    data: hentSkjemaData(),
                },
                (behandling: Ressurs<IBehandling>) => {
                    if (behandling.status === RessursStatus.SUKSESS) {
                        avbrytEndringAvUtbetalingsperiode();
                        settÅpenBehandling(behandling);
                    }
                }
            );
        }
    };

    const slettEndretUtbetaling = () => {
        request<undefined, IBehandling>({
            method: 'DELETE',
            url: `/familie-ks-sak/api/endretutbetalingandel/${åpenBehandling.behandlingId}/${endretUtbetalingAndel.id}`,
            påvirkerSystemLaster: true,
        }).then((behandling: Ressurs<IBehandling>) => settÅpenBehandling(behandling));
    };

    const finnÅrTilbakeTilStønadFra = (): number => {
        return (
            new Date().getFullYear() -
            new Date(
                Math.min(
                    ...åpenBehandling.personerMedAndelerTilkjentYtelse.map(person =>
                        new Date(person.stønadFom).getTime()
                    )
                )
            ).getFullYear()
        );
    };

    const finnÅrFremTilStønadTom = (): number => {
        return (
            new Date(
                Math.max(
                    ...åpenBehandling.personerMedAndelerTilkjentYtelse.map(person =>
                        new Date(person.stønadTom).getTime()
                    )
                )
            ).getFullYear() - new Date().getFullYear()
        );
    };

    useEffect(() => {
        if (hentFrontendFeilmelding(skjema.submitRessurs)?.includes('til og med dato')) {
            skjema.felter.tom.nullstill();
        }
    }, [skjema.submitRessurs]);

    useEffect(() => {
        if (
            skjema.felter.årsak.verdi !== IEndretUtbetalingAndelÅrsak.ALLEREDE_UTBETALT &&
            skjema.felter.begrunnelser.verdi &&
            skjema.felter.begrunnelser.verdi.length > 0
        ) {
            skjema.felter.begrunnelser.validerOgSettFelt([]);
        }
    }, [skjema.felter.årsak.verdi]);

    const erLesevisning = vurderErLesevisning();

    return (
        <>
            <StyledFieldset
                error={hentFrontendFeilmelding(skjema.submitRessurs)}
                legend={'Skjema for å endre utbetalingsandel'}
                hideLegend
            >
                <Feltmargin>
                    <StyledPersonvelger
                        {...skjema.felter.person.hentNavBaseSkjemaProps(skjema.visFeilmeldinger)}
                        label={<Label>Velg hvem det gjelder</Label>}
                        value={skjema.felter.person.verdi ?? ''}
                        onChange={(event): void => {
                            skjema.felter.person.validerOgSettFelt(event.target.value);
                        }}
                        readOnly={erLesevisning}
                    >
                        <option value={undefined}>Velg person</option>
                        {åpenBehandling.personer
                            .filter(person =>
                                åpenBehandling.personerMedAndelerTilkjentYtelse
                                    .map(personMedAndeler => personMedAndeler.personIdent)
                                    .includes(person.personIdent)
                            )
                            .map((person, index) => (
                                <option
                                    value={person.personIdent}
                                    key={`${index}_${person.fødselsdato}`}
                                >
                                    {lagPersonLabel(person.personIdent, åpenBehandling.personer)}
                                </option>
                            ))}
                    </StyledPersonvelger>
                </Feltmargin>

                <Feltmargin>
                    <Label>Fastsett periode</Label>
                    <Feltmargin>
                        <MånedÅrVelger
                            {...skjema.felter.fom.hentNavBaseSkjemaProps(skjema.visFeilmeldinger)}
                            label={'F.o.m'}
                            value={skjema.felter.fom.verdi}
                            antallÅrFrem={finnÅrFremTilStønadTom()}
                            antallÅrTilbake={finnÅrTilbakeTilStønadFra()}
                            onEndret={(dato: IsoMånedString | undefined) => {
                                if (dato === undefined) {
                                    skjema.felter.fom.nullstill();
                                } else {
                                    skjema.felter.fom.validerOgSettFelt(dato);
                                }
                            }}
                            lesevisning={erLesevisning}
                        />
                    </Feltmargin>
                    <MånedÅrVelger
                        {...skjema.felter.tom.hentNavBaseSkjemaProps(skjema.visFeilmeldinger)}
                        label={'T.o.m (valgfri)'}
                        value={skjema.felter.tom.verdi}
                        antallÅrFrem={finnÅrFremTilStønadTom()}
                        antallÅrTilbake={finnÅrTilbakeTilStønadFra()}
                        onEndret={(dato: IsoMånedString | undefined) => {
                            if (dato === undefined) {
                                skjema.felter.tom.nullstill();
                            } else {
                                skjema.felter.tom.validerOgSettFelt(dato);
                            }
                        }}
                        lesevisning={erLesevisning}
                    />
                </Feltmargin>

                <Feltmargin>
                    <Select
                        {...skjema.felter.årsak.hentNavBaseSkjemaProps(skjema.visFeilmeldinger)}
                        value={skjema.felter.årsak.verdi}
                        label={<Label>Årsak</Label>}
                        onChange={(event): void => {
                            skjema.felter.årsak.validerOgSettFelt(
                                event.target.value as IEndretUtbetalingAndelÅrsak
                            );
                        }}
                        readOnly={erLesevisning}
                    >
                        <option value={undefined}>Velg årsak</option>
                        {årsaker.map(årsak => (
                            <option value={årsak.valueOf()} key={årsak.valueOf()}>
                                {årsakTekst[årsak]}
                            </option>
                        ))}
                    </Select>
                </Feltmargin>

                <Feltmargin>
                    {erLesevisning ? (
                        <>
                            <Label>Utbetaling</Label>
                            <BodyShort>
                                {skjema.felter.periodeSkalUtbetalesTilSøker.verdi ? 'Ja' : 'Nei'}
                            </BodyShort>
                        </>
                    ) : (
                        <RadioGroup
                            legend={<Label>Utbetaling</Label>}
                            value={skjema.felter.periodeSkalUtbetalesTilSøker.verdi}
                            onChange={(val: boolean | undefined) => {
                                skjema.felter.periodeSkalUtbetalesTilSøker.validerOgSettFelt(val);
                                skjema.felter.erEksplisittAvslagPåSøknad.validerOgSettFelt(false);
                            }}
                        >
                            <Radio
                                name={'utbetaling'}
                                value={true}
                                id={'ja-perioden-utbetales-til-søker'}
                            >
                                {'Perioden skal utbetales'}
                            </Radio>
                            <Radio
                                name={'utbetaling'}
                                value={false}
                                id={'nei-perioden-skal-ikke-utbetales-til-søker'}
                            >
                                {'Perioden skal ikke utbetales'}
                            </Radio>
                        </RadioGroup>
                    )}
                </Feltmargin>
                <Feltmargin>
                    {erLesevisning
                        ? skjema.felter.erEksplisittAvslagPåSøknad.verdi && (
                              <BodyShort
                                  className={classNames('skjemaelement', 'lese-felt')}
                                  children={'Vurderingen er et avslag'}
                              />
                          )
                        : !skjema.felter.periodeSkalUtbetalesTilSøker.verdi && (
                              <Checkbox
                                  value={'Vurderingen er et avslag'}
                                  checked={skjema.felter.erEksplisittAvslagPåSøknad.verdi}
                                  onChange={event =>
                                      skjema.felter.erEksplisittAvslagPåSøknad.validerOgSettFelt(
                                          event.target.checked
                                      )
                                  }
                              >
                                  {'Vurderingen er et avslag'}
                              </Checkbox>
                          )}
                </Feltmargin>

                {skjema.felter.årsak.verdi === IEndretUtbetalingAndelÅrsak.ALLEREDE_UTBETALT &&
                    skjema.felter.erEksplisittAvslagPåSøknad.verdi && (
                        <Feltmargin>
                            <EndretUtbetalingAvslagBegrunnelse />
                        </Feltmargin>
                    )}

                <Feltmargin>
                    <Datovelger
                        felt={skjema.felter.søknadstidspunkt}
                        label={'Søknadstidspunkt'}
                        visFeilmeldinger={skjema.visFeilmeldinger}
                        readOnly={erLesevisning}
                        kanKunVelgeFortid
                    />
                </Feltmargin>

                {skjema.felter.avtaletidspunktDeltBosted.erSynlig && (
                    <Feltmargin>
                        <Datovelger
                            felt={skjema.felter.avtaletidspunktDeltBosted}
                            label={'Avtale om delt bosted'}
                            visFeilmeldinger={skjema.visFeilmeldinger}
                            readOnly={erLesevisning}
                        />
                    </Feltmargin>
                )}
                {skjema.felter.fullSats.erSynlig && (
                    <Feltmargin>
                        <StyledSatsvelger
                            {...skjema.felter.fullSats.hentNavBaseSkjemaProps(
                                skjema.visFeilmeldinger
                            )}
                            label={<Label>Sats</Label>}
                            value={
                                skjema.felter.fullSats.verdi !== undefined &&
                                skjema.felter.fullSats.verdi !== null
                                    ? skjema.felter.fullSats.verdi
                                        ? IEndretUtbetalingAndelFullSats.FULL_SATS.valueOf()
                                        : undefined
                                    : undefined
                            }
                            onChange={(event): void => {
                                skjema.felter.fullSats.validerOgSettFelt(
                                    optionTilsats(event.target.value)
                                );
                            }}
                        >
                            <option value={undefined}>Velg sats</option>
                            {satser.map(sats => (
                                <option value={sats.valueOf()} key={sats.valueOf()}>
                                    {
                                        satsTilOption(
                                            sats === IEndretUtbetalingAndelFullSats.FULL_SATS
                                        ).label
                                    }
                                </option>
                            ))}
                        </StyledSatsvelger>
                    </Feltmargin>
                )}

                <Feltmargin>
                    <StyledTextarea
                        {...skjema.felter.begrunnelse.hentNavInputProps(skjema.visFeilmeldinger)}
                        readOnly={erLesevisning}
                        placeholder={'Begrunn hvorfor utbetalingsperioden er endret.'}
                        label={'Begrunnelse'}
                        value={
                            skjema.felter.begrunnelse.verdi !== null &&
                            skjema.felter.begrunnelse.verdi !== undefined
                                ? skjema.felter.begrunnelse.verdi
                                : ''
                        }
                        onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                            skjema.felter.begrunnelse.validerOgSettFelt(event.target.value);
                        }}
                    />
                </Feltmargin>
                {!erLesevisning && (
                    <Knapperekke>
                        <KnapperekkeVenstre>
                            <StyledFerdigKnapp
                                size={'small'}
                                variant={'secondary'}
                                onClick={() => oppdaterEndretUtbetaling(lukkSkjema)}
                            >
                                Bekreft
                            </StyledFerdigKnapp>
                            <Button
                                variant="tertiary"
                                size="small"
                                onClick={() => {
                                    settFelterTilDefault();
                                    lukkSkjema();
                                }}
                            >
                                Avbryt
                            </Button>
                        </KnapperekkeVenstre>

                        {!erLesevisning && (
                            <Button
                                variant={'tertiary'}
                                id={`sletteknapp-endret-utbetaling-andel-${endretUtbetalingAndel.id}`}
                                size={'small'}
                                onClick={slettEndretUtbetaling}
                                icon={<TrashIcon />}
                            >
                                {'Fjern periode'}
                            </Button>
                        )}
                    </Knapperekke>
                )}
            </StyledFieldset>
        </>
    );
};

export default EndretUtbetalingAndelSkjema;

import type { ReactNode } from 'react';

import styled from 'styled-components';

import { TrashIcon } from '@navikt/aksel-icons';
import { Alert, BodyShort, Button, Fieldset, Select, TextField, UNSAFE_Combobox } from '@navikt/ds-react';
import type { ISkjema } from '@navikt/familie-skjema';
import { Valideringsstatus } from '@navikt/familie-skjema';
import { RessursStatus } from '@navikt/familie-typer';
import type { Currency } from '@navikt/land-verktoy';

import type { IBehandling } from '../../../../../../../typer/behandling';
import type { OptionType } from '../../../../../../../typer/common';
import {
    EøsPeriodeStatus,
    type IUtenlandskPeriodeBeløp,
    UtenlandskPeriodeBeløpIntervall,
    utenlandskPeriodeBeløpIntervaller,
} from '../../../../../../../typer/eøsPerioder';
import { useBehandlingContext } from '../../../../context/BehandlingContext';
import EøsPeriodeSkjema from '../EøsKomponenter/EøsPeriodeSkjema';
import { EøsPeriodeSkjemaContainer, Knapperad } from '../EøsKomponenter/EøsSkjemaKomponenter';
import { StyledFamilieValutavelger } from '../EøsKomponenter/FamilieLandvelger';

const UtbetaltBeløpRad = styled.div`
    width: 32rem;
    display: flex;
    justify-content: space-between;
    gap: 1rem;
`;

const UtbetaltBeløpInfo = styled(Alert)`
    margin-bottom: var(--navds-spacing-6);
`;

const UtbetaltBeløpText = styled(BodyShort)`
    font-weight: bold;
`;

const StyledEøsPeriodeSkjema = styled(EøsPeriodeSkjema)`
    margin-top: 1.5rem;
`;

const StyledFieldset = styled(Fieldset)`
    margin-top: 1.5rem;
`;

const StyledTextField = styled(TextField)`
    width: 9rem;
`;

const utenlandskPeriodeBeløpPeriodeFeilmeldingId = (
    utenlandskPeriodeBeløp: ISkjema<IUtenlandskPeriodeBeløp, IBehandling>
): string =>
    `utd_beløp-periode_${utenlandskPeriodeBeløp.felter.barnIdenter.verdi.map(
        barn => `${barn.value}`
    )}_${utenlandskPeriodeBeløp.felter.initielFom.verdi}`;

const utenlandskPeriodeBeløpUtbetaltFeilmeldingId = (
    utenlandskPeriodeBeløp: ISkjema<IUtenlandskPeriodeBeløp, IBehandling>
): string =>
    `utd_beløp-utbetalt_${utenlandskPeriodeBeløp.felter.barnIdenter.verdi.map(
        barn => `${barn.value}`
    )}_${utenlandskPeriodeBeløp.felter.initielFom.verdi}`;

interface IProps {
    skjema: ISkjema<IUtenlandskPeriodeBeløp, IBehandling>;
    tilgjengeligeBarn: OptionType[];
    status: EøsPeriodeStatus;
    valideringErOk: () => boolean;
    sendInnSkjema: () => void;
    toggleForm: (visAlert: boolean) => void;
    slettUtenlandskPeriodeBeløp: () => void;
    behandlingsÅrsakErOvergangsordning: boolean;
}

const UtenlandskPeriodeBeløpTabellRadEndre = ({
    skjema,
    tilgjengeligeBarn,
    status,
    sendInnSkjema,
    toggleForm,
    slettUtenlandskPeriodeBeløp,
    behandlingsÅrsakErOvergangsordning,
}: IProps) => {
    const { vurderErLesevisning } = useBehandlingContext();
    const lesevisning = vurderErLesevisning(true);

    const visUtbetaltBeløpGruppeFeilmelding = (): ReactNode => {
        if (skjema.felter.beløp?.valideringsstatus === Valideringsstatus.FEIL) {
            return skjema.felter.beløp.feilmelding;
        } else if (skjema.felter.valutakode?.valideringsstatus === Valideringsstatus.FEIL) {
            return skjema.felter.valutakode.feilmelding;
        } else if (skjema.felter.intervall?.valideringsstatus === Valideringsstatus.FEIL) {
            return skjema.felter.intervall.feilmelding;
        }
    };

    const visSubmitFeilmelding = () => {
        if (
            skjema.submitRessurs.status === RessursStatus.FEILET ||
            skjema.submitRessurs.status === RessursStatus.FUNKSJONELL_FEIL ||
            skjema.submitRessurs.status === RessursStatus.IKKE_TILGANG
        ) {
            return skjema.submitRessurs.frontendFeilmelding;
        } else {
            return null;
        }
    };

    return (
        <Fieldset
            error={skjema.visFeilmeldinger && visSubmitFeilmelding()}
            legend={'Endre utenlandsk periodebeløp'}
            hideLegend
        >
            <EøsPeriodeSkjemaContainer $lesevisning={lesevisning} $status={status}>
                <UtbetaltBeløpInfo variant="info" inline>
                    <UtbetaltBeløpText size="small">
                        Dersom det er ulike beløp per barn utbetalt i det andre landet, må barna registreres separat
                    </UtbetaltBeløpText>
                </UtbetaltBeløpInfo>
                <UNSAFE_Combobox
                    error={skjema.felter.barnIdenter.hentNavInputProps(skjema.visFeilmeldinger).error}
                    readOnly={lesevisning}
                    label={'Barn'}
                    isMultiSelect
                    options={tilgjengeligeBarn}
                    selectedOptions={skjema.felter.barnIdenter.verdi}
                    onToggleSelected={(option, isSelected) => {
                        const valgtBarn = tilgjengeligeBarn.find(barn => barn.value === option);
                        if (!valgtBarn) {
                            throw new Error('Klarer ikke legge til barn');
                        } else {
                            if (isSelected) {
                                skjema.felter.barnIdenter.validerOgSettFelt([
                                    ...skjema.felter.barnIdenter.verdi,
                                    tilgjengeligeBarn.find(barn => barn.value === option)!,
                                ]);
                            } else {
                                skjema.felter.barnIdenter.validerOgSettFelt([
                                    ...skjema.felter.barnIdenter.verdi.filter(barn => barn.value !== option),
                                ]);
                            }
                        }
                    }}
                />
                <StyledEøsPeriodeSkjema
                    periode={skjema.felter.periode}
                    periodeFeilmeldingId={utenlandskPeriodeBeløpPeriodeFeilmeldingId(skjema)}
                    initielFom={skjema.felter.initielFom}
                    visFeilmeldinger={skjema.visFeilmeldinger}
                    lesevisning={lesevisning}
                    maxWidth={32}
                    behandlingsÅrsakErOvergangsordning={behandlingsÅrsakErOvergangsordning}
                />
                <StyledFieldset
                    errorId={utenlandskPeriodeBeløpUtbetaltFeilmeldingId(skjema)}
                    error={skjema.visFeilmeldinger && visUtbetaltBeløpGruppeFeilmelding()}
                    legend={'Utbetalt i det andre landet'}
                    size={'medium'}
                >
                    <UtbetaltBeløpRad>
                        <StyledTextField
                            label={'Beløp per barn'}
                            readOnly={lesevisning}
                            value={skjema.felter.beløp?.verdi}
                            onChange={event => skjema.felter.beløp?.validerOgSettFelt(event.target.value)}
                            size={'medium'}
                        />
                        <StyledFamilieValutavelger
                            erLesevisning={lesevisning}
                            id={'valuta'}
                            label={'Valuta'}
                            kunEøs
                            medFlag
                            value={skjema.felter.valutakode?.verdi}
                            onChange={(value: Currency) => {
                                if (value) {
                                    skjema.felter.valutakode?.validerOgSettFelt(value.value);
                                } else {
                                    skjema.felter.valutakode?.nullstill();
                                }
                            }}
                            utenMargin
                            kanNullstilles
                        />
                        <Select
                            label={'Intervall'}
                            readOnly={lesevisning}
                            value={skjema.felter.intervall?.verdi || undefined}
                            onChange={event =>
                                skjema.felter.intervall?.validerOgSettFelt(
                                    event.target.value as UtenlandskPeriodeBeløpIntervall
                                )
                            }
                        >
                            <option key={'-'} value={''}>
                                Velg
                            </option>
                            {Object.values(UtenlandskPeriodeBeløpIntervall).map(intervall => {
                                return (
                                    <option key={intervall} value={intervall}>
                                        {utenlandskPeriodeBeløpIntervaller[intervall]}
                                    </option>
                                );
                            })}
                        </Select>
                    </UtbetaltBeløpRad>
                </StyledFieldset>
                {!lesevisning && (
                    <Knapperad>
                        <div>
                            <Button
                                onClick={() => sendInnSkjema()}
                                size="small"
                                variant={'primary'}
                                loading={skjema.submitRessurs.status === RessursStatus.HENTER}
                            >
                                Ferdig
                            </Button>
                            <Button
                                style={{ marginLeft: '1rem' }}
                                onClick={() => toggleForm(false)}
                                size="small"
                                variant="tertiary"
                            >
                                Avbryt
                            </Button>
                        </div>
                        {skjema.felter.status?.verdi !== EøsPeriodeStatus.IKKE_UTFYLT && (
                            <Button
                                variant={'tertiary'}
                                onClick={() => slettUtenlandskPeriodeBeløp()}
                                id={`slett_utd_beløp_${skjema.felter.barnIdenter.verdi.map(
                                    barn => `${barn}-`
                                )}_${skjema.felter.initielFom.verdi}`}
                                loading={skjema.submitRessurs.status === RessursStatus.HENTER}
                                size={'small'}
                                icon={<TrashIcon />}
                            >
                                {'Fjern'}
                            </Button>
                        )}
                    </Knapperad>
                )}
            </EøsPeriodeSkjemaContainer>
        </Fieldset>
    );
};

export default UtenlandskPeriodeBeløpTabellRadEndre;

import type { ReactNode } from 'react';

import styled from 'styled-components';

import { TrashIcon } from '@navikt/aksel-icons';
import { Alert, Button, Fieldset, Heading, Link, TextField } from '@navikt/ds-react';
import { FamilieReactSelect } from '@navikt/familie-form-elements';
import type { ISkjema } from '@navikt/familie-skjema';
import { Valideringsstatus } from '@navikt/familie-skjema';
import { RessursStatus } from '@navikt/familie-typer';
import type { Currency } from '@navikt/land-verktoy';

import Datovelger from '../../../../../../../komponenter/Datovelger/Datovelger';
import type { IBehandling } from '../../../../../../../typer/behandling';
import type { OptionType } from '../../../../../../../typer/common';
import { EøsPeriodeStatus, type IValutakurs } from '../../../../../../../typer/eøsPerioder';
import { useBehandlingContext } from '../../../../context/BehandlingContext';
import EøsPeriodeSkjema from '../EøsKomponenter/EøsPeriodeSkjema';
import { EøsPeriodeSkjemaContainer, Knapperad } from '../EøsKomponenter/EøsSkjemaKomponenter';
import { StyledFamilieValutavelger } from '../EøsKomponenter/FamilieLandvelger';

const ValutakursRad = styled.div`
    width: 32rem;
    display: flex;
    gap: 1rem;
`;

const StyledTextField = styled(TextField)`
    width: 8rem;
`;

const StyledEøsPeriodeSkjema = styled(EøsPeriodeSkjema)`
    margin-top: 1.5rem;
`;

const StyledFieldset = styled(Fieldset)`
    margin-top: 1.5rem;
`;

const StyledISKAlert = styled(Alert)`
    margin-top: 2rem;
`;

const valutakursPeriodeFeilmeldingId = (valutakurs: ISkjema<IValutakurs, IBehandling>): string =>
    `valutakurs-periode_${valutakurs.felter.barnIdenter.verdi.map(barn => `${barn.value}`)}_${
        valutakurs.felter.initielFom.verdi
    }`;

const valutakursValutaFeilmeldingId = (valutakurs: ISkjema<IValutakurs, IBehandling>): string =>
    `valutakurs-valuta_${valutakurs.felter.barnIdenter.verdi.map(barn => `${barn.value}`)}_${
        valutakurs.felter.initielFom.verdi
    }`;

interface IProps {
    skjema: ISkjema<IValutakurs, IBehandling>;
    tilgjengeligeBarn: OptionType[];
    status: EøsPeriodeStatus;
    valideringErOk: () => boolean;
    sendInnSkjema: () => void;
    toggleForm: (visAlert: boolean) => void;
    slettValutakurs: () => void;
    sletterValutakurs: boolean;
    erManuellInputAvKurs: boolean;
    behandlingsÅrsakErOvergangsordning: boolean;
}

const ValutakursTabellRadEndre = ({
    skjema,
    tilgjengeligeBarn,
    status,
    sendInnSkjema,
    toggleForm,
    slettValutakurs,
    sletterValutakurs,
    erManuellInputAvKurs,
    behandlingsÅrsakErOvergangsordning,
}: IProps) => {
    const { vurderErLesevisning } = useBehandlingContext();
    const lesevisning = vurderErLesevisning(true);

    const visKursGruppeFeilmelding = (): ReactNode => {
        if (skjema.felter.valutakode?.valideringsstatus === Valideringsstatus.FEIL) {
            return skjema.felter.valutakode.feilmelding;
        } else if (skjema.felter.valutakursdato?.valideringsstatus === Valideringsstatus.FEIL) {
            return skjema.felter.valutakursdato.feilmelding;
        } else if (skjema.felter.kurs?.valideringsstatus === Valideringsstatus.FEIL) {
            return skjema.felter.kurs.feilmelding;
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
        <Fieldset error={skjema.visFeilmeldinger && visSubmitFeilmelding()} legend={'Endre valutakurs'} hideLegend>
            <EøsPeriodeSkjemaContainer $lesevisning={lesevisning} $status={status}>
                <FamilieReactSelect
                    {...skjema.felter.barnIdenter.hentNavInputProps(skjema.visFeilmeldinger)}
                    erLesevisning={lesevisning}
                    label={'Barn'}
                    isMulti
                    options={tilgjengeligeBarn}
                    value={skjema.felter.barnIdenter.verdi}
                    onChange={options => skjema.felter.barnIdenter.validerOgSettFelt(options as OptionType[])}
                />
                <StyledEøsPeriodeSkjema
                    periode={skjema.felter.periode}
                    periodeFeilmeldingId={valutakursPeriodeFeilmeldingId(skjema)}
                    initielFom={skjema.felter.initielFom}
                    visFeilmeldinger={skjema.visFeilmeldinger}
                    lesevisning={lesevisning}
                    maxWidth={32}
                    behandlingsÅrsakErOvergangsordning={behandlingsÅrsakErOvergangsordning}
                />
                <StyledFieldset
                    errorId={valutakursValutaFeilmeldingId(skjema)}
                    error={skjema.visFeilmeldinger && visKursGruppeFeilmelding()}
                    legend={'Registrer valutakursdato'}
                >
                    <ValutakursRad>
                        <Datovelger
                            felt={skjema.felter.valutakursdato}
                            label={'Valutakursdato'}
                            visFeilmeldinger={false}
                            readOnly={lesevisning}
                            disableWeekends
                            kanKunVelgeFortid
                        />
                        <StyledFamilieValutavelger
                            erLesevisning={true}
                            id={'valuta'}
                            label={'Valuta'}
                            kunEøs
                            medFlag
                            size="small"
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
                        <StyledTextField
                            label={'Valutakurs'}
                            readOnly={lesevisning || !erManuellInputAvKurs}
                            value={skjema.felter.kurs?.verdi}
                            onChange={event => skjema.felter.kurs?.validerOgSettFelt(event.target.value)}
                        />
                    </ValutakursRad>
                    {erManuellInputAvKurs && (
                        <StyledISKAlert variant="warning" size="small" inline>
                            <Heading size="small">Manuell innhenting av valutakurs for Islandske kroner (ISK)</Heading>
                            Systemet har ikke valutakurser for valutakursdatoer før 1. februar 2018. Disse må hentes fra{' '}
                            <Link
                                href="https://navno.sharepoint.com/:x:/r/sites/fag-og-ytelser-familie-barnetrygd/Delte%20dokumenter/E%C3%98S/Valutakalkulator%202022.xlsm?d=w200955f53e1d4323ae72f9d1b15f617c&csf=1&web=1&e=w3OE5N"
                                target="_blank"
                            >
                                Valutakalkulator
                            </Link>
                            .
                        </StyledISKAlert>
                    )}
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
                                onClick={() => slettValutakurs()}
                                id={`slett_valutakurs_${skjema.felter.barnIdenter.verdi.map(
                                    barn => `${barn}-`
                                )}_${skjema.felter.initielFom.verdi}`}
                                loading={sletterValutakurs}
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

export default ValutakursTabellRadEndre;

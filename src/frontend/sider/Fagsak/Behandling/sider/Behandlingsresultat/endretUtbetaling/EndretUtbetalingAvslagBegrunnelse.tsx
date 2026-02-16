import { Alert, Select } from '@navikt/ds-react';
import type { GroupBase } from '@navikt/familie-form-elements';
import type { ISkjema } from '@navikt/familie-skjema';
import { RessursStatus } from '@navikt/familie-typer';

import { type IEndretUtbetalingAndelSkjema } from './useEndretUtbetalingAndel';
import type { IBehandling } from '../../../../../../typer/behandling';
import type { OptionType } from '../../../../../../typer/common';
import { IEndretUtbetalingAndelÅrsak } from '../../../../../../typer/utbetalingAndel';
import { type Begrunnelse, BegrunnelseType, begrunnelseTyper } from '../../../../../../typer/vedtak';
import { useBehandlingContext } from '../../../context/BehandlingContext';
import { useHentEndretUtbetalingBegrunnelser } from '../useHentEndretUtbetalingBegrunnelser';

interface IProps {
    skjema: ISkjema<IEndretUtbetalingAndelSkjema, IBehandling>;
}

export const EndretUtbetalingAvslagBegrunnelse = ({ skjema }: IProps) => {
    const { vurderErLesevisning } = useBehandlingContext();
    const { endretUtbetalingsbegrunnelser } = useHentEndretUtbetalingBegrunnelser();

    const prevalgtBegrunnelse =
        skjema.felter.vedtaksbegrunnelser.verdi && skjema.felter.vedtaksbegrunnelser.verdi.length > 0
            ? skjema.felter.vedtaksbegrunnelser.verdi[0]
            : undefined;

    const gyldigeBegrunnelseTyper = [BegrunnelseType.AVSLAG];
    const lastedeTekster =
        endretUtbetalingsbegrunnelser.status === RessursStatus.SUKSESS && endretUtbetalingsbegrunnelser.data;

    const grupperteBegrunnelser: GroupBase<OptionType>[] = gyldigeBegrunnelseTyper.map(type => {
        const begrunnelser = lastedeTekster
            ? lastedeTekster[type]
                  .filter(begrunnelse =>
                      begrunnelse.endringsårsaker.includes(IEndretUtbetalingAndelÅrsak.ALLEREDE_UTBETALT)
                  )
                  .map(begrunnelse => ({
                      label: begrunnelse.navn,
                      value: begrunnelse.id,
                  }))
            : [];
        return {
            label: begrunnelseTyper[type],
            options: begrunnelser,
        };
    });

    if (endretUtbetalingsbegrunnelser.status === RessursStatus.FEILET) {
        return <Alert variant="error">Klarte ikke å hente inn begrunnelser for endret utbetaling.</Alert>;
    }

    function finnBegrunnelseForSelect(begrunnelseVerdi?: Begrunnelse) {
        if (!lastedeTekster) {
            return {
                value: '',
                label: '',
            };
        }

        for (const key in lastedeTekster) {
            const valgtBegrunnelse = lastedeTekster[key as BegrunnelseType].find(begrunnelse => {
                return begrunnelse.id === begrunnelseVerdi;
            });

            if (valgtBegrunnelse) {
                return {
                    label: valgtBegrunnelse.navn,
                    value: valgtBegrunnelse.id,
                };
            }
        }
        return {
            value: '',
            label: '',
        };
    }

    return (
        <Select
            {...skjema.felter.vedtaksbegrunnelser.hentNavInputProps(skjema.visFeilmeldinger)}
            value={finnBegrunnelseForSelect(prevalgtBegrunnelse).value}
            label={'Velg standardtekst i brev'}
            readOnly={vurderErLesevisning()}
            onChange={event => {
                if (event) {
                    /* 
                        Vi ønsker kun en begrunnelse her, men modellen tilsier at det skal være en array.
                        Hardkoder dermed den ene valgte verdien som en array med en begrunnelse.
                    */
                    skjema.felter.vedtaksbegrunnelser.validerOgSettFelt([event.target.value]);
                } else {
                    skjema.felter.vedtaksbegrunnelser.validerOgSettFelt([]);
                }
            }}
        >
            <option disabled value={''}>
                Velg begrunnelse
            </option>
            {grupperteBegrunnelser.map(optgroup => (
                <optgroup label={optgroup.label}>
                    {optgroup.options.map(option => (
                        <option value={option.value}>{option.label}</option>
                    ))}
                </optgroup>
            ))}
        </Select>
    );
};

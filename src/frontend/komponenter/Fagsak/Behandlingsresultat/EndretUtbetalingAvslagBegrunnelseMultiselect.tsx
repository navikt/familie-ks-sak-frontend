import React from 'react';

import { Alert, BodyShort } from '@navikt/ds-react';
import type { ActionMeta, FormatOptionLabelMeta } from '@navikt/familie-form-elements';
import { FamilieReactSelect } from '@navikt/familie-form-elements';
import type { Felt } from '@navikt/familie-skjema';
import { RessursStatus } from '@navikt/familie-typer';

import { useHentEndretUtbetalingBegrunnelser } from './useHentEndretUtbetalingBegrunnelser';
import { useBehandling } from '../../../context/behandlingContext/BehandlingContext';
import type { OptionType } from '../../../typer/common';
import { IEndretUtbetalingAndelÅrsak } from '../../../typer/utbetalingAndel';
import { BegrunnelseType, begrunnelseTyper, type Begrunnelse } from '../../../typer/vedtak';

interface IProps {
    begrunnelse: Felt<Begrunnelse | undefined>;
}

export const EndretUtbetalingAvslagBegrunnelseMultiselect: React.FC<IProps> = ({ begrunnelse }) => {
    const { vurderErLesevisning } = useBehandling();
    const { endretUtbetalingsbegrunnelser } = useHentEndretUtbetalingBegrunnelser();

    const grupperteAvslagsbegrunnelser =
        endretUtbetalingsbegrunnelser.status != RessursStatus.SUKSESS
            ? []
            : endretUtbetalingsbegrunnelser.data.AVSLAG.filter(begrunnelse =>
                  begrunnelse.endringsårsaker.includes(
                      IEndretUtbetalingAndelÅrsak.ALLEREDE_UTBETALT
                  )
              ).map(begrunnelse => ({
                  label: begrunnelse.navn,
                  value: begrunnelse.id,
              }));

    const valgtBegrunnelse = undefined;

    const onChangeBegrunnelse = (action: ActionMeta<OptionType>) => {
        switch (action.action) {
            case 'select-option':
                if (action.option) {
                    begrunnelse.validerOgSettFelt(action.option.value as Begrunnelse);
                } else {
                    throw new Error('Klarer ikke legge til begrunnelse');
                }
                break;
            case 'pop-value':
            case 'remove-value':
                begrunnelse.validerOgSettFelt(undefined);
                break;
            case 'clear':
                begrunnelse.validerOgSettFelt(undefined);
                break;
            default:
                throw new Error('Ukjent action ved onChange på endret utbetalingsbegrunnelse');
        }
    };

    if (endretUtbetalingsbegrunnelser.status === RessursStatus.FEILET) {
        return (
            <Alert variant="error">
                Klarte ikke å hente inn begrunnelser for endret utbetaling.
            </Alert>
        );
    }

    return (
        <FamilieReactSelect
            value={valgtBegrunnelse}
            label={'Velg standardtekst i brev'}
            creatable={false}
            placeholder={'Velg begrunnelse'}
            erLesevisning={vurderErLesevisning()}
            isMulti={false}
            onChange={(_, action: ActionMeta<OptionType>) => {
                onChangeBegrunnelse(action);
            }}
            options={grupperteAvslagsbegrunnelser}
            formatOptionLabel={(
                option: OptionType,
                formatOptionLabelMeta: FormatOptionLabelMeta<OptionType>
            ) => {
                if (formatOptionLabelMeta.context == 'value') {
                    // Formatering når alternativet er valgt
                    const begrunnelseType = BegrunnelseType.AVSLAG;
                    const begrunnelseTypeLabel =
                        begrunnelseTyper[begrunnelseType as BegrunnelseType];
                    return (
                        <BodyShort>
                            <b>{begrunnelseTypeLabel}</b>: {option.label}
                        </BodyShort>
                    );
                } else {
                    // Formatering når alternativet er i nedtrekkslisten
                    return <BodyShort>{option.label}</BodyShort>;
                }
            }}
            propSelectStyles={{
                container: provided => ({
                    ...provided,
                    maxWidth: '25rem',
                }),
                groupHeading: provided => ({
                    ...provided,
                    textTransform: 'none',
                }),
            }}
        />
    );
};

import { useBehandlingId } from '@hooks/useBehandlingId';
import { useErLesevisning } from '@hooks/useErLesevisning';
import { HentGenererteBrevbegrunnelserQueryKeyFactory } from '@hooks/useHentGenererteBrevbegrunnelser';
import { HentVedtaksperioderQueryKeyFactory } from '@hooks/useHentVedtaksperioder';
import { useOppdaterVedtaksperiodeMedBegrunnelser } from '@hooks/useOppdaterVedtaksperiodeMedBegrunnelser';
import { useOppdaterVedtaksperiodeMedFriteksterIsPending } from '@hooks/useOppdaterVedtaksperiodeMedFriteksterIsPending';
import { useQueryClient } from '@tanstack/react-query';
import type { OptionType } from '@typer/common';
import { type Begrunnelse, type BegrunnelseType, begrunnelseTyper, Standardbegrunnelse } from '@typer/vedtak';
import { finnBegrunnelseType, hentBakgrunnsfarge, hentBorderfarge } from '@utils/vedtakUtils';

import { BodyShort, Box, Label } from '@navikt/ds-react';
import type { ActionMeta, FormatOptionLabelMeta, GroupBase, StylesConfig } from '@navikt/familie-form-elements';
import { FamilieReactSelect } from '@navikt/familie-form-elements';

import { useAlleBegrunnelserContext } from './AlleBegrunnelserContext';
import Styles from './BegrunnelserMultiselect.module.css';
import { grupperBegrunnelser, mapBegrunnelserTilSelectOptions } from './utils';
import { useVedtaksperiodeContext } from './VedtaksperiodeContext';

export function BegrunnelserMultiselect() {
    const { vedtaksperiodeMedBegrunnelser } = useVedtaksperiodeContext();
    const { alleBegrunnelser } = useAlleBegrunnelserContext();

    const queryClient = useQueryClient();
    const behandlingId = useBehandlingId();
    const erLesevisning = useErLesevisning();
    const oppdaterVedtaksperiodeMedFriteksterIsPending = useOppdaterVedtaksperiodeMedFriteksterIsPending(
        vedtaksperiodeMedBegrunnelser.id
    );

    const {
        mutate: oppdaterVedtaksperiodeMedBegrunnelser,
        isPending: oppdaterVedtaksperiodeMedBegrunnelserIsPending,
        error: oppdaterVedtaksperiodeMedBegrunnelserError,
    } = useOppdaterVedtaksperiodeMedBegrunnelser(vedtaksperiodeMedBegrunnelser.id, {
        onSuccess: async vedtaksperioderMedBegrunnelser => {
            await queryClient.invalidateQueries({
                queryKey: HentGenererteBrevbegrunnelserQueryKeyFactory.vedtaksperiode(vedtaksperiodeMedBegrunnelser.id),
            });
            queryClient.setQueryData(
                HentVedtaksperioderQueryKeyFactory.behandling(behandlingId),
                vedtaksperioderMedBegrunnelser
            );
        },
    });

    const valgteBegrunnelser = [
        ...vedtaksperiodeMedBegrunnelser.begrunnelser,
        ...vedtaksperiodeMedBegrunnelser.eøsBegrunnelser,
    ];

    const vedtaksperiodeInneholderFramtidigOpphørBegrunnelse = vedtaksperiodeMedBegrunnelser.begrunnelser.some(
        vedtaksBegrunnelser =>
            (vedtaksBegrunnelser.begrunnelse as Standardbegrunnelse) ===
            Standardbegrunnelse.OPPHØR_FRAMTIDIG_OPPHØR_BARNEHAGEPLASS
    );

    const erRedigeringDeaktivert = vedtaksperiodeInneholderFramtidigOpphørBegrunnelse || erLesevisning;

    function onChangeBegrunnelse(action: ActionMeta<OptionType>) {
        switch (action.action) {
            case 'select-option':
                if (action.option) {
                    oppdaterVedtaksperiodeMedBegrunnelser({
                        begrunnelser: [
                            ...valgteBegrunnelser.map(vedtaksBegrunnelse => vedtaksBegrunnelse.begrunnelse),
                            action.option?.value as Begrunnelse,
                        ],
                    });
                }
                break;
            case 'pop-value':
            case 'remove-value':
                if (action.removedValue) {
                    oppdaterVedtaksperiodeMedBegrunnelser({
                        begrunnelser: [
                            ...valgteBegrunnelser.filter(
                                persistertBegrunnelse =>
                                    persistertBegrunnelse.begrunnelse !== (action.removedValue?.value as Begrunnelse)
                            ),
                        ].map(vedtaksBegrunnelse => vedtaksBegrunnelse.begrunnelse),
                    });
                }
                break;
            case 'clear':
                oppdaterVedtaksperiodeMedBegrunnelser({ begrunnelser: [] });
                break;
            default:
                throw new Error('Ukjent action ved onChange på vedtakbegrunnelser');
        }
    }

    const propSelectStyles: StylesConfig<OptionType, boolean, GroupBase<OptionType>> = {
        container: (provided, props) =>
            Object.assign({}, provided, {
                maxWidth: '50rem',
                zIndex: props.isFocused ? 1000 : 1,
            }),
        groupHeading: provided =>
            Object.assign({}, provided, {
                textTransform: 'none',
            }),
        menuPortal: provided =>
            Object.assign({}, provided, {
                zIndex: 9999,
            }),
        multiValue: (provided, props) => {
            const currentOption = props.data;
            const vedtakBegrunnelseType: BegrunnelseType | undefined = finnBegrunnelseType(
                alleBegrunnelser,
                currentOption.value as Begrunnelse
            );

            return Object.assign({}, provided, {
                backgroundColor: hentBakgrunnsfarge(vedtakBegrunnelseType),
                border: `1px solid ${hentBorderfarge(vedtakBegrunnelseType)}`,
                borderRadius: '0.5rem',
            });
        },
        multiValueLabel: provided =>
            Object.assign({}, provided, {
                whiteSpace: 'pre-wrap',
                textOverflow: 'hidden',
            }),
    };

    return (
        <FamilieReactSelect
            id={`${vedtaksperiodeMedBegrunnelser.id}`}
            label={'Velg standardtekst i brev'}
            placeholder={'Velg begrunnelse(r)'}
            value={mapBegrunnelserTilSelectOptions(vedtaksperiodeMedBegrunnelser, alleBegrunnelser)}
            propSelectStyles={propSelectStyles}
            menuPortalTarget={document.body}
            isLoading={oppdaterVedtaksperiodeMedBegrunnelserIsPending || oppdaterVedtaksperiodeMedFriteksterIsPending}
            isDisabled={
                erRedigeringDeaktivert ||
                oppdaterVedtaksperiodeMedBegrunnelserIsPending ||
                oppdaterVedtaksperiodeMedFriteksterIsPending
            }
            feil={oppdaterVedtaksperiodeMedBegrunnelserError?.message}
            creatable={false}
            erLesevisning={erRedigeringDeaktivert}
            isMulti={true}
            menuPosition={'fixed'}
            onChange={(_, action: ActionMeta<OptionType>) => onChangeBegrunnelse(action)}
            formatOptionLabel={(option: OptionType, formatOptionLabelMeta: FormatOptionLabelMeta<OptionType>) => {
                const begrunnelseType = finnBegrunnelseType(alleBegrunnelser, option.value as Begrunnelse);
                if (formatOptionLabelMeta.context === 'value') {
                    const type = begrunnelseTyper[begrunnelseType as BegrunnelseType];
                    return (
                        <BodyShort>
                            <b>{type}</b>: {option.label}
                        </BodyShort>
                    );
                } else {
                    return <BodyShort>{option.label}</BodyShort>;
                }
            }}
            formatGroupLabel={(group: GroupBase<OptionType>) => {
                return (
                    <Box>
                        <Label className={Styles.label}>{group.label}</Label>
                        <hr />
                    </Box>
                );
            }}
            options={grupperBegrunnelser(vedtaksperiodeMedBegrunnelser, alleBegrunnelser)}
        />
    );
}

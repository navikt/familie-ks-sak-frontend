import { useHttp } from '@navikt/familie-http';
import type { Ressurs } from '@navikt/familie-typer';
import { byggHenterRessurs, RessursStatus } from '@navikt/familie-typer';

import type { BrevmottakerUseSkjema, IRestBrevmottaker } from './useBrevmottakerSkjema';
import { useAppContext } from '../../../../../context/AppContext';
import { AlertType, ToastTyper } from '../../../../../komponenter/Toast/typer';
import type { IBehandling } from '../../../../../typer/behandling';
import { useBehandlingContext } from '../../../Behandling/context/BehandlingContext';

interface Props {
    behandlingId: number;
}

export const useLagreEllerFjernMottakerPåBehandling = ({ behandlingId }: Props) => {
    const { settÅpenBehandling } = useBehandlingContext();
    const { settToast } = useAppContext();
    const { request } = useHttp();

    const lagreMottaker = (verdierFraBrevmottakerUseSkjema: BrevmottakerUseSkjema) => {
        const felter = verdierFraBrevmottakerUseSkjema.skjema.felter;

        if (verdierFraBrevmottakerUseSkjema.kanSendeSkjema()) {
            verdierFraBrevmottakerUseSkjema.settSubmitRessurs(byggHenterRessurs());
            verdierFraBrevmottakerUseSkjema.settVisfeilmeldinger(false);
            verdierFraBrevmottakerUseSkjema.onSubmit(
                {
                    method: 'POST',
                    data: {
                        type: felter.mottaker.verdi,
                        navn: felter.navn.verdi,
                        adresselinje1: felter.adresselinje1.verdi,
                        adresselinje2:
                            felter.adresselinje2.verdi !== ''
                                ? felter.adresselinje2.verdi
                                : undefined,
                        postnummer: felter.postnummer.verdi,
                        poststed: felter.poststed.verdi,
                        landkode: felter.land.verdi,
                    },
                    url: `/familie-ks-sak/api/brevmottaker/${behandlingId}`,
                },
                (response: Ressurs<IBehandling>) => {
                    if (response.status === RessursStatus.SUKSESS) {
                        verdierFraBrevmottakerUseSkjema.nullstillSkjema();
                        settToast(ToastTyper.BREVMOTTAKER_LAGRET, {
                            alertType: AlertType.SUCCESS,
                            tekst: 'Mottaker ble lagret',
                        });
                        settÅpenBehandling(response);
                    }
                }
            );
        } else {
            verdierFraBrevmottakerUseSkjema.settVisfeilmeldinger(true);
        }
    };

    const fjernMottaker = (mottaker: IRestBrevmottaker) => {
        return request<void, IBehandling>({
            method: 'DELETE',
            url: `/familie-ks-sak/api/brevmottaker/${behandlingId}/${mottaker.id}`,
            påvirkerSystemLaster: false,
        }).then((response: Ressurs<IBehandling>) => {
            if (response.status === RessursStatus.SUKSESS) {
                settToast(ToastTyper.BREVMOTTAKER_FJERNET, {
                    alertType: AlertType.SUCCESS,
                    tekst: 'Mottaker fjernet',
                });
                settÅpenBehandling(response);
            }
        });
    };

    return { lagreMottaker, fjernMottaker };
};

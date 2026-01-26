import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router';
import styled from 'styled-components';

import { useAppContext } from './context/AppContext';
import { HeaderMedSøk } from './komponenter/HeaderMedSøk/HeaderMedSøk';
import AppInfoModal from './komponenter/Modal/AppInfoModal';
import OpprettFagsakModal from './komponenter/Modal/Fagsak/OpprettFagsakModal';
import { FeilmeldingModal } from './komponenter/Modal/FeilmeldingModal';
import UgyldigSesjon from './komponenter/Modal/SesjonUtløpt';
import { ForhåndsvisOpprettingAvPdfModal } from './komponenter/PdfVisningModal/ForhåndsvisOpprettingAvPdfModal';
import SystemetLaster from './komponenter/SystemetLaster/SystemetLaster';
import Toasts from './komponenter/Toast/Toasts';
import Barnehagelister from './sider/Barnehagelister/Barnehagelister';
import { FagsakContainer } from './sider/Fagsak/FagsakContainer';
import ManuellJournalføring from './sider/ManuellJournalføring/ManuellJournalføring';
import { Oppgavebenk } from './sider/Oppgavebenk/Oppgavebenk';

const Main = styled.main<{ $systemetLaster: boolean }>`
    position: fixed;
    width: 100%;
    height: 100%;
    ${props => {
        if (props.$systemetLaster)
            return `
                filter: blur(12px);
                -webkit-filter: blur(12px);
        `;
    }};
`;

const Container = () => {
    const { autentisert, systemetLaster, innloggetSaksbehandler, appInfoModal } = useAppContext();

    return (
        <Router>
            {appInfoModal.visModal && <AppInfoModal modal={appInfoModal} />}
            {autentisert ? (
                <>
                    {systemetLaster() && <SystemetLaster />}
                    <Toasts />
                    <Main $systemetLaster={systemetLaster()}>
                        <OpprettFagsakModal />
                        <FeilmeldingModal />
                        <ForhåndsvisOpprettingAvPdfModal />
                        <HeaderMedSøk
                            brukerNavn={innloggetSaksbehandler?.displayName}
                            brukerEnhet={innloggetSaksbehandler?.enhet}
                        />
                        <Routes>
                            <Route path="/fagsak/:fagsakId/*" element={<FagsakContainer />} />
                            <Route path="/oppgaver/journalfor/:oppgaveId" element={<ManuellJournalføring />} />
                            <Route path="/barnehagelister" element={<Barnehagelister />} />
                            <Route path="/oppgaver" element={<Oppgavebenk />} />
                            <Route path="/" element={<Navigate to="/oppgaver" />} />
                        </Routes>
                    </Main>
                </>
            ) : (
                <UgyldigSesjon />
            )}
        </Router>
    );
};

export default Container;

import { useAuthContext } from '@context/AuthContext';
import { useVisSystemetLaster } from '@hooks/useVisSystemetLaster';
import { HeaderMedSøk } from '@komponenter/HeaderMedSøk/HeaderMedSøk';
import { FeilmeldingModal } from '@komponenter/Modal/FeilmeldingModal';
import { UgyldigSesjon } from '@komponenter/Modal/SesjonUtløpt';
import { ForhåndsvisOpprettingAvPdfModal } from '@komponenter/PdfVisningModal/ForhåndsvisOpprettingAvPdfModal';
import { FagsakContainer } from '@sider/Fagsak/FagsakContainer';
import { Oppgavebenk } from '@sider/Oppgavebenk/Oppgavebenk';
import classNames from 'classnames';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router';

import Styles from './Container.module.css';
import OpprettFagsakModal from './komponenter/Modal/Fagsak/OpprettFagsakModal';
import SystemetLaster from './komponenter/SystemetLaster/SystemetLaster';
import Toasts from './komponenter/Toast/Toasts';
import Barnehagelister from './sider/Barnehagelister/Barnehagelister';
import ManuellJournalføring from './sider/ManuellJournalføring/ManuellJournalføring';

export function Container() {
    const { autentisert } = useAuthContext();
    const visSystemetLaster = useVisSystemetLaster();

    if (!autentisert) {
        return <UgyldigSesjon />;
    }

    return (
        <Router>
            {visSystemetLaster && <SystemetLaster />}
            <Toasts />
            <main className={classNames(Styles.main, { [Styles.systemLaster]: visSystemetLaster })}>
                <OpprettFagsakModal />
                <FeilmeldingModal />
                <ForhåndsvisOpprettingAvPdfModal />
                <HeaderMedSøk />
                <Routes>
                    <Route path="/fagsak/:fagsakId/*" element={<FagsakContainer />} />
                    <Route path="/oppgaver/journalfor/:oppgaveId" element={<ManuellJournalføring />} />
                    <Route path="/barnehagelister" element={<Barnehagelister />} />
                    <Route path="/oppgaver" element={<Oppgavebenk />} />
                    <Route path="/" element={<Navigate to="/oppgaver" />} />
                </Routes>
            </main>
        </Router>
    );
}

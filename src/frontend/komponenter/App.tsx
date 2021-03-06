import { captureException, configureScope, showReportDialog, withScope } from '@sentry/browser';
import Modal from 'nav-frontend-modal';
import * as React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { slackNotify } from '../api/axios';
import { hentInnloggetBruker } from '../api/saksbehandler';
import { ISaksbehandler } from '../typer/saksbehandler';
import { slackKanaler } from '../typer/slack';
import Fagsak from './Fagsak/Fagsak';
import { FagsakProvider } from './FagsakProvider';
import Dekoratør from './Felleskomponenter/Dekoratør/Dekoratør';
import Søk from './Søk/Søk';

Modal.setAppElement(document.getElementById('modal-a11y-wrapper'));

interface IState {
    innloggetSaksbehandler?: ISaksbehandler;
}

class App extends React.Component<{}, IState> {
    public constructor(props: any) {
        super(props);

        this.state = {};
    }

    public componentDidMount() {
        hentInnloggetBruker().then(innhentetInnloggetSaksbehandler => {
            this.setState({ innloggetSaksbehandler: innhentetInnloggetSaksbehandler });
        });
    }

    public componentDidCatch(error: any, info: any) {
        if (process.env.NODE_ENV !== 'development') {
            configureScope(scope => {
                scope.setUser({
                    username: this.state.innloggetSaksbehandler
                        ? this.state.innloggetSaksbehandler.displayName
                        : 'Ukjent bruker',
                });
            });

            withScope(scope => {
                Object.keys(info).forEach(key => {
                    scope.setExtra(key, info[key]);
                    captureException(error);
                });
            });

            slackNotify(
                `En feil har oppstått i vedtaksløsningen: \n*Error*: ${error}`,
                slackKanaler.alert
            );
            showReportDialog();
        }
    }

    public render() {
        return (
            <FagsakProvider>
                <Dekoratør
                    innloggetSaksbehandler={this.state.innloggetSaksbehandler}
                    tittel={'NAV Kontantstøtte'}
                    onClick={() => {
                        window.location.href = `${window.origin}/auth/logout`;
                    }}
                />
                <div className={'container'}>
                    <Router>
                        <Switch>
                            <Route
                                exact={true}
                                path="/fagsak/:fagsakId"
                                render={({ match }) => {
                                    return <Fagsak fagsakId={match.params.fagsakId} />;
                                }}
                            />
                            <Route exact={true} path="/søk" component={Søk} />
                        </Switch>
                    </Router>
                </div>
            </FagsakProvider>
        );
    }
}

export default App;

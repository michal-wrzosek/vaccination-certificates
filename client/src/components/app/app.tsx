import React from "react";
import { Route, Router, Switch } from "react-router-dom";

import { AccountProvider } from "../../web3";
import { AuthWall } from "../auth-wall";
import { IssueCertificate } from "../issue-certificate/issue-certificate";
import { UserInfo } from "../user-info";
import { VerifyCertificate } from "../verify-certificate";
import { Layout } from "../layout";
import { GlobalStyles } from "../../styles/global-styles";
import { createBrowserHistory } from "history";

const history = createBrowserHistory();

export const App: React.VFC = () => (
  <Router history={history}>
    <AccountProvider>
      <GlobalStyles />
      <AuthWall>
        <Layout>
          <Switch>
            <Route path="/issue-certificate">
              <IssueCertificate />
            </Route>
            <Route path="/verify-certificate">
              <VerifyCertificate />
            </Route>
          </Switch>
          <UserInfo />
        </Layout>
      </AuthWall>
    </AccountProvider>
  </Router>
);

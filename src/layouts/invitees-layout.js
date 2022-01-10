/**
 * Copyright 2020
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

import React from 'react';
import { connect } from 'react-redux';
import { getInvitationByHash } from "../actions/invitation-actions";
import { Redirect, Route, Switch } from "react-router-dom";
import StepOnePage from "../pages/step-one-page";
import StepTwoPage from "../pages/step-two-page";
import StepThreePage from "../pages/step-three-page";
import StepFourPage from "../pages/step-four-page";
import StepExtraQuestionsPage from '../pages/step-extra-questions-page';

class InviteesLayout extends React.Component {

    componentDidMount() {

        let { getInvitationByHash } = this.props;

        let invitationHash = this.props.match.params.invitation_hash;
        if (invitationHash) {
            getInvitationByHash(invitationHash);
        }
    }

    render() {
        let { match, invitation, invalidInvitation, summit } = this.props;
        if (invalidInvitation) {
            return (
                <div className="primary-layout">
                    <main id="page-wrap" style={{ marginTop: 20, fontSize: 16 }}>
                        <span>
                            {invalidInvitation}
                        </span>
                    </main>
                </div>
            )
        }
        if (invitation != null && !invitation.is_accepted && Object.entries(summit).length > 0) {
            return (
                <div className="primary-layout">
                    <main id="page-wrap">
                        <Switch>
                            <Route exact path={`${match.url}/register/start`} component={StepOnePage} />
                            <Route exact path={`${match.url}/register/details`} component={StepTwoPage} />
                            <Route exact path={`${match.url}/register/checkout`} component={StepThreePage} />
                            <Route exact path={`${match.url}/register/extra`} component={StepExtraQuestionsPage} />
                            <Route exact path={`${match.url}/register/done`} component={StepFourPage} />
                            <Route render={props => (<Redirect to={`${match.url}/register/start`} />)} />
                        </Switch>
                    </main>
                </div>
            );
        }
        return null;
    }
}

const mapStateToProps = ({ summitState, invitationState }) => ({
    summit: summitState.purchaseSummit,
    invitation: invitationState.selectedInvitation,
    invalidInvitation: invitationState.error
});

export default connect(
    mapStateToProps,
    {
        getInvitationByHash
    }
)(InviteesLayout);



/**
 * Copyright 2017 OpenStack Foundation
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

import history from '../history'
import React from 'react'
import { Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { AbstractAuthorizationCallbackRoute } from "openstack-uicore-foundation/lib/components";
import { getUserInfo, getCurrentHref } from "openstack-uicore-foundation/lib/methods";
import URI from "urijs";

class AuthorizationCallbackRoute extends AbstractAuthorizationCallbackRoute {

    constructor(props){
      super(process.env['IDP_BASE_URL'], process.env['OAUTH2_CLIENT_ID'], props);
    }

    _callback(backUrl) {
      this.props.getUserInfo('groups','', backUrl, history);
    }

    _redirect2Error(error){
        let url = URI(getCurrentHref());
        let query = url.search(true);
        let backUrl = query.hasOwnProperty('BackUrl') ? query['BackUrl'] : '/';
        // invitation flow
        if(backUrl.startsWith('/a/invitations')) {
            return (
                <Route render={ props => {
                    return <Redirect to={`${backUrl}`} />
                }} />
            )
        }

        return (
            <Route render={ props => {
                return <Redirect to={`/error?error=${error}`} />
            }} />
        )
    }
}

const mapStateToProps = ({ loggedUserState }) => ({
  sessionState: loggedUserState.sessionState,
})

export default connect(mapStateToProps,{
  getUserInfo
})(AuthorizationCallbackRoute)

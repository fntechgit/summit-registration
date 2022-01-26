/**
 * Copyright 2019
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
import URI from "urijs"
import React from 'react'
import { withRouter } from 'react-router-dom'

class LogOutCallbackRoute extends React.Component {

    constructor(props){
        super(props);

        this.state = {
           error: null
        };
    }

    componentDidMount() {
        let storedState = window.localStorage.getItem('post_logout_state');
        window.localStorage.removeItem('post_logout_state');
        console.log(`retrieved state ${storedState}`);
        let { doLogout, location, history } = this.props;
        let query = URI.parseQuery(location.search);

        if(!query.hasOwnProperty("state")) {
            this.setState({...this.state, error: 'Missing State.'});
            return;
        }

        if(query["state"] !== storedState) {
            this.setState({...this.state, error: 'Invalid State.'});
            return;
        }

        doLogout();
        // try to retrieve the post logout back url and summit slug
        let backUrl = window.localStorage.getItem('post_logout_back_uri');
        window.localStorage.removeItem('post_logout_back_uri');

        let summitSlug = window.localStorage.getItem('post_logout_summit_slug');
        window.localStorage.removeItem('post_logout_summit_slug');

        if (backUrl) {
            //console.log(`LogOutCallbackRoute::render backUrl ${backUrl}`);
            window.location = this.postProcessBackUrl(backUrl, summitSlug);
            return;
        }
        window.location = "https://techweek2022.yahoo.fnvirtual.app/";
    }

    postProcessBackUrl(backUrl, summitSlug) {
        const startUrl = summitSlug ? `/a/${summitSlug}/register/start`: 'https://techweek2022.yahoo.fnvirtual.app/';
        const detailUrl = '/a/member/orders/detail';
        const memberUrl = '/a/member/orders';
        console.log(`startUrl ${startUrl}`);
        // special case, force relogin
        if (backUrl === detailUrl) return memberUrl;
        // invitation flow
        if(backUrl.startsWith('/a/invitations')) return backUrl;

        return startUrl
    }

    render() {
        if(this.state.error != null){
            return (<p>${this.state.error}</p>)
        }
        return null;
    }
}

export default withRouter(LogOutCallbackRoute);


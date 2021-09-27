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
import React from 'react'
import T from 'i18n-react/dist/i18n-react'
import history from '../history'
import URI from 'urijs';
import LogoutWarningPopUp from "./logout-warning-popup"

export default class
    UserButtons extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            showLogOut: false,
        };

        this.toggleLogOut = this.toggleLogOut.bind(this);        
        this.onTicketClick = this.onTicketClick.bind(this);
        this.onOrderClick = this.onOrderClick.bind(this);
        this.onLogOutClick = this.onLogOutClick.bind(this);
    }

    toggleLogOut(ev) {
        this.setState({ showLogOut: !this.state.showLogOut });
    }    

    onTicketClick() {
        this.setState({ showLogOut: !this.state.showLogOut }, () => history.push('/a/member/orders'));
    }

    onOrderClick() {
        this.setState({ showLogOut: !this.state.showLogOut }, () => history.push('/a/member/tickets'));
    }

    onLogOutClick() {
        let { initLogOut, summitSlug } = this.props;

        // save current location and summit slug, for further redirect logic
        window.localStorage.setItem('post_logout_back_uri', new URI(window.location.href).pathname());
        window.localStorage.setItem('post_logout_summit_slug', summitSlug);
        initLogOut();
    }

    render() {
        let { initLogOut } = this.props;

        return (
            <div>
                <div className="btn-wrapper">
                    <button className="btn btn-primary btn-xs btn-header" onClick={() => { this.onTicketClick(); }}>
                        <i className="fa fa-shopping-cart" />
                        {T.translate("nav_bar.my-orders")}
                    </button>
                    <button className="btn btn-primary btn-xs btn-header" onClick={() => { this.onOrderClick(); }}>
                        <i className="fa fa-ticket" />
                        {T.translate("nav_bar.my-tickets")}
                    </button>
                    <button className="btn btn-primary btn-xs btn-header" onClick={() => { this.onLogOutClick(); }}>
                        <i className="fa fa-sign-out" />
                        {T.translate("landing.sign_out")}
                    </button>
                </div>
                <LogoutWarningPopUp initLogOut={initLogOut} />
            </div>
        );
    }
}

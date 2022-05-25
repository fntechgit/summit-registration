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
import { Input, RegistrationCompanyInput } from 'openstack-uicore-foundation/lib/components'
import { doLogin, initLogOut } from 'openstack-uicore-foundation/lib/methods';
import URI from "urijs";
import Swal from 'sweetalert2';


class BasicInfoForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {

        };

        this.getBackURL = this.getBackURL.bind(this);
        this.onClickLogin = this.onClickLogin.bind(this);
        this.handleCompanyError = this.handleCompanyError.bind(this);

    }

    hasErrors(field) {
        let { errors } = this.props;
        if (field in errors) {
            return errors[field];
        }

        return '';
    }

    getBackURL() {
        let defaultLocation = '/a/member/orders';
        let url = URI(window.location.href);
        let location = url.pathname();
        if (location === '/') location = defaultLocation
        let query = url.search(true);
        let fragment = url.fragment();
        let backUrl = query.hasOwnProperty('BackUrl') ? query['BackUrl'] : location;
        if (fragment != null && fragment != '') {
            backUrl += `#${fragment}`;
        }
        return backUrl;
    }

    handleCompanyError() {
        Swal.fire("ERROR", T.translate("errors.session_expired"), "error").then(() => {
            // save current location and summit slug, for further redirect logic
            window.localStorage.setItem('post_logout_back_uri', new URI(window.location.href).pathname());
            initLogOut();
        });
    }

    onClickLogin() {
        this.getBackURL();
        doLogin(this.getBackURL());
    }

    render() {
        let { order, onChange, member, invitation, summitId } = this.props;

        return (
            <div className="basic-info">
                <div className="row info-title">
                    <div className="col-md-8">
                        <h3>{T.translate("step_two.basic_info")}</h3>
                    </div>
                    <div className="col-md-4 required">
                        * {T.translate("step_two.required")}
                    </div>
                </div>
                {!member &&
                    <div className="row">
                        <div className="col-md-12">
                            {T.translate("step_two.have_account")}
                            <u className="link ml-1 mr-1" onClick={() => this.onClickLogin()}>{T.translate("step_two.sign_in")}</u>
                            {T.translate("step_two.sign_in_account")}
                        </div>
                    </div>
                }
                <div className="row field-wrapper">
                    <div className="col-md-4">
                        <label>{T.translate("step_two.first_name")} *</label>
                    </div>
                    <div className="col-md-6">
                        <Input
                            id="first_name"
                            className={`form-control ${!!invitation ? 'disabled' : ''}`}
                            error={this.hasErrors('first_name')}
                            disabled={!!invitation}
                            onChange={onChange}
                            value={order.first_name}
                        />
                    </div>
                </div>
                <div className="row field-wrapper">
                    <div className="col-md-4">
                        <label>{T.translate("step_two.last_name")} *</label>
                    </div>
                    <div className="col-md-6">
                        <Input
                            id="last_name"
                            className={`form-control ${!!invitation ? 'disabled' : ''}`}
                            error={this.hasErrors('last_name')}
                            disabled={!!invitation}
                            onChange={onChange}
                            value={order.last_name}
                        />
                    </div>
                </div>
                <div className="row field-wrapper">
                    <div className="col-md-4">
                        <label>{T.translate("step_two.email")} *</label>
                    </div>
                    <div className="col-md-6">
                        <Input
                            id="email"
                            className={`form-control disabled`}
                            error={this.hasErrors('email')}
                            onChange={onChange}
                            disabled={true}
                            value={order.email}
                        />
                    </div>
                </div>
                <div className="row field-wrapper">
                    <div className="col-md-4">
                        <label>{T.translate("step_two.company")} *</label>
                    </div>
                    <div className="col-md-6">
                        <RegistrationCompanyInput
                            id="company"
                            summitId={summitId}
                            error={this.hasErrors('company')}
                            className={`dropdown ${!!invitation ? 'disabled' : ''}`}
                            onChange={onChange}
                            onError={(e) => this.handleCompanyError()}
                            value={!!invitation ? {id: null, name: window.INVITATION_DEFAULT_COMPANY} : order.company}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

export default BasicInfoForm;

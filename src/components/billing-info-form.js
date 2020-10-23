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
import { Input, CountryInput } from 'openstack-uicore-foundation/lib/components'


class BillingInfoForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {

        };

    }

    hasErrors(field) {
        let {errors} = this.props;
        if(field in errors) {
            return errors[field];
        }

        return '';
    }


    render() {
        let {order, onChange} = this.props;

        return (
            <div className="billing-info">
                <div className="row">
                    <div className="col-md-12">
                        {order.reservation.discount_amount !== order.reservation.raw_amount ? 
                          <h3>{T.translate("step_three.billing_info")}</h3>
                          :
                          <h3>{T.translate("step_three.billing_address")}</h3>
                        }                                                
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                    </div>
                </div>                
                {/* <div className="row field-wrapper">
                    <div className="col-md-4">
                        <label>{T.translate("step_three.billing_address")} *</label>
                    </div>
                    <div className="col-md-6">
                        <Input
                            id="billing_address"
                            className="form-control"
                            error={this.hasErrors('billing_address')}
                            onChange={onChange}
                            value={order.billing_address}
                        />
                    </div>
                </div>
                <div className="row field-wrapper">
                    <div className="col-md-4">
                        <label>{T.translate("step_three.billing_address_two")}</label>
                    </div>
                    <div className="col-md-6">
                        <Input
                            id="billing_address_two"
                            className="form-control"
                            error={this.hasErrors('billing_address_two')}
                            onChange={onChange}
                            value={order.billing_address_two}
                        />
                    </div>
                </div>
                <div className="row field-wrapper">
                    <div className="col-md-4">
                        <label>{T.translate("step_three.billing_city")} *</label>
                    </div>
                    <div className="col-md-3">
                        <Input
                            id="billing_city"
                            className="form-control"
                            error={this.hasErrors('billing_city')}
                            onChange={onChange}
                            value={order.billing_city}
                        />
                    </div>
                </div>
                <div className="row field-wrapper">
                    <div className="col-md-4">
                        <label>{T.translate("step_three.billing_state")} *</label>
                    </div>
                    <div className="col-md-3">
                        <Input
                            id="billing_state"
                            className="form-control"
                            error={this.hasErrors('billing_state')}
                            onChange={onChange}
                            value={order.billing_state}
                        />
                    </div>
                </div> */}
                <div className="row field-wrapper">
                    <div className="col-md-4">
                        <label>{T.translate("step_three.billing_zipcode")} *</label>
                    </div>
                    <div className="col-md-3">
                        <Input
                            id="billing_zipcode"
                            className="form-control"
                            error={this.hasErrors('billing_zipcode')}
                            onChange={onChange}
                            value={order.billing_zipcode}
                        />
                    </div>
                </div>
                {/* <div className="row field-wrapper">
                    <div className="col-md-4">
                        <label>{T.translate("step_three.billing_country")} *</label>
                    </div>
                    <div className="col-md-6">
                        <CountryInput
                            id="billing_country"
                            error={this.hasErrors('billing_country')}
                            onChange={onChange}
                            value={order.billing_country} 
                        />                        
                    </div>
                </div> */}
            </div>
        );
    }
}

export default BillingInfoForm;

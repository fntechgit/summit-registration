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
import React from 'react';
import { connect } from 'react-redux';
import cloneDeep from "lodash.clonedeep";
import OrderSummary from "../components/order-summary";
import StepRow from '../components/step-row';
import SubmitButtons from "../components/submit-buttons";
import { handleOrderChange, validateStripe } from '../actions/order-actions'
import {findElementPos} from "openstack-uicore-foundation/lib/methods";
import { Elements, StripeProvider } from 'react-stripe-elements';
import PaymentInfoForm from "../components/payment-info-form";
import BillingInfoForm from "../components/billing-info-form";
import '../styles/step-three-page.less';
import history from '../history';
import URI from "urijs";


class StepThreePage extends React.Component {

    constructor(props){
        super(props);

        this.state = {
            stripe: {},
            token: {},
            dirty: false
        };

        this.step = 3;

        this.handleChange = this.handleChange.bind(this);
        this.handleStripe = this.handleStripe.bind(this);
        this.handleShowErrors = this.handleShowErrors.bind(this);

    }    

    componentWillReceiveProps(nextProps) {
        let {dirty} = this.state;
        //scroll to first error
        if(Object.keys(nextProps.errors).length > 0 && dirty) {
            let firstError = Object.keys(nextProps.errors)[0];
            let firstNode = document.getElementById(firstError);
            if (firstNode) window.scrollTo(0, findElementPos(firstNode));
        }
    }

    componentWillMount() {
      let {summit: {slug}} = this.props;
      const stepDefs = ['start', 'details', 'checkout', 'extra', 'done'];

      let url = URI(window.location.href);
      let location = url.pathname();
      
      let sameUrlAsSlug = location.match(/.*\/a\/(.*)\/register\/checkout/)[1] === slug;      

      if(sameUrlAsSlug) {
        window.scrollTo(0, 0);
      }
    }

    componentDidMount() {
        let {order:{reservation}, summit} = this.props;
        const stepDefs = ['start', 'details', 'checkout', 'extra', 'done'];

        if (Object.entries(reservation).length === 0 && reservation.constructor === Object) {
            history.push(stepDefs[0]);
        } else {
            window.scrollTo(0, 0);

            let order = {...this.props.order};
        
            order = {
                ...order,
                currentStep: this.step
            };

            let address = this.props.member ? this.props.member.address : {country: 'US'};

            if(Object.entries(address).length !== 0 && address.constructor === Object) {        
                let {country, region, locality, postal_code, street_address} = address;
                order = {
                    ...order, 
                    // billing_country: country ? country : '',
                    // billing_address: street_address ? street_address : '',
                    // billing_city: locality ? locality : '',
                    // billing_state: region ? region : '',
                    billing_zipcode: postal_code ? postal_code : '',
                };
            }       
            
            this.props.handleOrderChange(order)
        }        
    }

    handleChange(ev) {
        let order = cloneDeep(this.props.order);
        let errors = cloneDeep(this.props.errors);
        let {value, id} = ev.target;

        delete(errors[id]);
        order[id] = value;

        this.props.handleOrderChange(order, errors);
    }

    async handleStripe(ev, stripe) {        
        let {order} = this.props;
        let stripeErrors = Object.values(ev).filter(x => x.required === true && x.message === '');

        if(stripeErrors.length === 3) { 
            let {card} = await stripe.createToken({              
              name: `${order.first_name} ${order.last_name}`,
              address_line1: order.billing_address,
              address_line2: order.billing_address_two,
              address_city: order.billing_city,
              address_state: order.billing_state,
              address_zip: order.billing_zipcode,
              address_country: order.billing_country,
            });
            this.setState({card, stripe}, () => this.props.validateStripe(true));
        } else {
            this.setState({stripe: {}}, () => this.props.validateStripe(false));
        }
    }

    handleShowErrors() {
        this.setState({dirty: true});
    }

    render(){
        let {summit, order, errors, stripeForm} = this.props;
        if((Object.entries(summit).length === 0 && summit.constructor === Object) ) return null;
        let {card, stripe, dirty} = this.state;
        let publicKey = null;
        for(let profile of summit.payment_profiles){
            if(profile.application_type === 'Registration'){
                publicKey = profile.test_mode_enabled ? profile.test_publishable_key : profile.live_publishable_key;
                break;
            }
        }

        console.log(`stripe publisable key ${publicKey}`);

        return (
            <div className="step-three">
                <OrderSummary order={order} summit={summit} type={'mobile'} />
                <StepRow step={this.step} totalSteps={4} />
                <div className="row">
                    <div className="col-md-8">
                        {order.reservation.discount_amount !== order.reservation.raw_amount &&
                            <StripeProvider apiKey={publicKey}>
                                <Elements>
                                    <PaymentInfoForm 
                                        onChange={this.handleStripe} 
                                        order={order} 
                                        dirty={dirty} />
                                </Elements>
                            </StripeProvider>
                        }
                        <BillingInfoForm 
                            onChange={this.handleChange}
                            order={order} 
                            summit={summit}                                
                            errors={dirty ? errors : {}} />
                    </div>
                    <div className="col-md-4">
                        <OrderSummary order={order} summit={summit} type={'desktop'} />
                    </div>
                </div>
                <SubmitButtons 
                    step={this.step} 
                    stripe={stripe} 
                    card={card}
                    free={order.reservation.discount_amount === order.reservation.raw_amount}
                    errors={{errors, stripeForm}}
                    dirty={this.handleShowErrors} />
            </div>
        );
    }
}

const mapStateToProps = ({ loggedUserState, summitState, orderState }) => ({
    member: loggedUserState.member,
    summit: summitState.purchaseSummit,
    order:  orderState.purchaseOrder,
    errors:  orderState.errors,
    stripeForm:  orderState.stripeForm,
})

export default connect (
    mapStateToProps,
    {
        handleOrderChange,
        validateStripe
    }
)(StepThreePage);


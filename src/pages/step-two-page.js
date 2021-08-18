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
import moment from "moment";
import cloneDeep from "lodash.clonedeep";
import OrderSummary from "../components/order-summary";
import BasicInfoForm from '../components/basic-info-form';
import TicketInfoForm from '../components/ticket-info-form';
import StepRow from '../components/step-row';
import SubmitButtons from "../components/submit-buttons";
import { handleOrderChange, stepDefs } from '../actions/order-actions'
import { findElementPos, getIdToken } from "openstack-uicore-foundation/lib/methods";
import {getNow} from '../actions/timer-actions';
import history from '../history';
import DisclaimerPopup from "../components/disclaimer-popup";
import {getMarketingValue} from "../utils/helpers";
import '../styles/step-two-page.less';
import T from "i18n-react/dist/i18n-react";
import IdTokenVerifier from 'idtoken-verifier';

class StepTwoPage extends React.Component {

    constructor(props){
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.handleTicketInfoChange = this.handleTicketInfoChange.bind(this);
        this.handleAddTicket = this.handleAddTicket.bind(this);
        this.handleRemoveTicket = this.handleRemoveTicket.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleShowErrors = this.handleShowErrors.bind(this);
        this.onAcceptDisclaimer = this.onAcceptDisclaimer.bind(this);
        this.onRejectDisclaimer = this.onRejectDisclaimer.bind(this);
        this.hasInPersonTicketTypes = this.hasInPersonTicketTypes.bind(this);

        this.state = {
            dirty: false,
            shouldShowInPersonDisclaimerPopup: this.hasInPersonTicketTypes(props.order),
            acceptedInPersonDisclaimer: false
        };

        this.step = 2;
    }

    onAcceptDisclaimer(){
        this.setState({...this.state,
            shouldShowInPersonDisclaimerPopup : false,
            acceptedInPersonDisclaimer : true,
        })
    }

    onRejectDisclaimer(){
        history.push(stepDefs[0]);
    }

    hasInPersonTicketTypes(order){
        /** check is the current order has or not IN_PERSON tickets types **/
        let { summit } = this.props;
        return order.tickets.some(tix => {
            let type = summit.ticket_types?.filter((tt) => tt.id == tix.type_id);
            if(type?.length > 0 && type[0].hasOwnProperty("badge_type")){
                let badgeType = type[0].badge_type;
                return badgeType.access_levels.some((al) => { return al.name == 'IN_PERSON'});
            }
            return false;
        });
    }

    componentWillMount() {
        let order = {...this.props.order};
        let {member} = this.props;
        
        order = {
            ...order,
            reservation: {},
            checkout: {},
            currentStep: this.step
        };

        order.tickets.map(t => {
          if(!t.tempId) {
            const randomNumber = Math.floor(Math.random() * 10000) + 1; 
            t.tempId = randomNumber;
            return t;
          }
        });

        if(member) {
            const idToken = getIdToken();
            let first_name = '' , last_name = '', email = '', company = '';
            if(idToken) {
                try {
                    const verifier = new IdTokenVerifier();
                    let jwt = verifier.decode(idToken);
                    first_name = member.first_name;
                    last_name = member.last_name;
                    email = member.email;
                    company = jwt.payload.company;
                }
                catch (e){
                    log.error(e);
                }
            }
            order = {...order, email, first_name : first_name ?? '', last_name: last_name ?? '', company: company ?? ''}; 
        }
        this.props.handleOrderChange(order);
    }

    componentWillReceiveProps(nextProps) {
        let {dirty} = this.state;
        //scroll to first error
        if(Object.keys(nextProps.errors).length > 0 && dirty) {
            let firstError = Object.keys(nextProps.errors)[0]
            let firstNode = document.getElementById(firstError);
            if (firstNode) window.scrollTo(0, findElementPos(firstNode));
        }
    }

    componentDidMount() {
        let {order:{tickets}} = this.props;
        if (!tickets || tickets.length === 0) {
            history.push(stepDefs[0]);
            return;
        }
        window.scrollTo(0, 0);
    }

    handleTicketInfoChange(ticketId, field, value) {
        let order = cloneDeep(this.props.order);
        let errors = cloneDeep(this.props.errors);        

        order.tickets.forEach(tix => {
            if (tix.tempId == ticketId) {
                tix[field] = value;
            }
        });

        this.props.handleOrderChange(order, errors);
    }

    handleChange(ev) {

        let order = cloneDeep(this.props.order);
        let errors = cloneDeep(this.props.errors);
        let {value, id} = ev.target;

        delete(errors[id]);
        order[id] = value;

        this.props.handleOrderChange(order, errors);
    }

    handleAddTicket(ticketTypeId) {
        let order = cloneDeep(this.props.order);
        let errors = cloneDeep(this.props.errors);        
        let randomNumber = moment().valueOf();

        order.tickets.push({type_id: ticketTypeId, tempId: randomNumber});
        this.setState({...this.state,  shouldShowInPersonDisclaimerPopup: this.hasInPersonTicketTypes(order)});
        this.props.handleOrderChange(order, errors);
    }

    handleRemoveTicket(ticketId) {
        let order = cloneDeep(this.props.order);
        let errors = cloneDeep(this.props.errors);
        order.tickets = order.tickets.filter(t => t.tempId != ticketId);
        this.setState({...this.state,  shouldShowInPersonDisclaimerPopup: this.hasInPersonTicketTypes(order)});
        this.props.handleOrderChange(order, errors);
    }

    handleSubmit(ev) {
        ev.preventDefault();
    }

    handleShowErrors() {        
        this.setState({dirty: true});
    }

    render(){
        let {summit, order, errors, member} = this.props;
        let {dirty} = this.state;
        const disclaimer = getMarketingValue('registration_in_person_disclaimer');
        if((Object.entries(summit).length === 0 && summit.constructor === Object) ) return null;
        return (
            <div className="step-two">
                <OrderSummary order={order} summit={summit} type={'mobile'} />
                <StepRow step={this.step} />
                <div className="row">
                    <div className="col-md-8">
                        <BasicInfoForm order={order} errors={dirty? errors : {}} onChange={this.handleChange} member={member}/>
                        {summit.ticket_types.map((t,i) => (
                            <TicketInfoForm
                                now={this.props.getNow()}
                                key={`tixinfo_${t.ticket_type_id}_${i}`}
                                ticketType={t}
                                order={order}
                                errors={dirty? errors : {}}
                                onAddTicket={this.handleAddTicket}
                                onRemoveTicket={this.handleRemoveTicket}
                                onChange={this.handleTicketInfoChange}
                                summit={summit}
                            />
                        ))}
                    </div>
                    <div className="col-md-4">
                        <OrderSummary order={order} summit={summit} type={'desktop'} />
                    </div>
                </div>
                {disclaimer && this.state.shouldShowInPersonDisclaimerPopup && !this.state.acceptedInPersonDisclaimer &&
                    <DisclaimerPopup
                        title={T.translate("step_two.disclaimer_in_person_title")}
                        body={disclaimer}
                        onAccept={this.onAcceptDisclaimer}
                        onReject={this.onRejectDisclaimer}
                    />
                }
                <SubmitButtons
                    step={this.step} 
                    errors={errors} 
                    canContinue={order.tickets.length > 0}
                    dirty={this.handleShowErrors}/>
            </div>
        );
    }
}

const mapStateToProps = ({ loggedUserState, summitState, orderState, baseState }) => ({
    member: loggedUserState.member,
    summit: summitState.purchaseSummit,
    order: orderState.purchaseOrder,
    errors: orderState.errors,
    marketingSettings: baseState.marketingSettings,
})

export default connect (
    mapStateToProps,
    {
        handleOrderChange,
        getNow
    }
)(StepTwoPage);


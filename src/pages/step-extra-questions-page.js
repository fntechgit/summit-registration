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
import '../styles/step-extra-questions-page.less';
import TicketAssignForm from "../components/ticket-assign-form";
import { updateOrderTickets, payReservation } from "../actions/order-actions";
import { getNow } from '../actions/timer-actions';
import TicketModel from '../models/ticket';
import T from "i18n-react";
import validator from "validator";
import Swal from 'sweetalert2';
import OrderSummary from "../components/order-summary";
import StepRow from "../components/step-row";
import history from '../history';
import { stepDefs } from '../global/constants';
import QuestionsSet from 'openstack-uicore-foundation/lib/utils/questions-set'

class StepExtraQuestionsPage extends React.Component {

    constructor(props) {
        super(props);
        let { order, attendee } = this.props;
        let uniqueOwners = [];

        let tickets = order.tickets.filter((ticket) => {
            // just filter unique attendees, bc we are only interested to get answers per attendee ...
            let attendee_email=  ticket.hasOwnProperty('owner') ? ticket.owner.email : '';
            // if attendee is empty then it should show
            if(attendee_email == '') return true;
            if(uniqueOwners.includes(attendee_email)) return false;
            uniqueOwners.push(attendee_email);
            return true;
        }).map((ticket, index) => {

            const ownerId = ticket.hasOwnProperty('owner_id') ? ticket.owner_id : (ticket.hasOwnProperty('owner') ? ticket.owner.id : 0);
            const answers = attendee && attendee.id === ownerId ? attendee.extra_questions.map( q => ({question_id: q.question_id, value : q.value })) : [];
            let t = {
                id: ticket.id,
                owner_id: ownerId,
                attendee_email: ticket.hasOwnProperty('owner') ? ticket.owner.email : '',
                attendee_first_name: ticket.hasOwnProperty('owner') ? ticket.owner.first_name : '',
                attendee_last_name: ticket.hasOwnProperty('owner') ? ticket.owner.last_name : '',
                attendee_company: ticket.hasOwnProperty('owner') ? ticket.owner.company : '',
                owner: ticket.hasOwnProperty('owner') ? ticket.owner : null,
                disclaimer_accepted: null,
                extra_questions: answers,
                errors: {
                    reassign_email: '',
                    attendee_email: '',
                    extra_questions: '',
                }
            }
            return t;
        });

        this.state = {
            tickets: tickets
        };

        this.step = 3;

        this.handleTicketCancel = this.handleTicketCancel.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleTicketSave = this.handleTicketSave.bind(this);
        this.onSkip = this.onSkip.bind(this);
        this.handleNewExtraQuestions = this.handleNewExtraQuestions.bind(this);
        this.triggerFormSubmit = this.triggerFormSubmit.bind(this);

        this.formRef = React.createRef();
    }

    componentDidMount() {
        let {order: {reservation}, summit} = this.props;

        if (Object.entries(reservation).length === 0 && reservation.constructor === Object) {
            history.push(stepDefs[0]);
            return;
        }

        window.scrollTo(0, 0);
    }

    handleTicketCancel() {

    }

    onSkip(ev) {
        let { history, match, order } = this.props;
        const stepDefs = ['start', 'details', 'checkout', 'extra', 'done'];
        ev.preventDefault();
        if(!order.checkout.id) {
            this.props.payReservation();
        } else {
            history.push(stepDefs[4]);
        }
        return null;
    }

    handleNewExtraQuestions (answersForm, ticket) {
        const { mainExtraQuestions } = this.props;
        const qs = new QuestionsSet(mainExtraQuestions);
        let newAnswers = [];
        Object.keys(answersForm).forEach(name => {
            let question = qs.getQuestionByName(name);
            if(!question){
                console.log(`missing question for answer ${name}.`);
                return;
            }
            if(answersForm[name] || answersForm[name].length > 0) {
              newAnswers.push({ question_id: question.id, answer: `${answersForm[name]}`});
            }
        });
        const newTickets = this.state.tickets.map(t => {
            t.extra_questions = newAnswers;
            return t;
        });
        this.setState({...this.state, tickets: newTickets}, () => this.handleTicketSave())
      }
    
      triggerFormSubmit() {
        this.formRef.current.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }))
      }

    handleTicketSave(ev) {
        let { tickets } = this.state;
        let { summit, getNow, extraQuestions, order } = this.props;
        let canSave = true;
        tickets.forEach(function (ticket) {
            // validate each ticket
            let model = new TicketModel(ticket, summit, getNow());


            if(!model.validateSummitDisclaimer()){
                canSave = false;
                Swal.fire("Validation Error", "Please check Disclaimer.", "warning");
            }

            if (ticket.attendee_email == '') {
                canSave = false;
                Swal.fire("Validation Error", "Please assign ticket.", "warning");
            }

            // check summit disclaimer

        });

        if (canSave) {
            if(!order.checkout.id) {
                this.props.updateOrderTickets(tickets).then( () => this.props.payReservation());
                return;
            }
            this.props.updateOrderTickets(tickets);
        }
    }

    handleChange(ev, ticket) {

        let currentTicket = { ...this.state.tickets.filter((t) => t.id === ticket.id)[0] };

        let { value, id } = ev.target;
        id = id.toString();

        if (id.includes(`${ticket.id}_`)) {
            id = id.split(`${ticket.id}_`)[1];
        }

        if (ev.target.type === 'checkbox') {
            value = ev.target.checked;
        }

        if (ev.target.type === 'datetime') {
            value = value.valueOf() / 1000;
        }

        currentTicket[id] = value;

        !validator.isEmail(currentTicket.attendee_email) ? currentTicket.errors.attendee_email = 'Please enter a valid Email.' : currentTicket.errors.attendee_email = '';

        this.setState({
            tickets: this.state.tickets.map((t) => {
                if (t.id === currentTicket.id) {
                    return currentTicket;
                }
                return t;
            })
        });
    }

    render() {
        let now = this.props.getNow();
        let { summit, extraQuestions, order, invitation } = this.props;
        if ((Object.entries(summit).length === 0 && summit.constructor === Object)) return null;
        order.status = 'Paid';
        let hasValidInvitation = invitation?.summit_id === summit.id;
        return (
            <div className="step-extra-questions">
                <OrderSummary order={order} summit={summit} type={'mobile'} />
                <div className="row">
                    <StepRow step={this.step} optional={true} />
                    <div className="col-md-8 order-result">

                        {this.state.tickets.map((ticket, index) => {
                            let model = new TicketModel(ticket, summit, now);
                            let status = model.getStatus();
                            return (
                                <React.Fragment key={ticket.id}>
                                    { this.state.tickets.length > 1 &&
                                        <div className="row">
                                            <div className="col-md-12">
                                                <h4>{`Ticket # ${index + 1}`} <i
                                                    className={`fa ${status.icon} ${status.class}`}></i></h4>
                                            </div>
                                        </div>
                                    }
                                    <div className="row">
                                        <div className="col-md-12">
                                            <TicketAssignForm key={ticket.id}
                                                shouldEditBasicInfo={!hasValidInvitation}
                                                showCancel={false}
                                                ticket={ticket}
                                                status={status.text}
                                                ownedTicket={true}
                                                orderOwned={true}
                                                extraQuestions={extraQuestions}
                                                readOnly={false}
                                                onChange={this.handleChange}
                                                cancelTicket={this.handleTicketCancel}
                                                summit={summit}
                                                now={now}
                                                errors={ticket.errors}
                                                formRef={this.formRef}
                                                handleNewExtraQuestions={this.handleNewExtraQuestions} />
                                        </div>
                                    </div>
                                </React.Fragment>
                            );
                        })}
                    </div>
                    <div className="col-md-4">
                        <OrderSummary order={order} summit={summit} type={'desktop'} /><br />
                        <br />
                    </div>
                </div>
                <div className="row submit-buttons-wrapper">
                    <div className="col-md-12">
                        <button
                            className="btn btn-primary"
                            onClick={this.triggerFormSubmit}>
                            {T.translate("ticket_popup.save_changes")}
                        </button>
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = ({ loggedUserState, summitState, orderState, invitationState, userState }) => ({
    member: loggedUserState.isLoggedUser,
    summit: summitState.purchaseSummit,
    mainExtraQuestions: summitState.mainExtraQuestions,
    order: orderState.purchaseOrder,
    selectedSummit : summitState.selectedSummit,
    extraQuestions: summitState.mainExtraQuestions,
    invitation: invitationState.selectedInvitation,
    attendee : userState.currentAttendee
});

export default connect(
    mapStateToProps,
    {
        getNow,
        updateOrderTickets,
        payReservation,
    }
)(StepExtraQuestionsPage);
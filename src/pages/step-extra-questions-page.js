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

class StepExtraQuestionsPage extends React.Component {

    constructor(props) {
        super(props);

        let { order } = this.props;
        let tickets = order.tickets.map((ticket, index) => {
            let t = {
                id: ticket.id,
                owner_id: ticket.hasOwnProperty('owner_id') ? ticket.owner_id : (ticket.hasOwnProperty('owner') ? ticket.owner.id : 0),
                attendee_email: ticket.hasOwnProperty('owner') ? ticket.owner.email : '',
                attendee_first_name: ticket.hasOwnProperty('owner') ? ticket.owner.first_name : '',
                attendee_last_name: ticket.hasOwnProperty('owner') ? ticket.owner.last_name : '',
                attendee_company: ticket.hasOwnProperty('owner') ? ticket.owner.company : '',
                owner: ticket.hasOwnProperty('owner') ? ticket.owner : null,
                disclaimer_accepted: null,
                extra_questions: [],
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
        this.onTicketsSave = this.onTicketsSave.bind(this);
        this.onSkip = this.onSkip.bind(this);
    }

    componentDidMount() {
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
            history.push(stepDef[4]);
        }
        return null;
    }

    onTicketsSave(ev) {
        let { tickets } = this.state;
        let { summit, getNow, extraQuestions, order } = this.props;

        let canSave = true;
        tickets.forEach(function (ticket) {
            // validate each ticket
            let model = new TicketModel(ticket, summit, getNow());

            if (!model.validateExtraQuestions(extraQuestions)) {
                canSave = false;
                Swal.fire("Validation Error", "Please answer mandatory questions.", "warning");
            }

            if (ticket.attendee_email == '') {
                canSave = false;
                Swal.fire("Validation Error", "Please assign ticket.", "warning");
            }
        });

        if (canSave) {
            if(!order.checkout.id) {
                this.props.updateOrderTickets(tickets);
                this.props.payReservation();
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
        let { summit, extraQuestions, order } = this.props;
        if ((Object.entries(summit).length === 0 && summit.constructor === Object)) return null;
        order.status = 'Paid';
        return (
            <div className="step-extra-questions">
                <OrderSummary order={order} summit={summit} type={'mobile'} />
                <div className="row">
                    <StepRow step={this.step} optional={true} />
                    <div className="col-md-8 order-result">

                        {T.translate("ticket_popup.do_it_later_exp")}
                        {this.state.tickets.map((ticket, index) => {
                            let model = new TicketModel(ticket, summit, now);
                            let status = model.getStatus();
                            return (
                                <React.Fragment key={ticket.id}>
                                    <div className="row">
                                        <div className="col-md-12">
                                            <h4>{`Ticket # ${index + 1}`} <i className={`fa ${status.icon} ${status.class}`}></i></h4>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-12">
                                            <TicketAssignForm key={ticket.id}
                                                shouldEditBasicInfo={true}
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
                                                errors={ticket.errors} />
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
                            onClick={this.onTicketsSave}>
                            {T.translate("ticket_popup.save_changes")}
                        </button>
                        <span className="or">OR</span>
                        <a className="back-btn" href="#" onClick={this.onSkip}>
                            {T.translate("ticket_popup.do_it_later")}
                            <i className="fa fa-chevron-right" aria-hidden="true"></i>
                        </a>

                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = ({ loggedUserState, summitState, orderState }) => ({
    member: loggedUserState.isLoggedUser,
    summit: summitState.purchaseSummit,
    order: orderState.purchaseOrder,
    extraQuestions: summitState.purchaseSummit.order_extra_questions,
});

export default connect(
    mapStateToProps,
    {
        getNow,
        updateOrderTickets,
        payReservation,
    }
)(StepExtraQuestionsPage);
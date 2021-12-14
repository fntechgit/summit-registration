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

import React from "react";
import { connect } from "react-redux";
import T from "i18n-react/dist/i18n-react";
import moment from "moment";
import TicketInput from "../components/ticket-input";
import StepRow from "../components/step-row";
import SubmitButtons from "../components/submit-buttons";
import { handleOrderChange, handleResetOrder } from "../actions/order-actions";
import { getNow } from "../actions/timer-actions";
import history from "../history";

import "../styles/step-one-page.less";

class StepOnePage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};

    this.step = 1;

    this.handleAddTicket = this.handleAddTicket.bind(this);
    this.handleSubstractTicket = this.handleSubstractTicket.bind(this);
    this.handleTicketToSale = this.handleTicketToSale.bind(this);    
  }

  componentDidMount() {
    // reset order state , specifying the current step number
    this.props.handleResetOrder(this.step);
  }

  handleAddTicket(ticketTypeId) {
    let order = { ...this.props.order };
    let randomNumber = moment().valueOf();
    // @see https://redux.js.org/recipes/structuring-reducers/immutable-update-patterns
    order.tickets = [...order.tickets, { type_id: ticketTypeId, tempId: randomNumber }];
    this.props.handleOrderChange(order);
  }

  handleSubstractTicket(ticketTypeId) {
    let order = { ...this.props.order };
    let idx = order.tickets.findIndex((t) => t.type_id == ticketTypeId);

    if (idx !== -1) {
      // @see https://redux.js.org/recipes/structuring-reducers/immutable-update-patterns
      order.tickets = [...order.tickets.slice(0, idx), ...order.tickets.slice(idx + 1)];
      this.props.handleOrderChange(order);
    }
  }

  handleTicketToSale() {
    let {summit, invitation, now} = this.props;

    let ticketsTypesToSell =
        Object.entries(summit).length === 0 && summit.constructor === Object
          ? []
          : summit.ticket_types.filter(
              (tt) =>
                // if it's an invitation only show allowed ticket types
                invitation?.summit_id === summit.id && invitation?.allowed_ticket_types.length > 0 ? 
                invitation.allowed_ticket_types.includes(tt.id) &&
                // if ticket does not has sales start/end date set could be sell all the registration period
                (tt.sales_start_date == null && tt.sales_end_date == null) || (now >= tt.sales_start_date && now <= tt.sales_end_date) 
                :
                (tt.sales_start_date == null && tt.sales_end_date == null) || (now >= tt.sales_start_date && now <= tt.sales_end_date)
            );

    return ticketsTypesToSell;
  }

  render() {
    let { summit, order, member, invitation, now } = this.props;
    if (Object.entries(summit).length === 0 && summit.constructor === Object) return null;

    // let now = this.props.getNow();
    //order.status = 'Reserved';
    // filter tickets types
    let ticketsTypesToSell = this.handleTicketToSale();      

    return (
      <div className="step-one">
        {now >= summit.registration_begin_date && now <= summit.registration_end_date && ticketsTypesToSell.length > 0 ? (
          <React.Fragment>
            <StepRow step={this.step} />
            <div className="row">
              <div className="col-md-8">
                <div className="row">
                  <div className="col-md-12">
                    <h3>{T.translate("step_one.choose_tickets")}</h3>
                  </div>
                  <div className="col-md-12">
                    <TicketInput
                      ticketTypes={ticketsTypesToSell}
                      summit={summit}
                      selection={order.tickets}
                      add={this.handleAddTicket}
                      substract={this.handleSubstractTicket}
                    />
                    {now <= summit.registration_begin_date && history.push("/a/member/orders")}
                  </div>
                </div>
              </div>
              <div className="col-md-4"></div>
            </div>
            <SubmitButtons step={this.step} canContinue={order.tickets.length > 0} />
          </React.Fragment>
        ) : (
          <div className="no-tickets-text">
            <h3>{T.translate("step_one.no_tickets")}</h3>
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = ({ loggedUserState, summitState, orderState, invitationState, timerState }) => ({
  member: loggedUserState.member,
  summit: summitState.purchaseSummit,
  order: orderState.purchaseOrder,
  now: timerState.now,
  errors: orderState.errors,
  invitation: invitationState.selectedInvitation,
});

export default connect(mapStateToProps, {
  handleOrderChange,
  handleResetOrder,
  getNow
})(StepOnePage);

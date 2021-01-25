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
import { connect } from 'react-redux';
import T from "i18n-react/dist/i18n-react";
import {handleResetOrder} from '../../actions/order-actions';
import '../../styles/tickets-list-page.less';
import TicketList from '../../components/ticket-list';

import { getUserTickets, selectTicket, getTicketPDF, editOwnedTicket, handleTicketChange, refundTicket,
    resendNotification, removeAttendee } from '../../actions/ticket-actions';

import {getNow} from '../../actions/timer-actions';

class TicketsListPage extends React.Component {

  constructor(props){
    super(props);

    this.state = {
    };

    this.handleTicketRemoveAttendee = this.handleTicketRemoveAttendee.bind(this);
    this.handleResendNotification = this.handleResendNotification.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);

  }

    componentWillMount() {    
        let {page, perPage} = this.props;
        // clear order state
        this.props.handleResetOrder();
        this.props.getUserTickets(null, page, perPage);
    }

    handleTicketRemoveAttendee(ticket) {
      this.props.removeAttendee(ticket, true);
    }

    handlePageChange(page) {      
      let {perPage} = this.props;
      this.props.getUserTickets(null, page, perPage);
    }
  
    handleResendNotification() {
      this.props.resendNotification();
    }

    render() {
        let { 
          tickets,
          member, 
          extraQuestions, 
          selectedTicket, 
          selectTicket, 
          getTicketPDF, 
          editOwnedTicket, 
          handleTicketChange, 
          refundTicket,
          summits,
          summit,
          page,
          lastPage, 
          loadingTickets, 
          loadingSummits, 
          errors} = this.props;

        if(tickets.length > 0) {
          return (
            tickets.length > 0 &&
            <div>
                <TicketList 
                  tickets={tickets}
                  member={member}
                  selectedTicket={selectedTicket}
                  selectTicket={selectTicket}
                  getTicketPDF={getTicketPDF}                  
                  editOwnedTicket={editOwnedTicket}
                  handleTicketChange={handleTicketChange}
                  refundTicket={refundTicket}
                  removeAttendee={this.handleTicketRemoveAttendee}
                  resendNotification={this.handleResendNotification}
                  currentPage={page}
                  lastPage={lastPage}
                  summits={summits}
                  summit={summit}
                  extraQuestions={extraQuestions}
                  loading={loadingTickets && loadingSummits}
                  loadingSummits={loadingSummits}
                  errors={errors}
                  pageChange={this.handlePageChange}
                  now={this.props.getNow()}
                />
            </div>
          );
        } else if (tickets.length === 0 && !loadingTickets) {
          return (
            <div className="mt-5 p-5">
              <div className="row">
                  <div className="col-sm-12 mt-5 text-center">
                      <i className="fa fa-5x fa-ticket"></i>
                      <h5>{T.translate("tickets.empty")}</h5>
                  </div>
              </div>
            </div>
          )
        } else {
          return <div></div>
        }
    }
}

const mapStateToProps = ({ loggedUserState, ticketState, summitState }) => ({
    member: loggedUserState.member,
    tickets: ticketState.memberTickets,
    page: ticketState.current_page,
    lastPage: ticketState.last_page,
    selectedTicket: ticketState.selectedTicket,
    loadingTickets: ticketState.loading,
    errors: ticketState.errors,
    summit: summitState.selectedSummit,
    summits: summitState.summits,
    loadingSummits: summitState.loading,
    extraQuestions: summitState.selectedSummit.order_extra_questions
})
  
export default connect (
    mapStateToProps,
    {
      getUserTickets,
      selectTicket,
      getTicketPDF,
      editOwnedTicket,
      handleTicketChange,
      refundTicket,
      removeAttendee,
      resendNotification,
      getNow,
      handleResetOrder,
    }
)(TicketsListPage);
  
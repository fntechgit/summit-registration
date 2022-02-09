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
import { Pagination } from 'react-bootstrap';
import Alert from 'react-bootstrap/lib/Alert';
import T from "i18n-react/dist/i18n-react";
import { CSSTransition } from "react-transition-group";
import TicketPopup from "../components/ticket-popup";

import { daysBetweenDates, getFormatedDate } from '../utils/helpers';
import TicketModel from "../models/ticket";

class TicketList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
          showPopup: false,
          showSave:false,
          showRefundSuccess:false,
        };  

        this.togglePopup = this.togglePopup.bind(this);
        this.handleTicketStatus = this.handleTicketStatus.bind(this);
        this.handleTicketDownload = this.handleTicketDownload.bind(this);
        this.handleTicketUpdate = this.handleTicketUpdate.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleTicketLocation = this.handleTicketLocation.bind(this);
        this.handleTicketName = this.handleTicketName.bind(this);        
        this.handleEventName = this.handleEventName.bind(this);
        this.handleTicketDate = this.handleTicketDate.bind(this);        
        this.handleReassignDate = this.handleReassignDate.bind(this);
        this.handleTicketCancel = this.handleTicketCancel.bind(this);
        this.handlePastSummit = this.handlePastSummit.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.toggleSaveMessage = this.toggleSaveMessage.bind(this);
        this.toggleRefundSuccessMessage = this.toggleRefundSuccessMessage.bind(this);
    }

    togglePopup(ticket) {
      ticket ? this.props.selectTicket(ticket, true) : this.props.selectTicket({});
  
      this.setState((prevState, props) => {
        return {
          showPopup: !prevState.showPopup
        }
      })
    }

    toggleSaveMessage(){
        this.setState({...this.state, showSave: !this.state.showSave });
    }

    toggleRefundSuccessMessage(){
        this.setState({...this.state, showRefundSuccess: !this.state.showRefundSuccess });
    }

    handleTicketStatus(ticket){
        let {summits} = this.props;
        let summit = summits.find(s => s.id === ticket.owner.summit_id);
        return new TicketModel(ticket, summit, this.props.now).getStatus();
    }

    handleTicketDownload() {    
      this.props.getTicketPDF();
    }

    handlePageChange(page) {      
      this.props.pageChange(page);
    }

    handleTicketUpdate(ticket){

      let { attendee_first_name, attendee_last_name, attendee_company, attendee_email, extra_questions, disclaimer_accepted, owner } = ticket;
      let { member } = this.props;
      
      if(owner.email !== attendee_email) {
          this.props.removeAttendee(ticket).then(() => {
              window.setTimeout(() => this.toggleSaveMessage(), 500);
              window.setTimeout(() => this.toggleSaveMessage(), 5000);
          });
          return;
      }

      this.props.editOwnedTicket
      (
          attendee_email,
          attendee_first_name,
          attendee_last_name,
          attendee_company,
          disclaimer_accepted,
          extra_questions
      ).then(() => {
          window.setTimeout(() => this.toggleSaveMessage(), 500);
          window.setTimeout(() => this.toggleSaveMessage(), 2000);
      });

    }

    handleTicketLocation(ticket) {
      let {summits} = this.props;
      let summit = summits.find(s => s.id === ticket.owner.summit_id);
      let location = summit.locations.filter(l => l.class_name === "SummitVenue").find(l => l.is_main === true);
      if(location) {
        return `${location.city}, ${location.country}`;
      } else {
        return null;
      }
    }

    handleTicketName(ticket) {
      let {summits} = this.props;
      let summit = summits.find(s => s.id === ticket.owner.summit_id);
      let ticketName = summit.ticket_types.find(t => t.id === ticket.ticket_type_id).name;      
      return ticketName;      
    }

    handleTicketDate(ticket) {
      let {summits} = this.props;
      let summit = summits.find(s => s.id === ticket.owner.summit_id);
      let dateRange = daysBetweenDates(summit.start_date, summit.end_date, summit.time_zone_id);
      if (dateRange.length > 1) {     
        let startDate = getFormatedDate(dateRange[0], summit.time_zone_id);
        let endDate = getFormatedDate(dateRange[dateRange.length-1], summit.time_zone_id);
        let startMonth = startDate.split(' ')[0];
        let endMonth = endDate.split(' ')[0];
        if(startMonth === endMonth) endDate = endDate.substr(endDate.indexOf(" ") + 1);
        let startYear = startDate.substring(startDate.length, startDate.length-4);
        let endYear = endDate.substring(endDate.length, endDate.length-4);
        if (startYear === endYear) startDate = startDate.substring(0, startDate.length-6);
        endDate = endDate.substring(0, endDate.length-6) + ', ' + endDate.substring(endDate.length-4);
        let summitDate = `${startDate} - ${endDate}`;
        return summitDate;
      } else {
        let summitDate = getFormatedDate(summit.start_date, summit.time_zone_id);
        return summitDate;
      }          
    }

    handleReassignDate(ticket) {
      let {summits} = this.props;
      let summit = summits.find(s => s.id === ticket.owner.summit_id);
      let reassign_date = summit?.reassign_ticket_till_date && summit.reassign_ticket_till_date < summit.end_date ? summit.reassign_ticket_till_date : summit.end_date
      return reassign_date;
    }

    handleEventName(ticket) {
      let {summits} = this.props;
      let event = summits.find(s => s.id === ticket.owner.summit_id).name;
      return event;
    }

    handlePastSummit(ticket) {
      let {summits, now} = this.props;
      let summit = summits.find(s => s.id === ticket.order.summit_id);
      let reassign_date = summit?.reassign_ticket_till_date && summit.reassign_ticket_till_date < summit.end_date ? summit.reassign_ticket_till_date : summit.end_date;      
      return now > reassign_date ? true : false;
    }

    handleTicketCancel() {
      let {selectedTicket, refundTicket} = this.props;      
      refundTicket(selectedTicket).then( _ =>{
          window.setTimeout(() => this.toggleRefundSuccessMessage(), 500);
          window.setTimeout(() => this.toggleRefundSuccessMessage(), 5000);
      }).catch(_=> {});
    }
  
    handleChange(ev) {
      let ticket = cloneDeep(this.props.ticket);
      let errors = cloneDeep(this.props.errors);
      let {value, id} = ev.target;
  
      delete(errors[id]);
      ticket[id] = value;
  
      this.props.handleTicketChange(ticket, errors);
    }


    render() {
      let { tickets, selectedTicket, extraQuestions, loading, errors, summits, lastPage, currentPage, member, summit,
          loadingSummits, now } = this.props;
      let { showPopup } = this.state;

      if(loading) {
        return (
          <div></div>
        )
      } else if (tickets.length > 0 && !loading) {
        return (

          <div className="tickets-list">
            <CSSTransition
                unmountOnExit
                in={this.state.showSave}
                timeout={2000}
                classNames="fade-in-out">
                <React.Fragment>                    
                    <Alert bsStyle="success col-sm-8 col-sm-offset-2">
                        {T.translate("tickets.save_message")}
                    </Alert>
                </React.Fragment>
            </CSSTransition>
              <CSSTransition
                  unmountOnExit
                  in={this.state.showRefundSuccess}
                  timeout={2000}
                  classNames="fade-in-out">
                  <React.Fragment>
                      <br />
                      <Alert bsStyle="success">
                          {T.translate("tickets.refund_request_success_message")}
                      </Alert>
                  </React.Fragment>
              </CSSTransition>
            <div className="list-desktop">
              {tickets.map((t) => {
                return (
                  <div className={`ticket ${this.handleTicketStatus(t).text === "UNASSIGNED" ? now > this.handleReassignDate(t) ? 'disabled' : this.handleTicketStatus(t).orderClass : this.handleTicketStatus(t).orderClass} p-2 col-sm-8 col-sm-offset-2`} key={t.id}
                    onClick={() => {t.status === "Cancelled" || !t.is_active  || (this.handleTicketStatus(t).text === "UNASSIGNED" && now > this.handleReassignDate(t)) ? null: this.togglePopup(t)}}>
                      <div className="col-sm-1">
                          <i className={`fa fa-2x ${this.handleTicketStatus(t).icon} ${this.handleTicketStatus(t).class}`}></i>                             
                      </div>
                      <div className="col-sm-5">
                          <h4>{this.handleEventName(t)}</h4>  <h5>{this.handleTicketDate(t)}</h5>
                          <p className={`status ${this.handleTicketStatus(t).class}`}>{this.handleTicketStatus(t).text}</p>
                      </div>                      
                      <div className="col-sm-6">
                         <h4>{this.handleTicketName(t)}</h4> 
                         <h5 style={{fontSize: 10}}>{ t.number }</h5>
                         <p>Purchased By {t.order.owner_first_name} {t.order.owner_last_name} ({t.order.owner_email})</p>
                      </div>
                      {(t.status === "Cancelled" || !t.is_active ) ?
                        <div className="arrow col-sm-1"></div>
                        :
                        <div className="arrow col-sm-1">
                            <i className="fa fa-angle-right"></i>
                        </div>
                      }
                  </div>
                )
              })}              
            </div>
            <div className="list-mobile">
              {tickets.map((t) => {
                return (
                  <div className={`ticket ${this.handleTicketStatus(t).text === "UNASSIGNED" ? now > this.handleReassignDate(t) ? 'disabled' : this.handleTicketStatus(t).orderClass : this.handleTicketStatus(t).orderClass} p-2 col-sm-8 col-sm-offset-2`} key={t.id}
                  onClick={() => {t.status === "Cancelled" || !t.is_active || (this.handleTicketStatus(t).text === "UNASSIGNED" && now > this.handleReassignDate(t)) ? null: this.togglePopup(t)}}>
                      <div className="col-sm-1">
                          <i className={`fa fa-2x ${this.handleTicketStatus(t).icon} ${this.handleTicketStatus(t).class}`}></i>                             
                      </div>
                      <div className="col-sm-9">
                          <h4>{this.handleEventName(t)}</h4>
                          <p>{this.handleTicketDate(t)} <br/> {this.handleTicketLocation(t)} </p>
                          <p className={`status ${this.handleTicketStatus(t).class}`}>{this.handleTicketStatus(t).text}</p>
                          <p className="ticket-number">{ t.number }</p>
                      </div>                                            
                      {(t.status === "Cancelled" || !t.is_active) ?
                        <div className="arrow col-sm-2"></div>
                        :
                        <div className="arrow col-sm-2">
                            <i className="fa fa-angle-right"></i>
                        </div>
                      }
                  </div>
                )
              })}              
            </div>
            <div className="footer-pagination">
                <Pagination
                  bsSize="medium"
                  prev
                  next
                  first
                  last
                  ellipsis
                  boundaryLinks
                  maxButtons={10}
                  items={lastPage}
                  activePage={currentPage}
                  onSelect={this.handlePageChange}
                />
            </div>
            {showPopup ?  
                <TicketPopup  
                  ticket={selectedTicket}
                  order={selectedTicket.order}
                  member={member}
                  status={this.handleTicketStatus(selectedTicket)}
                  onChange={this.handleChange}
                  orderOwned={selectedTicket.order.owner_id === member.id}
                  loading={loadingSummits}
                  downloadTicket={this.handleTicketDownload}
                  closePopup={this.togglePopup.bind(this)}
                  updateTicket={this.handleTicketUpdate}
                  cancelTicket={this.handleTicketCancel}
                  resendNotification={this.props.resendNotification}
                  removeAttendee={this.props.removeAttendee}  
                  fromTicketList={true}
                  summit={summits.find(s => s.id === selectedTicket.owner.summit_id)}
                  extraQuestions={extraQuestions}
                  errors={errors}
                  now={now}
                />  
              : null  
              }
          </div>
        )        
      }           
    }
}

export default TicketList;

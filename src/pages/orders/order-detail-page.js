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
import Alert from 'react-bootstrap/lib/Alert';
import T from "i18n-react/dist/i18n-react";
import cloneDeep from "lodash.clonedeep";
import OrderSummary from "../../components/order-summary";
import TicketPopup from "../../components/ticket-popup";
import TicketOptions from "../../components/ticket-options";
import ConfirmPopup from '../../components/confirm-popup';
import { CSSTransition } from "react-transition-group";
import { selectTicket,
  getTicketPDF,
  assignAttendee,
  editOwnedTicket,
  handleTicketChange,
  refundTicket,
  removeAttendee,
  resendNotification } from '../../actions/ticket-actions';
import { cancelOrder } from '../../actions/order-actions';

import { daysBetweenDates, getFormatedDate } from '../../utils/helpers';

import '../../styles/order-detail-page.less';

import {getNow} from '../../actions/timer-actions';

class OrderDetailPage extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      showPopup: false,
      showSave:false,
      showRefundSuccess:false,
      cancelOrderPopup: false,
    };  

    this.togglePopup = this.togglePopup.bind(this);
    this.handleTicketDownload = this.handleTicketDownload.bind(this);
    this.handleOrderCancel = this.handleOrderCancel.bind(this);
    this.handleTicketStatus = this.handleTicketStatus.bind(this);
    this.handleTicketUpdate = this.handleTicketUpdate.bind(this);
    this.handleSummitLocation = this.handleSummitLocation.bind(this);
    this.handleTicketDate = this.handleTicketDate.bind(this);
    this.handleTicketRemoveAttendee = this.handleTicketRemoveAttendee.bind(this);
    this.handleResendNotification = this.handleResendNotification.bind(this);
    this.handleTicketCancel = this.handleTicketCancel.bind(this);    
    this.handleTicketRole = this.handleTicketRole.bind(this);
    this.handleReassignDate = this.handleReassignDate.bind(this);
    this.handlePastSummit = this.handlePastSummit.bind(this);
    this.toggleSaveMessage = this.toggleSaveMessage.bind(this);
    this.isInactive = this.isInactive.bind(this);
    this.toggleRefundSuccessMessage = this.toggleRefundSuccessMessage.bind(this);
  }

  togglePopup(ticket) {
    ticket ? this.props.selectTicket(ticket) : this.props.selectTicket({});

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

    const status = [
      { 
        text: 'UNASSIGNED',
        icon: 'fa-exclamation-circle',
        orderClass: 'unset',
        class: 'ticket-unset'
      },
      { 
        text: 'REQUIRED DETAILS NEEDED',
        icon: 'fa-exclamation-circle',
        orderClass: 'warning',
        class: 'ticket-warning'
      },
      { 
        text: 'READY TO USE',
        icon: 'fa-check-circle',
        orderClass: 'complete',
        class: 'ticket-complete'
      },
      { 
        text: 'CANCELLED',        
        orderClass: 'cancel',
        class: 'ticket-cancel'
      },
      { 
        text: '',
        icon: 'fa-fw',
        orderClass: 'past',
        class: ''
      },
    ];
    if(!ticket.is_active || ticket.status === "Cancelled") {
      return status[3];
    } else if(ticket.owner_id === 0) {
      return status[0];
    } else if(this.handlePastSummit()) {
      return status[4];
    } else if (!ticket.owner.first_name || !ticket.owner.last_name) {
      return status[1];
    } else if (ticket.owner && ticket.owner.status === "Complete") {
      return status[2];
    } else if (ticket.owner && ticket.owner.status === "Incomplete") {
      return status[1];
    }
  }

  handleTicketDownload() {    
    this.props.getTicketPDF();
  }

  handleOrderCancel(ev){
    let {order} = this.props;
    this.setState((prevState, props) => {
      return {
        cancelOrderPopup: !prevState.cancelOrderPopup
      }
    })
    if(ev === true) {      
      this.props.cancelOrder(order).then( _ =>{
        window.setTimeout(() => this.toggleRefundSuccessMessage(), 500);
        window.setTimeout(() => this.toggleRefundSuccessMessage(), 5000);
      }).catch(_=> {});
    }
  }

  handleTicketCancel(ticket) {
    this.props.refundTicket(ticket).then( _ =>{
      window.setTimeout(() => this.toggleRefundSuccessMessage(), 500);
      window.setTimeout(() => this.toggleRefundSuccessMessage(), 5000);
    }).catch(_=> {});
  }

  handleTicketUpdate(tempTicket) {    
    let { attendee_first_name, attendee_last_name, attendee_email, attendee_company, extra_questions, disclaimer_accepted, owner } = tempTicket;    
    let { member } = this.props;

    if (owner && owner.email) {
      if(owner.email !== attendee_email) {
        this.props.removeAttendee(tempTicket).then(() => {
          window.setTimeout(() => this.toggleSaveMessage(), 500);
          window.setTimeout(() => this.toggleSaveMessage(), 5000);
        });
      } else {
        let updateOrder = true;
        this.props.editOwnedTicket(attendee_email, attendee_first_name, attendee_last_name, attendee_company, disclaimer_accepted, extra_questions, updateOrder).then(() => {
          window.setTimeout(() => this.toggleSaveMessage(), 500);
          window.setTimeout(() => this.toggleSaveMessage(), 5000);
        });
      }
    } else {
      this.props.assignAttendee(attendee_email, attendee_first_name, attendee_last_name, attendee_company, disclaimer_accepted, extra_questions).then(() => {
        window.setTimeout(() => this.toggleSaveMessage(), 500);
        window.setTimeout(() => this.toggleSaveMessage(), 5000);
      });
    }
  }   

  handleTicketRemoveAttendee(ticket) {
    this.props.removeAttendee(ticket);
  }

  handleResendNotification() {
    this.props.resendNotification();
  }

  handlePastSummit() {
    let {summit} = this.props;    
    let reassign_date = summit?.reassign_ticket_till_date && summit.reassign_ticket_till_date < summit.end_date ? summit.reassign_ticket_till_date : summit.end_date;
    return this.props.getNow() > reassign_date ? true : false;
  }

  handleChange(ev) {
    let ticket = cloneDeep(this.props.ticket);
    let errors = cloneDeep(this.props.errors);
    let {value, id} = ev.target;

    delete(errors[id]);
    ticket[id] = value;

    this.props.handleTicketChange(ticket, errors);
  }

  handleTicketDate() {
    let {summit} = this.props;
    let dateRange = daysBetweenDates(summit.start_date, summit.end_date, summit.time_zone_id);
    
    if(dateRange.length > 1) {
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

  handleTicketRole(ticket) {
    let roles = [];
    ticket.badge.features.map(f => {
      roles.push(f.name);
    });
    if(roles.length) {
      return roles.join(', ');
    } else {
      return "Attendee";
    }
  }

  handleReassignDate() {
    let {summit} = this.props;
    let reassign_date = summit.reassign_ticket_till_date && summit.reassign_ticket_till_date < summit.end_date ? summit.reassign_ticket_till_date : summit.end_date;
    return reassign_date;
  }

  handleSummitLocation() {
    let {summit} = this.props;
    let location = summit.locations.filter(l => l.class_name === "SummitVenue").find(l => l.is_main === true);    
    if(location) {
      return `${location.city}, ${location.country}`;
    } else {
      return null;
    }
  }

  isInactive(t){
    return t.is_active == false || t.status === "Cancelled";
  }

  render() {
      let {order, summit, ticket, errors, extraQuestions, member, orderLoading, summitLoading} = this.props;
      let { showPopup, showSave, cancelOrderPopup } = this.state;
      let now = this.props.getNow();

      let loading = summitLoading || orderLoading;

      if(!loading) {
      return (
          <div className="order-detail">
              <OrderSummary order={order} summit={summit} type={'mobile'} />
              <div className="row" style={showPopup? {overflow: 'hidden'} : {overflow: 'auto'}}>
                  <div className="col-md-8">
                    <div className="order-detail__title">
                      <h4><b>{summit.name}</b></h4>
                      {this.handleTicketDate()} <br /> {this.handleSummitLocation()}
                    </div>
                    <CSSTransition
                        unmountOnExit
                        in={this.state.showSave}
                        timeout={2000}
                        classNames="fade-in-out">
                        <React.Fragment>
                            <br />
                            <Alert bsStyle="success">
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
                    <div className="ticket-list">
                      {summit.ticket_types.map((s, index) => {                        
                        return (
                          <React.Fragment key={s.id}>
                            {order.tickets.some(t => t.ticket_type_id === s.id) &&
                            <div className="ticket-type">
                              {s.name} Tickets ({order.tickets.filter(t => t.ticket_type_id === s.id).length})
                            </div>
                            }                            
                            {order.tickets.map(t => {
                              return (
                                s.id === t.ticket_type_id ?
                                <React.Fragment key={t.id}>
                                <div className="ticket-list-desktop">
                                    <div className="row" key={t.id} onClick={() => { this.isInactive(t) || (this.handleTicketStatus(t).text === "UNASSIGNED" && now > this.handleReassignDate(t)) ? null: this.togglePopup(t)}}>
                                      <div className={`ticket ${this.handleTicketStatus(t).text === "UNASSIGNED" ? now > this.handleReassignDate(t) ? 'disabled' : this.handleTicketStatus(t).orderClass : this.handleTicketStatus(t).orderClass} p-2 col-sm-12 col-sm-offset-1`}>
                                          <div className="col-sm-1">
                                            <i className={`fa fa-2x ${this.handleTicketStatus(t).icon} ${this.handleTicketStatus(t).class}`}></i>                             
                                          </div>
                                          <div className="col-sm-5">
                                              <h4>{this.handleTicketRole(t)}</h4>
                                              {t.discount > 0 && `${(t.discount * 100) / t.raw_cost}% discount`}
                                              <p className={`status ${this.handleTicketStatus(t).class}`}>{this.handleTicketStatus(t).text}</p>
                                              <h5><br/>{ t.number }</h5>
                                          </div>
                                          <div className="col-sm-5">
                                            <h5>{t.owner ? t.owner.email : ''}</h5>
                                          </div>
                                          {(this.isInactive(t)) ?
                                            <div className="col-sm-1"></div>
                                            :
                                            <div className="col-sm-1">
                                              <h4>&#10095;</h4>
                                            </div>
                                          }
                                      </div>
                                    </div> 
                                </div>
                                <div className="ticket-list-mobile">
                                    <div key={t.id} onClick={() => {this.isInactive(t) || (this.handleTicketStatus(t).text === "UNASSIGNED" && now > this.handleReassignDate(t)) ? null: this.togglePopup(t)}}>
                                      <div className={`ticket ${this.handleTicketStatus(t).text === "UNASSIGNED" ? now > this.handleReassignDate(t) ? 'disabled' : this.handleTicketStatus(t).orderClass : this.handleTicketStatus(t).orderClass} p-2`}>
                                          <div className="col-xs-1">
                                            <i className={`fa fa-2x ${this.handleTicketStatus(t).icon} ${this.handleTicketStatus(t).class}`}></i>                             
                                          </div>
                                          <div className="col-xs-10">                                              
                                              <h4>{this.handleTicketRole(t)}</h4>
                                              {t.discount > 0 && `${(t.discount * 100) / t.raw_cost}% discount` }
                                              {t.discount > 0 && <br />}
                                              {t.owner ? t.owner.email : ''}
                                              <p className={`status ${this.handleTicketStatus(t).class}`}>{this.handleTicketStatus(t).text}</p>
                                          </div>
                                          { this.isInactive(t) ?
                                            <div className="col-sm-1"></div>
                                            :
                                            <div className="col-sm-1">
                                              <h4>&#10095;</h4>
                                            </div>
                                          }
                                      </div>
                                    </div> 
                                </div>
                                </React.Fragment>
                                : null  
                              )
                            })                           
                            }                          
                          </React.Fragment>                   
                        )
                      })}                                                
                    </div>                      
                  </div>
                  <div className="col-md-4">
                      <OrderSummary order={order} summit={summit} type={'desktop'} now={this.props.getNow()} />
                      <TicketOptions now={this.props.getNow()}
                                     summit={summit}
                                     order={order}
                                     cancelOrder={this.handleOrderCancel} />
                  </div>
              </div>
              {showPopup ?  
                <TicketPopup  
                  ticket={ticket}
                  order={order}
                  member={member}
                  orderOwned={true}
                  status={this.handleTicketStatus(ticket)}
                  onChange={this.handleChange}
                  extraQuestions={extraQuestions}
                  loading={loading}
                  downloadTicket={this.handleTicketDownload}
                  closePopup={this.togglePopup.bind(this)}
                  cancelTicket={this.handleTicketCancel}
                  updateTicket={this.handleTicketUpdate}
                  resendNotification={this.handleResendNotification}
                  removeAttendee={this.handleTicketRemoveAttendee}
                  fromOrderList={true}
                  summit={summit}
                  errors={errors}
                  now={this.props.getNow()}
                />  
              : null  
              }
              {cancelOrderPopup ?  
                <ConfirmPopup
                  popupCase={'cancel-order'}
                  closePopup={this.handleOrderCancel.bind(this)}                  
                />  
              : null  
              }
          </div>
      );
    } else {
      return null;
    }
  }
}

const mapStateToProps = ({ loggedUserState, orderState, summitState, ticketState }) => ({
    member: loggedUserState.member,
    order: orderState.selectedOrder,
    orderLoading: orderState.loading,
    summit: summitState.selectedSummit,
    summitLoading: summitState.loading,
    extraQuestions: summitState.selectedSummit.order_extra_questions,
    ticket: ticketState.selectedTicket,
    errors: ticketState.errors
})

export default connect(
    mapStateToProps,
    {
      selectTicket,
      getTicketPDF,
      cancelOrder,
      assignAttendee,
      editOwnedTicket,
      handleTicketChange,
      refundTicket,
      removeAttendee,
      resendNotification,
      getNow,
    }
)(OrderDetailPage);
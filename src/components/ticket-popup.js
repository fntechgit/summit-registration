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
import cloneDeep from "lodash.clonedeep";
import { Tabs, TabList, Tab, TabPanel } from 'react-tabs';
import { Input } from 'openstack-uicore-foundation/lib/components'
import QuestionsSet from 'openstack-uicore-foundation/lib/utils/questions-set'
import validator from "validator"
import TicketModel from '../models/ticket';

import TicketAssignForm from '../components/ticket-assign-form';
import ConfirmPopup from '../components/confirm-popup';

import { getFormatedDate } from '../utils/helpers';

import '../styles/popup-form.less';

class TicketPopup extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
          showPopup: false,
          popupCase: '',
          cleanFields: false,          
          tempTicket: {
            id: 0,
            attendee_email: '',
            attendee_first_name: '',
            attendee_last_name: '',
            attendee_company: '',
            reassign_email: '',
            disclaimer_accepted: null,
            extra_questions: [],
            errors: {
                reassign_email: '',
                attendee_email: ''
            }
          }
        };

        this.popUpPanelRef = React.createRef();
  
        this.togglePopup = this.togglePopup.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleTicketCancel = this.handleTicketCancel.bind(this);
        this.handleTicketReassign = this.handleTicketReassign.bind(this);
        this.handleTicketSave = this.handleTicketSave.bind(this);
        this.handleChangeEmail = this.handleChangeEmail.bind(this);        
        this.handleFormatReassignDate = this.handleFormatReassignDate.bind(this);
        this.handleTicketRole = this.handleTicketRole.bind(this);
        this.handleTicketName = this.handleTicketName.bind(this);
        this.handlePopupSave = this.handlePopupSave.bind(this);
        this.handleNewExtraQuestions = this.handleNewExtraQuestions.bind(this);
        this.triggerFormSubmit = this.triggerFormSubmit.bind(this);

        this.formRef = React.createRef();
    }

    componentWillMount() {      
      document.body.style.overflow = "hidden";
      let {owner} = this.props.ticket;
      if(owner) {
        let {email, first_name, last_name, company, disclaimer_accepted_date, extra_questions} = owner;
        let formattedQuestions = [];
        extra_questions.map(q => {
          let question = {question_id: q.question_id, value: q.value};
          formattedQuestions.push(question);
        })        
        this.setState({tempTicket: {
          id: this.props.ticket.id,
          attendee_email: email, 
          attendee_first_name: first_name, 
          attendee_last_name: last_name,
          attendee_company: company,
          disclaimer_accepted: disclaimer_accepted_date ? true : false, 
          extra_questions: formattedQuestions,
          reassign_email: '',
          errors: {
            reassign_email: '',
            attendee_email: ''
          }
        }});        
      }
    }

    componentWillUnmount() {      
      document.body.style.overflow = "visible";
    }
  
    togglePopup(confirm, popupCase) {
      this.setState((prevState, props) => {
        return {
          showPopup: !prevState.showPopup
        }
      })
      if(confirm) {
        let ticket = cloneDeep(this.props.ticket);        
        switch(popupCase) {
          case 'cancel':
              this.props.cancelTicket(ticket);
              this.props.closePopup();
              break;
          case 'assign':              
              ticket = {...ticket, ...this.state.tempTicket};
              this.props.updateTicket(ticket);
              this.props.closePopup();
              break;
          case 'reassign':
                ticket = {...ticket, ...this.state.tempTicket};                
                this.props.removeAttendee(ticket);
                this.props.closePopup();
                break;
          case 'notification':
              break;
          default:
            return null;
        }              
      }
    }

    handleNewExtraQuestions (answersForm, ticket) {
      const {summit} = this.props;
      const qs = new QuestionsSet(summit.order_extra_questions);
      let newAnswers = [];
      Object.keys(answersForm).forEach(name => {
          let question = qs.getQuestionByName(name);
          if(!question){
              console.log(`missing question for answer ${name}.`);
              return;
          }
          if(answersForm[name] || answersForm[name].length > 0) {
            newAnswers.push({ id: question.id, value: answersForm[name]});
          }
      });
      const newTicket = {...ticket, extra_questions: newAnswers}
      this.handleTicketSave(newTicket);
    }

    triggerFormSubmit() {
      this.formRef.current.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }))
    }

    handleTicketSave(){
      let ticket = cloneDeep(this.props.ticket);
      ticket = {...ticket, ...this.state.tempTicket};
      this.props.updateTicket(ticket);
      this.props.closePopup();
    }

    hasErrors(field) {
      let {errors} = this.state.tempTicket;      
      if(errors && field in errors) {
          return errors[field];
      }

      return '';
    }

    handleTicketAssign(self) {
      if(self){        
        const { email, first_name, last_name } = this.props.member;
        this.props.updateTicket({attendee_email: email, attendee_first_name: first_name, attendee_last_name: last_name});
        this.props.closePopup();
      } else {
        let { tempTicket } = this.state;
        tempTicket = {...tempTicket, attendee_email: tempTicket.reassign_email};
        this.props.updateTicket(tempTicket);
        this.props.closePopup();
      }           
    }

    handleTicketReassign(self) {
      let {cleanFields} = this.state;      
      if(self){
        const {email} = this.props.member;
        if(cleanFields) {
          this.setState((prevState) => {
            return {
              tempTicket: {
                id: prevState.tempTicket.id,
                attendee_first_name: prevState.tempTicket.attendee_first_name,
                attendee_last_name: prevState.tempTicket.last_name,
                attendee_company: prevState.tempTicket.attendee_company,
                extra_questions: prevState.tempTicket.extra_questions,
                attendee_email: email,
                errors: prevState.tempTicket.errors
              }
            }
          }, () => this.handleConfirmPopup('reassign'));
        } else {
          this.setState((prevState) => {
            return {
              tempTicket: {
                id: prevState.tempTicket.id,
                attendee_first_name: prevState.tempTicket.attendee_first_name,
                attendee_last_name: prevState.tempTicket.attendee_last_name,
                attendee_company: prevState.tempTicket.attendee_company,
                extra_questions: prevState.tempTicket.extra_questions,
                attendee_email: email,
                errors: prevState.tempTicket.errors
              }
            }
          }, () => this.handleConfirmPopup('reassign'));
        }
      } else {
        this.setState((prevState) => {          
          return {
            tempTicket: {
              id: prevState.tempTicket.id,
              attendee_email: prevState.tempTicket.attendee_email,
              attendee_first_name: prevState.tempTicket.attendee_first_name,
              attendee_last_name: prevState.tempTicket.last_name,
              attendee_company: prevState.tempTicket.company,
              extra_questions: prevState.tempTicket.extra_questions,
              reassign_email: prevState.tempTicket.reassign_email,
              errors: prevState.tempTicket.errors
            }
          }
        }, () => this.handleConfirmPopup('reassign'));
      }
      
    }

    handleTicketCancel() {
      this.handleConfirmPopup('cancel')      
    }

    handleConfirmPopup(popup) {
      this.setState((prevState) => {
        return {          
          ...prevState,
          popupCase: popup
        }
      }, () => this.togglePopup(null, popup));
    }

    handlePopupSave() {

      let {tempTicket: {disclaimer_accepted, attendee_first_name, attendee_last_name, attendee_company, attendee_email, extra_questions, errors}} = this.state;
      let {summit:{registration_disclaimer_mandatory}, member} = this.props;


      let saveEnabled = errors && errors.attendee_email === '' && attendee_first_name && attendee_last_name && attendee_company && errors.constructor === Object;
      
      if (registration_disclaimer_mandatory && member.email === attendee_email) {
        saveEnabled = errors.attendee_email === '' && attendee_first_name && attendee_last_name && attendee_company && disclaimer_accepted;
      }

      // return the reverse value for disabled prop
      return !saveEnabled;
    }

    handleChange(ev) {
      
      let ticket = this.state.tempTicket;
      let {value, id} = ev.target;

      // remap ids
      id = id.toString();

      if(id.includes(`${ticket.id}_`)){
            id = id.split(`${ticket.id}_`)[1];
      }

      if (ev.target.type === 'checkbox') {
        value = ev.target.checked;        
      }

      if (ev.target.type ==='datetime') {
          value = value.valueOf() / 1000;
      }
      
      ticket[id] = value;
      
      !validator.isEmail(ticket.attendee_email) ?  ticket.errors.attendee_email = 'Please enter a valid Email.' : ticket.errors.attendee_email = '';      

      this.setState({tempTicket: ticket});
  
      //this.props.handleTicketChange(ticket, errors);
    }

    handleTicketName(ticket_type_id) {
      let {summit} = this.props;      
      let ticketName = summit.ticket_types.find(t => t.id === ticket_type_id).name;      
      return ticketName;
    }
    
    handleTicketRole(badge) {
      let roles = [];
      badge.features.map(f => {
        roles.push(f.name);
      });
      if(roles.length) {
        return roles.join(', ');
      } else {
        return "Attendee";
      }
    }  

    handleChangeEmail(ev) {
      let ticket = this.state.tempTicket;
      let {value, id} = ev.target;

      ticket[id] = value;

      !validator.isEmail(ticket.reassign_email) ? ticket.errors.reassign_email = 'Please enter a valid Email.' : ticket.errors.reassign_email = '';
      this.setState({tempTicket: ticket});
    }

    handleFormatReassignDate() {
      let {summit} = this.props;
      let reassign_date = summit?.reassign_ticket_till_date && summit.reassign_ticket_till_date < summit.end_date ? summit.reassign_ticket_till_date : summit.end_date;
      return getFormatedDate(reassign_date, summit.time_zone_id);
    }

    render() {

      let {extraQuestions, status, ticket: {owner, badge, ticket_type_id}, fromTicketList, fromOrderList, summit, orderOwned, member,
          loading, now, order} = this.props;

      let {showPopup, tempTicket, tempTicket: {reassign_email, errors}, popupCase, cleanFields} = this.state;
      let reassign_date = summit.reassign_ticket_till_date && summit.reassign_ticket_till_date < summit.end_date ? summit.reassign_ticket_till_date : summit.end_date;
      let {ticket} = this.props;

        console.log(`TicketPopup::render now ${now} reassign_date ${reassign_date} summit.end_date ${summit.end_date}`);

        return (!loading &&
        <div className='popup-bg'>
            <div className='popup-form'>
              <div className={`popup-header ${status.orderClass}`}>
                  <div className="popup-title">
                    <h4><b>{this.handleTicketName(ticket_type_id)}</b></h4>
                    <h5>{ ticket.number }</h5>
                    <p>Purchased By {order.owner_first_name} {order.owner_last_name} ({order.owner_email})</p>
                    <p>{this.handleTicketRole(badge)}</p>
                    <p className={`status ${status.class}`}>{status.text}</p>
                  </div>
                  <div className="popup-icons">
                    {!summit.is_virtual &&
                      <i onClick={() => this.props.downloadTicket()} className="fa fa-file-pdf-o"></i>
                    }
                    <i onClick={() => this.props.closePopup()} className="fa fa-times"></i>                    
                  </div>
              </div>
                <Tabs selectedTabClassName="popup-tabs--active" >
                    <TabList className="popup-tabs">
                        {status.text === 'UNASSIGNED' && <Tab>{T.translate("ticket_popup.tab_assign")}</Tab>}
                        <Tab>{T.translate("ticket_popup.tab_edit")}</Tab>
                        {status.text !== 'UNASSIGNED' && 
                          now < reassign_date &&
                          (!fromTicketList || (fromTicketList && orderOwned)) &&
                          <Tab>{T.translate("ticket_popup.tab_reassign")}</Tab>
                        }
                        {status.text !== 'UNASSIGNED' && 
                          (!fromTicketList && member.email !== owner.email && now < reassign_date) &&
                          <Tab>{T.translate("ticket_popup.tab_notify")}</Tab>
                        }
                        { orderOwned && summit.start_date > now && ticket.final_amount > 0 && ticket.final_amount > ticket.refunded_amount &&
                        <Tab>{T.translate("ticket_popup.tab_refund")}</Tab>
                        }
                    </TabList>
                    {status.text === 'UNASSIGNED' && 
                      <TabPanel ref={this.popUpPanelRef} className="popup-panel popup-panel--assign">
                        <div className="popup-scroll">
                          <div className="ticket-assign-form">
                            <p>{T.translate("ticket_popup.assign_text")} {this.handleFormatReassignDate()}</p>
                            <button className="btn btn-primary" onClick={() => this.handleTicketAssign(true)}>
                              {T.translate("ticket_popup.assign_me")}
                            </button>
                            <div className="popup-separator">
                              <div><hr/></div>
                              <span>{T.translate("ticket_popup.assign_or")}</span>
                              <div><hr/></div>
                            </div>
                            <p>{T.translate("ticket_popup.assign_want_text")}</p>
                            <span>{T.translate("ticket_popup.reassign_enter_email")}</span>
                            <Input
                                id="reassign_email"
                                className="form-control"
                                placeholder="Email"
                                error={this.hasErrors('reassign_email')}
                                onChange={this.handleChangeEmail}
                                value={reassign_email}
                            />
                            <button className="btn btn-primary" onClick={() => this.handleTicketAssign(false)}
                              disabled={reassign_email === '' || errors.reassign_email !== ''}>
                              {T.translate("ticket_popup.assign_someone")}
                            </button>
                          </div>
                        </div>
                      </TabPanel>
                    }
                    <TabPanel ref={this.popUpPanelRef} className="popup-panel popup-panel--edit">
                        <div className="popup-scroll">
                          <TicketAssignForm 
                            ticket={tempTicket} 
                            status={status.text} 
                            ownedTicket={fromTicketList || owner? owner.email === member.email : false }
                            fromTicketList={fromTicketList}
                            fromOrderList={fromOrderList}
                            orderOwned={orderOwned}
                            owner={owner}
                            extraQuestions={extraQuestions}
                            readOnly={now > reassign_date}
                            onChange={this.handleChange} 
                            summit={summit}
                            now={now}
                            errors={errors}
                            formRef={this.formRef}
                            handleNewExtraQuestions={this.handleNewExtraQuestions} />
                        </div>
                        <div className="popup-footer-save">
                          <button 
                              className="btn btn-primary" 
                              disabled={this.handlePopupSave()}
                              onClick={this.triggerFormSubmit}>
                                  {T.translate("ticket_popup.save_changes")}
                          </button>
                        </div>
                    </TabPanel>
                    {status.text !== 'UNASSIGNED' && now < reassign_date && (!fromTicketList || (fromTicketList && orderOwned)) &&
                      <TabPanel ref={this.popUpPanelRef} className="popup-panel popup-panel--reassign">
                        <div className="popup-scroll">
                          <div className="ticket-reassign-form">
                              {member.email !== owner.email &&
                              <React.Fragment>
                                <p>{T.translate("ticket_popup.reassign_text")} <br/> <b>{owner.email}</b></p>
                                <button className="btn btn-primary" onClick={() => this.handleTicketReassign(true)}>{T.translate("ticket_popup.reassign_me")}</button>  
                                <div className="popup-separator">
                                  <div><hr/></div>
                                  <span>{T.translate("ticket_popup.assign_or")}</span>
                                  <div><hr/></div>
                                </div>
                              </React.Fragment>
                              }
                              <p>{T.translate("ticket_popup.reassign_want_text")}</p>
                              <span>{T.translate("ticket_popup.reassign_enter_email")}</span>
                              <Input
                                  id="reassign_email"
                                  className="form-control"
                                  placeholder="Email"
                                  error={this.hasErrors('reassign_email')}
                                  onChange={this.handleChangeEmail}
                                  value={reassign_email}
                              />
                              <button className="btn btn-primary" onClick={() => this.handleTicketReassign(false)}                                
                                disabled={reassign_email === '' || errors.reassign_email !== ''}>
                                {T.translate("ticket_popup.reassign_someone")}
                              </button>
                          </div>
                        </div>
                      </TabPanel>
                    }
                    {status.text !== 'UNASSIGNED' && (!fromTicketList && member.email !== owner.email && now < reassign_date) &&
                      <TabPanel ref={this.popUpPanelRef} className="popup-panel popup-panel--notify">
                        <div className="popup-scroll">
                          <div className="ticket-notify-form">
                            <p>{T.translate("ticket_popup.notify_text_1")} {this.handleFormatReassignDate()}.</p>                                                
                            <p>{T.translate("ticket_popup.notify_text_2")} <b>{owner.email}</b></p>
                            <button className="btn btn-primary" onClick={this.props.resendNotification}>{T.translate("ticket_popup.notify_button")}</button>  
                          </div>
                        </div>
                      </TabPanel>
                    }
                    {orderOwned && summit.start_date > now && ticket.final_amount > 0 && ticket.final_amount > ticket.refunded_amount &&
                        <TabPanel ref={this.popUpPanelRef} className="popup-panel">
                            <div className="popup-scroll">
                                <div className="ticket-refund-button">
                                    <div className="row">
                                        <div className="col-md-12 text-center">
                                            <a onClick={this.handleTicketCancel} className="cancel">{T.translate("ticket_popup.cancel_ticket")}</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabPanel>
                    }
                </Tabs>
            </div>
            {showPopup ?  
              <ConfirmPopup
                popupCase={popupCase}
                closePopup={this.togglePopup.bind(this)}
                cleanFields={cleanFields}
              />  
            : null  
            }  
        </div>  
        );  
    }
}

export default TicketPopup;
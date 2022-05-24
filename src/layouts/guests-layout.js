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
import T from "i18n-react/dist/i18n-react";
import cloneDeep from "lodash.clonedeep";

import TicketAssignForm from '../components/ticket-assign-form';
import TicketOptions from '../components/ticket-options';

import QuestionsSet from 'openstack-uicore-foundation/lib/utils/questions-set'

import { getTicketByHash, getTicketPDFByHash,
  regenerateTicketHash, handleTicketChange, assignTicketByHash } from '../actions/ticket-actions'

import {getNow} from '../actions/timer-actions';

class GuestsLayout extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      ownerId: 0,
      tempTicket: {
        attendee_email: '',
        attendee_first_name: '',
        attendee_last_name: '',
        attendee_company: '',
        disclaimer_accepted: null,
        extra_questions: []
      }
    };

    this.handleTicketDownload = this.handleTicketDownload.bind(this);
    this.handleReassignDate = this.handleReassignDate.bind(this);
    this.handleTicketSave = this.handleTicketSave.bind(this);
    this.handleTicketUpdate = this.handleTicketUpdate.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleHashRegenerate = this.handleHashRegenerate.bind(this);
    this.handleNewExtraQuestions = this.handleNewExtraQuestions.bind(this);
    this.triggerFormSubmit = this.triggerFormSubmit.bind(this);

    this.formRef = React.createRef();
  }

    componentDidMount() {
      let { getTicketByHash } = this.props;

      let ticketHash = this.props.match.params.ticket_hash;

      if (ticketHash) {                    
          getTicketByHash(ticketHash);
      }      
    }

    componentDidUpdate() {
      this.handleTicketUpdate();
    }

    componentWillReceiveProps(newProps) {
      let oldHash = this.props.match.params.ticket_hash;
      let newHash = newProps.match.params.ticket_hash;

      if (newHash != oldHash) {
          if (newHash) {
              this.props.getTicketByHash(newHash);
              this.handleTicketUpdate();
          }
      }
    }

    handleNewExtraQuestions (answersForm, ticket) {
      const {summit:{order_extra_questions}} = this.props;
      const qs = new QuestionsSet(order_extra_questions);
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
      const newTicket = {...ticket, extra_questions: newAnswers}
      this.setState({...this.state, tempTicket: newTicket}, () => this.handleTicketSave());
    }
  
    triggerFormSubmit() {
      this.formRef.current.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }))
    }

    handleTicketUpdate() {
      let {attendee_email, attendee_first_name, attendee_last_name, attendee_company, disclaimer_accepted, extra_questions} = this.state.tempTicket;
      let {ownerId} = this.state;
      let {owner} = this.props.ticket;
      if((owner && owner.id !== ownerId) || (owner && !attendee_email && (!attendee_first_name || !attendee_last_name || !attendee_company || !disclaimer_accepted || !extra_questions))) {
        let {email, first_name, last_name, company, disclaimer_accepted_date, extra_questions} = owner;
        let formattedQuestions = [];
        extra_questions.map(q => {
          let question = {question_id: q.question_id, answer: q.value};
          formattedQuestions.push(question);
        })        
        this.setState(
          {
            tempTicket: {
            id: this.props.ticket.id,
            attendee_email: email, 
            attendee_first_name: first_name, 
            attendee_last_name: last_name, 
            attendee_company: company,
            disclaimer_accepted: disclaimer_accepted_date ? true : false,
            extra_questions: formattedQuestions
            },
            ownerId: owner.id
          });
      }
    }

    handleTicketDownload() {
      let ticketHash = this.props.match.params.ticket_hash;
      this.props.getTicketPDFByHash(ticketHash);
    }

    handleTicketSave(ticket){
      let ticketHash = this.props.match.params.ticket_hash;
      let { attendee_first_name, attendee_last_name, attendee_company, disclaimer_accepted, share_contact_info, extra_questions } = ticket;
      this.props.assignTicketByHash(attendee_first_name, attendee_last_name, attendee_company, disclaimer_accepted, share_contact_info, extra_questions, ticketHash);
    }
  
    handleChange(ev) {
      let ticket = cloneDeep(this.props.ticket);
      let errors = cloneDeep(this.props.errors);
      let {value, id} = ev.target;

      if(id.includes(`${ticket.id}_`)){
        id = id.split(`${ticket.id}_`)[1];
      }

      if (ev.target.type == 'checkbox') {
        value = ev.target.checked;        
      }
  
      delete(errors[id]);
      ticket[id] = value;

      this.setState((prevState) => {
        return { tempTicket: { ...prevState.tempTicket, [id]: value }}
      });        
    }

    handlePopupSave() {
      let {tempTicket: {disclaimer_accepted, attendee_first_name, attendee_last_name, attendee_company}} = this.state;
      let {summit:{registration_disclaimer_mandatory}} = this.props;

      let saveEnabled = attendee_first_name && attendee_last_name && attendee_company;
      
      if (registration_disclaimer_mandatory) {
        saveEnabled = attendee_first_name && attendee_last_name && attendee_company && disclaimer_accepted;
      }

      // return the reverse value for disabled prop
      return !saveEnabled;
    }

    handleHashRegenerate() {
      let ticketHash = this.props.match.params.ticket_hash;
      this.props.regenerateTicketHash(ticketHash);
    }

    handleReassignDate() {
      let {summit} = this.props;
      let reassign_date = summit?.reassign_ticket_till_date && summit.reassign_ticket_till_date < summit.end_date ? summit.reassign_ticket_till_date : summit.end_date;
      return reassign_date;
    }
    
    render() {
      let {ticket: {owner, invalidHash, completed}, ticket, errors, ticketLoading, summitLoading, summit, summit:{order_extra_questions}, summits} = this.props;
      let now = this.props.getNow();
      let {tempTicket} = this.state;
      
      let loading = ticketLoading && summitLoading;

      if(!loading && (!owner || !ticket) && !invalidHash) {        
        return (
          <div>
            Ticket not found
          </div>
        )
      } else if (!loading && invalidHash) {
        return (
          <div className="invalid-hash">
            <h3>
              {T.translate("guests.invalid_thanks")}
            </h3>
            <h4>
              {T.translate("guests.invalid_text_1")}
            </h4>
            <button className="btn btn-primary" onClick={() => this.handleHashRegenerate()}>{T.translate("guests.invalid_button")}</button>
            <br/><br/>            
            <p>
              {T.translate("guests.invalid_contact")} <br/><u><a href={`mailto:${summit.hasOwnProperty('support_email') && summit.support_email ? summit.support_email : window.SUPPORT_EMAIL}`}>{summit.hasOwnProperty('support_email') && summit.support_email ? summit.support_email : window.SUPPORT_EMAIL}</a></u>.
            </p>
          </div>
        )
      } else if (completed) {
        return (
          <div className="guest-complete">

            <h3>{T.translate("guests.completed_text_1")}</h3>

            <button className="btn btn-primary" onClick={() => this.handleTicketDownload()}>{T.translate("guests.completed_button")} {summit.name}</button>

            <p>{T.translate("guests.completed_text_2")}</p>

          </div>
        );
      }
      else {
        return (
          !loading &&
            <div>
              <div className="col-sm-8 guest-layout">                
                <TicketAssignForm
                    now={this.props.getNow()}
                    ticket={tempTicket}
                    owner={owner}
                    onChange={this.handleChange}
                    extraQuestions={order_extra_questions}
                    errors={errors}
                    guest={true}
                    summit={summit}
                    formRef={this.formRef}
                    handleNewExtraQuestions={this.handleNewExtraQuestions}/>
              </div>
              <div className="col-sm-4">
                <TicketOptions 
                  guest={true}
                  now={this.props.getNow()}
                  downloadTicket={this.handleTicketDownload} 
                  ticket={ticket}
                  summit={summit}
                  summits={summits}
                  loading={loading}
                />
              </div>
              {now < this.handleReassignDate() &&
                <div className="row submit-buttons-wrapper">
                    <div className="col-md-12">                      
                        <button className="btn btn-primary continue-btn" 
                          onClick={this.triggerFormSubmit}>
                            {T.translate("guests.save")}
                        </button>
                    </div>
                </div>
              }
            </div>
        )
      }
      
                          
    }
}

const mapStateToProps = ({ ticketState, summitState }) => ({
  ticketLoading: ticketState.loading,
  ticket: ticketState.selectedTicket,
  guestCompleted: ticketState.selectedTicket.completed,
  errors: ticketState.errors,
  summit: summitState.selectedSummit,
  summits: summitState.summits,
  summitLoading: summitState.loading
})

export default connect(
  mapStateToProps,
  {
    getTicketByHash,
    getTicketPDFByHash,
    regenerateTicketHash,
    handleTicketChange,
    assignTicketByHash,
    getNow
  }
)(GuestsLayout);
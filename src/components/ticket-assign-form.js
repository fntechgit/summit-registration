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
import T from "i18n-react/dist/i18n-react";
import {Input, RawHTML} from 'openstack-uicore-foundation/lib/components'
import QuestionAnswersInput from './questions-answer-input';

import {daysBetweenDates, getFormatedDate} from '../utils/helpers';

import '../styles/ticket-assign-form.less';

class TicketAssignForm extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            extra_questions: [],
            input_email: false,
            disclaimer_checked: null,
            firstNameEmpty: this.props.ticket.attendee_first_name === '' || !this.props.ticket.attendee_first_name,
            lastNameEmpty: this.props.ticket.attendee_last_name === ''  || !this.props.ticket.attendee_last_name,
            companyNameEmpty: this.props.ticket.attendee_company === '' || !this.props.ticket.attendee_company,
            emailNameEmpty: this.props.ticket.attendee_email === '' || !this.props.ticket.attendee_email,
        };

        this.handleFormatReassignDate = this.handleFormatReassignDate.bind(this);
        this._innerOnChange = this._innerOnChange.bind(this);
    }

    _innerOnChange(ev){
        this.props.onChange(ev, this.props.ticket);
    }

    componentDidMount() {
        let {extra_questions} = this.state;
        let {ticket} = this.props;

        if (!ticket.extra_questions && extra_questions.length === 0) {

            let {extraQuestions} = this.props;

            extraQuestions.map((q, index) => {
                extra_questions[index] = {question_id: q.id, answer: ''};
            })

            this.setState(() => ({
                extra_questions: extra_questions,
                disclaimer_checked: ticket.disclaimer_checked_date ? true : false
            }));
        }
    }

    hasErrors(field) {
        let {ticket: {errors}} = this.props;
        if (errors && field in errors) {
            return errors[field];
        }

        return '';
    }

    handleFormatReassignDate(days) {
        let {summit, now} = this.props;
        let reassign_date = summit.reassign_ticket_till_date && summit.reassign_ticket_till_date < summit.end_date ? summit.reassign_ticket_till_date : summit.end_date
        if (days) {
            return daysBetweenDates(now, reassign_date, summit.time_zone.name).length;
        }
        return getFormatedDate(reassign_date, summit.time_zone_id);
    }

    render() {

        let {guest, ownedTicket, owner, ticket, extraQuestions, status, summit, orderOwned, readOnly, now, shouldEditBasicInfo, fromTicketList} = this.props;
        let showCancel = true;
        if(!shouldEditBasicInfo) shouldEditBasicInfo = false;
        if(this.props.hasOwnProperty('showCancel'))
            showCancel = this.props.showCancel;
        let {extra_questions, input_email} = this.state;
        ticket.disclaimer_accepted = ticket.disclaimer_accepted == null ? false : ticket.disclaimer_accepted;
        const allow_extra_questions_edit = fromTicketList !== true || ownedTicket && summit.allow_update_attendee_extra_questions;
        return (
            <div className="ticket-assign-form">
                <div className="row popup-basic-info">
                    <div className="col-sm-6">{T.translate("ticket_popup.edit_basic_info")}</div>
                    <div className="col-sm-6">
                        {!readOnly && T.translate("ticket_popup.edit_required")}
                    </div>
                </div>
                <div className="row field-wrapper">
                    <div className="col-sm-4">
                        {T.translate("ticket_popup.edit_email")}
                        {!readOnly && T.translate("ticket_popup.edit_required_star")}
                    </div>
                    <div className="col-sm-8">
                        {status === 'UNASSIGNED' ?
                            <span>
                    {input_email ?
                        <React.Fragment>
                            <Input
                                id="attendee_email"
                                className="form-control"
                                error={this.hasErrors('attendee_email')}
                                onChange={this._innerOnChange}
                                value={ticket.attendee_email}
                            />
                        </React.Fragment>
                        :
                        <React.Fragment>
                            <button className="btn btn-primary" onClick={() => this.setState({input_email: true})}>
                                {T.translate("ticket_popup.assign_this")}
                            </button>
                            <p>{T.translate("ticket_popup.assign_expire")} {this.handleFormatReassignDate(true)} {T.translate("ticket_popup.assign_days")} ({this.handleFormatReassignDate(false)})</p>
                        </React.Fragment>
                    }
                    
                  </span>
                            :
                            <React.Fragment>
                                {input_email ?
                                    <Input
                                        id="attendee_email"
                                        className="form-control"
                                        error={this.hasErrors('attendee_email')}
                                        onChange={this._innerOnChange}
                                        value={ticket.attendee_email}
                                    />
                                    :
                                    <span>{ticket.attendee_email}
                                        {shouldEditBasicInfo && <span
                                            onClick={() => this.setState({input_email: true})}> | <u>Change</u></span>}
                        </span>
                                }
                            </React.Fragment>
                        }
                    </div>
                </div>
                <div className="field-wrapper-mobile">
                    <div>{T.translate("ticket_popup.edit_email")}{!readOnly && T.translate("ticket_popup.edit_required_star")}</div>
                    <div>
                        {status === 'UNASSIGNED' ?
                            <span>
                    {input_email ?
                        <React.Fragment>
                            <Input
                                id="attendee_email"
                                className="form-control"
                                error={this.hasErrors('attendee_email')}
                                onChange={this._innerOnChange}
                                value={ticket.attendee_email}
                            />
                        </React.Fragment>
                        :
                        <React.Fragment>
                            <button className="btn btn-primary" onClick={() => this.setState({input_email: true})}>
                                {T.translate("ticket_popup.assign_this")}
                            </button>
                            <p>{T.translate("ticket_popup.assign_expire")} {this.handleFormatReassignDate(true)} {T.translate("ticket_popup.assign_days")} ({this.handleFormatReassignDate(false)})</p>
                        </React.Fragment>
                    }
                    
                  </span>
                            :
                            <React.Fragment>
                                {input_email?
                                    <Input
                                        id="attendee_email"
                                        className="form-control"
                                        error={this.hasErrors('attendee_email')}
                                        onChange={this._innerOnChange}
                                        value={ticket.attendee_email}
                                    />
                                    :
                                    <span>{ticket.attendee_email}
                                        {shouldEditBasicInfo && !guest && !readOnly && orderOwned && <span
                                            onClick={() => this.setState({input_email: true})}> | <u>Change</u></span>}
                        </span>
                                }
                            </React.Fragment>
                        }
                    </div>
                </div>
                <div className="row field-wrapper">
                    <div className="col-sm-4">
                        {T.translate("ticket_popup.edit_first_name")}
                        {T.translate("ticket_popup.edit_required_star")}
                    </div>
                    <div className="col-sm-8">
                        {(owner && owner.first_name)?
                            <span>{ticket.attendee_first_name}</span>
                            :
                            (shouldEditBasicInfo ? <Input
                                id="attendee_first_name"
                                className="form-control"
                                error={this.hasErrors('attendee_first_name')}
                                onChange={this._innerOnChange}
                                value={ticket.attendee_first_name}/>:
                                <span>{ticket.attendee_first_name}</span>
                            )
                        }
                    </div>
                </div>
                <div className="field-wrapper-mobile">
                    <div>{T.translate("ticket_popup.edit_first_name")}{T.translate("ticket_popup.edit_required_star")}</div>
                    <div>
                        {(owner && owner.first_name)?
                            <span>{ticket.attendee_first_name}</span>
                            :
                            (shouldEditBasicInfo ? <Input
                                id="attendee_first_name"
                                className="form-control"
                                error={this.hasErrors('attendee_first_name')}
                                onChange={this._innerOnChange}
                                value={ticket.attendee_first_name}
                            />: <span>{ticket.attendee_first_name}</span>)
                        }
                    </div>
                </div>
                <div className="row field-wrapper">
                    <div className="col-sm-4">
                        {T.translate("ticket_popup.edit_last_name")}
                        {T.translate("ticket_popup.edit_required_star")}
                    </div>
                    <div className="col-sm-8">
                        {(owner && owner.last_name)?
                            <span>{ticket.attendee_last_name}</span>
                            :
                            (shouldEditBasicInfo ? <Input
                                id="attendee_last_name"
                                className="form-control"
                                error={this.hasErrors('attendee_last_name')}
                                onChange={this._innerOnChange}
                                value={ticket.attendee_last_name}
                            />:  <span>{ticket.attendee_last_name}</span>)
                        }
                    </div>
                </div>
                <div className="field-wrapper-mobile">
                    <div>{T.translate("ticket_popup.edit_last_name")}{ T.translate("ticket_popup.edit_required_star")}</div>
                    <div>
                        {(owner && owner.last_name) ?
                            <span>{ticket.attendee_last_name}</span>
                            :
                            (shouldEditBasicInfo ? <Input
                                id="attendee_last_name"
                                className="form-control"
                                error={this.hasErrors('attendee_last_name')}
                                onChange={this._innerOnChange}
                                value={ticket.attendee_last_name}
                            />:  <span>{ticket.attendee_last_name}</span>)
                        }
                    </div>
                </div>

                    <div className="row field-wrapper">
                        <div
                            className="col-sm-4">{T.translate("ticket_popup.edit_company")}{ T.translate("ticket_popup.edit_required_star")}</div>
                        <div className="col-sm-8">
                            {readOnly ?
                                <span>{ticket.attendee_company}</span>
                                :
                                (shouldEditBasicInfo ? <Input
                                    id="attendee_company"
                                    className="form-control"
                                    error={this.hasErrors('attendee_company')}
                                    onChange={this._innerOnChange}
                                    value={ticket.attendee_company}
                                />: <span>{ticket.attendee_company}</span>)
                            }
                        </div>
                    </div>

                <div className="field-wrapper-mobile">
                    <div>{T.translate("ticket_popup.edit_company")}{T.translate("ticket_popup.edit_required_star")}</div>
                    <div>
                        {readOnly ?
                            <span>{ticket.attendee_company}</span>
                            :
                            (shouldEditBasicInfo ?<Input
                                id="attendee_company"
                                className="form-control"
                                error={this.hasErrors('attendee_company')}
                                onChange={this._innerOnChange}
                                value={ticket.attendee_company}
                            />:<span>{ticket.attendee_company}</span>)
                        }
                    </div>
                </div>
                {extraQuestions && extraQuestions.length > 0 &&
                <React.Fragment>
                    <hr/>
                    <div className="row popup-basic-info">
                        <div className="col-sm-6">{T.translate("ticket_popup.edit_preferences")}</div>
                        <div className="col-sm-6"></div>
                    </div>
                    <QuestionAnswersInput
                        id={`${ticket.id}_extra_questions`}
                        allowEdit={allow_extra_questions_edit}
                        answers={ticket.extra_questions}
                        ticket={ticket}
                        questions={extraQuestions}
                        questions_type={'Ticket'}
                        onChange={this._innerOnChange}
                    />
                </React.Fragment>
                }
                {(summit.registration_disclaimer_content) &&
                <React.Fragment>
                    <hr/>
                    <div className="row field-wrapper">
                        <div className="col-md-12">
                            <div className="form-check abc-checkbox">
                                <input type="checkbox" id={`${ticket.id}_disclaimer_accepted`} checked={ticket.disclaimer_accepted}
                                       onChange={this._innerOnChange} className="form-check-input"/>
                                <label className="form-check-label" htmlFor={`${ticket.id}_disclaimer_accepted`}>
                                    { summit.registration_disclaimer_mandatory? '*' : ''}
                                </label>
                                <div className="disclaimer">
                                    <RawHTML>
                                        {summit.registration_disclaimer_content}
                                    </RawHTML>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="field-wrapper-mobile">
                        <div>
                            <div className="form-check abc-checkbox">
                                <input type="checkbox"
                                       id={`${ticket.id}_disclaimer_accepted`} checked={ticket.disclaimer_accepted}
                                       onChange={this._innerOnChange} className="form-check-input"/>
                                <label className="form-check-label" htmlFor={`${ticket.id}_disclaimer_accepted`}>
                                    { summit.registration_disclaimer_mandatory? '*' : ''}
                                </label>
                                <div className="disclaimer">
                                    <RawHTML>
                                        {summit.registration_disclaimer_content}
                                    </RawHTML>
                                </div>
                            </div>
                        </div>
                    </div>
                </React.Fragment>
                }
            </div>
        );
    }
}

export default TicketAssignForm;
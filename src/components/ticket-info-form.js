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
import { Input } from 'openstack-uicore-foundation/lib/components'


class TicketInfoForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
          firstTicket: false
        };

        this.addTicket = this.addTicket.bind(this);
        this.removeTicket = this.removeTicket.bind(this);
        this.ticketInfoChange = this.ticketInfoChange.bind(this);
        this.getTicketEmail = this.getTicketEmail.bind(this);
    }

    addTicket(ticketTypeId, ev) {
        ev.preventDefault();
        this.props.onAddTicket(ticketTypeId);
    }

    removeTicket(ticketId, ev) {
        ev.preventDefault();
        this.props.onRemoveTicket(ticketId);
    }

    ticketInfoChange(ticketId, index, field, ev) {
        let {value} = ev.target;
        ev.preventDefault();
        if(index === 0) {
          this.props.onChange(ticketId, field, value)
          this.setState({firstTicket: true})
        } else {          
          this.props.onChange(ticketId, field, value);
        }        
    }

    hasErrors(field) {
        let {errors} = this.props;
        if(field in errors) {
            return errors[field];
        }

        return '';
    }

    getTicketEmail(ticketIdx, order, firstTicket, tix , ticketType){
        if(ticketType.audience  === 'WithInvitation' )
            return tix.attendee_email = order.email;
        return  (ticketIdx === 0 && order.tickets.length === 1 && !firstTicket) ?
            tix.attendee_email = order.email : tix.attendee_email ? tix.attendee_email : ''
    }

    render() {
        let {order, ticketType, summit, now} = this.props;
        let {firstTicket} = this.state;
        let orderedTickets = order.tickets.filter(tix => {
          let tixId = tix.type_id ? tix.type_id : tix.ticket_type_id;
          return tixId == ticketType.id
        });

        let canSell = ticketType.quantity_2_sell === 0 || ticketType.quantity_2_sell > ticketType.quantity_sold;
        // if sales_start_date == ticketType.sales_end_date == null then the ticket type could be sell all the registration period

        if (canSell && ( (ticketType.sales_start_date == null && ticketType.sales_end_date == null) || (now >= ticketType.sales_start_date && now <= ticketType.sales_end_date )) ) {
            const ticketLabel = orderedTickets.length > 1 ? 
              T.translate("step_two.tickets") : T.translate("step_two.ticket")
            return (
                <div className="ticket-info-wrapper">
                  <hr/>
                    <div className="row">
                        <div className="col-md-6">
                            <h3>{ticketType.name} {orderedTickets.length > 0 ? `${ticketLabel} (${orderedTickets.length})` : ''}</h3>
                        </div>
                        <div className="col-md-6">
                            <h5><strong>{T.translate("step_two.asterisks_bold")}</strong> {T.translate("step_two.asterisks")}</h5>
                        </div>
                    </div>
                    { orderedTickets.map((tix, i) => (                  
                        <div className="row field-wrapper" key={`tix_${ticketType.id}_${i}`}>
                          <div className="ticket-desktop">
                            <div className="ticket-number">
                                <label>{T.translate("step_two.ticket")} #{i+1}</label>
                            </div>
                            <div className="ticket-data">
                              <div className="row-ticket">
                                <div className="col-md-4">
                                  <p>{T.translate("step_two.code")}</p>
                                </div>
                                <div className="col-md-6">
                                  <Input
                                      className="form-control"
                                      placeholder={T.translate("step_two.placeholders.coupon")}
                                      error={this.hasErrors(`tix_coupon_${tix.tempId}`)}
                                      onChange={this.ticketInfoChange.bind(this, tix.tempId, i, 'promo_code')}
                                      value={tix.promo_code ? tix.promo_code : ''}
                                  />
                                </div>
                                <div className="col-md-2">
                                  <a href="" onClick={this.removeTicket.bind(this, tix.tempId)}>
                                      <i className="fa fa-trash-o" aria-hidden="true"></i>
                                  </a>
                                </div>
                              </div>
                              <div className="row-ticket">
                                <div className="col-md-4">
                                  <p>{T.translate("step_two.assign")}</p>
                                </div>
                                <div className="col-md-6">
                                  <Input
                                      className="form-control email"
                                      placeholder={T.translate("step_two.placeholders.email")}
                                      error={this.hasErrors(`tix_email_${tix.tempId}`)}
                                      onChange={this.ticketInfoChange.bind(this, tix.tempId, i, 'attendee_email')}
                                      readOnly={ticketType.audience === 'WithInvitation'}
                                      value={this.getTicketEmail(i, order, firstTicket, tix, ticketType)}
                                  />
                                </div>
                              </div>
                            </div>      
                          </div>
                          <div className="ticket-mobile">
                            <div className="col-md-4">
                                <label>{T.translate("step_two.ticket")} #{i+1}</label>
                            </div>
                            <div className="col-md-6">
                                <Input
                                    className="form-control"
                                    placeholder={T.translate("step_two.placeholders.coupon")}
                                    error={this.hasErrors(`tix_coupon_${tix.tempId}`)}
                                    onChange={this.ticketInfoChange.bind(this, tix.tempId, i, 'promo_code')}
                                    value={tix.promo_code ? tix.promo_code : ''}
                                />
                                <Input
                                    className="form-control email"
                                    placeholder={T.translate("step_two.placeholders.email")}
                                    error={this.hasErrors(`tix_email_${tix.tempId}`)}
                                    onChange={this.ticketInfoChange.bind(this, tix.tempId, i, 'attendee_email')}
                                    readOnly={ticketType.audience === 'WithInvitation'}
                                    value={this.getTicketEmail(i, order, firstTicket, tix, ticketType)}
                                />
                            </div>
                            <div className="col-md-2">
                                <a href="" onClick={this.removeTicket.bind(this, tix.tempId)}>
                                    <i className="fa fa-trash-o" aria-hidden="true"></i>
                                </a>
                            </div>
                          </div>
                        </div>
                    ))}

                    {orderedTickets.length == 0 &&
                        <div className="row">
                            <div className="col-md-12">
                                {T.translate("step_two.no_tickets")}
                            </div>
                        </div>
                    }
                  
                    {(ticketType.max_quantity_per_order > 0 && ticketType.max_quantity_per_order > orderedTickets.length) 
                      && (ticketType.quantity_2_sell === 0 || (orderedTickets.length < ticketType.quantity_2_sell - ticketType.quantity_sold)) &&
                      <div className="row ticket-add-wrapper">
                          <div className="col-md-10 text-right">
                              <button className="btn btn-primary" onClick={this.addTicket.bind(this, ticketType.id)}>
                                  {T.translate("step_two.add_ticket")}
                              </button>
                          </div>
                      </div>
                    }

                </div>
            );
        } else { 
          return null;
        }        
    }
}

export default TicketInfoForm;

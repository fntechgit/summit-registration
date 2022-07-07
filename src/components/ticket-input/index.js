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
import { getFormatedDate } from '../../utils/helpers';
import './ticket-input.less'


export default class TicketInput extends React.Component {

    constructor(props) {
        super(props);

        this.addTicket = this.addTicket.bind(this);
        this.substractTicket = this.substractTicket.bind(this);

    }

    addTicket(ticketTypeId, ev) {
        ev.preventDefault();

        this.props.add(ticketTypeId);
    }

    substractTicket(ticketTypeId, ev) {
        ev.preventDefault();

        this.props.substract(ticketTypeId);
    }


    render() {

        let {selection, ticketTypes, summit} = this.props;

        const renderPromoTillDate = (ticketType) => {
            return ticketType.sales_end_date == null ? '':
            `${T.translate("step_one.expiration")} ${getFormatedDate(ticketType.sales_end_date, summit.time_zone_id)}`
        };

        return (
            ticketTypes && 
            <div className="ticket-input-box">
                {ticketTypes.map(t => {
                    let quantity = selection.filter(sel => sel.type_id == t.id).length;
                    let canSell = t.quantity_2_sell === 0 || t.quantity_2_sell > t.quantity_sold;
                      return (
                        <div className={`ticket-wrapper ${!canSell? 'sold_out' : ''} ${quantity == 0 ? 'no-tickets' :''}`} key={`ttype_${t.id}`}>
                            <div className="row">
                                <div className="col-md-5">
                                    <div className="ticket-type">{t.name}</div>
                                    <div className="ticket-price">
                                        {t.cost > 0 ? `$ ${t.cost}` : T.translate("step_one.free")}
                                    </div>
                                </div>
                                <div className="col-md-7">
                                    {canSell ?
                                    <div className="form-inline ticket-quantity">
                                        <button aria-label='substract' className="btn btn-default" onClick={this.substractTicket.bind(this, t.id)}>
                                            <i className="fa fa-minus"></i>
                                        </button>
                                        <div role="status" className="quantity-value" style={{opacity : canSell ? '1' : '0.4'}}>{quantity}</div>
                                        <button aria-label='add' className="btn btn-default" onClick={this.addTicket.bind(this, t.id)} 
                                          disabled={(t.max_quantity_per_order > 0 && t.max_quantity_per_order <= quantity) ||
                                          (t.quantity_2_sell > 0 && quantity >= t.quantity_2_sell - t.quantity_sold)}>
                                            <i className="fa fa-plus"></i>
                                        </button>
                                    </div>
                                    : null
                                    }
                                </div>
                            </div>
                            <div className="ticket-expiration">
                                { canSell ?
                                  renderPromoTillDate(t)
                                  :
                                  <div className="sold-out-text">
                                    {T.translate("step_one.sold_out")}
                                  </div>
                                }
                            </div>
                        </div>
                      )
                })}
            </div>
        );

    }
}

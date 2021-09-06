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

class OrderSummary extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
          summaryToggle: false
        };

        this.handleSummaryDisplay = this.handleSummaryDisplay.bind(this);

    }

    handleSummaryDisplay(){      
      this.setState((prevState) => {
        return {
          summaryToggle: !prevState.summaryToggle
        }
      }, () => this.state.summaryToggle ? document.body.style.overflow = "hidden" : document.body.style.overflow = "visible", window.scrollTo(0, 0))      
    }


    render() {

        let {order, summit: {ticket_types}, type} = this.props;
        let ticketTotal = 0;
        let ticketSummary = [];        

        order.tickets.forEach(tix => {
              let idx = ticketSummary.findIndex(o => o.ticket_type_id == (tix.type_id ? tix.type_id : tix.ticket_type_id));
              let tixType = ticket_types.find(tt => tt.id == (tix.type_id ? tix.type_id : tix.ticket_type_id));
  
              if (idx >= 0) {
                  ticketSummary[idx].qty++;
              } else {
                  let name = ticket_types.find(q => q.id === (tix.type_id ? tix.type_id : tix.ticket_type_id)).name;                
                  ticketSummary.push({ticket_type_id: (tix.type_id ? tix.type_id : tix.ticket_type_id), tix_type: tixType, name, qty: 1})
              }
  
              ticketTotal = ticketTotal + tixType.cost;

        });
        
        let discountTotal = 0;

        order.tickets.filter(tix => tix.discount && tix.status !== "Refunded").map(tix => {
            let tixType = ticket_types.find(tt => tt.id == tix.type_id || tix.ticket_type_id);

            let discountPercentageTmp = (tix.discount * 100) / tixType.cost;            
            let discountTmp = (discountPercentageTmp / 100) * tixType.cost;            
            discountTotal = discountTotal + discountTmp;

            return {tix_type: tixType, percentage: discountPercentageTmp, code: tix.promo_code_id};
        });

        let refundTotal = 0;
        order.tickets.filter(tix => tix.status === "Refunded").map(tix => {
          let tixType = ticket_types.find(tt => tt.id == (tix.type_id ? tix.type_id : tix.ticket_type_id));
          refundTotal += tixType.cost;
        });

        let total = ticketTotal - discountTotal - refundTotal;

        if(type === "mobile") {
          return(
            <div className="order-summary">
                <div className={this.state.summaryToggle ? 'order-summary-mobile open' : 'order-summary-mobile'}>
                  <div className="order-summary-mobile--title" onClick={this.handleSummaryDisplay}>
                    <span>Order Summary</span>                  
                    <span>
                      ${total.toFixed(2)} &nbsp; <i className={`fa ${this.state.summaryToggle ? 'fa-chevron-up' : 'fa-chevron-down'}`} aria-hidden="true"></i>                            
                    </span>
                  </div>
                  <div className={this.state.summaryToggle ? 'open':'closed' }>
                      <div className="order-summary-wrapper">
                        <div className="row">
                            <div className="col-xs-12">
                                <h4>{T.translate("order_summary.order_summary")}</h4>
                            </div>
                        </div>
                        {ticketSummary.map(tix => {
                            let total = tix.qty * tix.tix_type.cost;
                            return (
                                <div className="row order-row" key={`tixorder_${tix.tix_type.created}`}>
                                    <div className="col-xs-7">
                                        <span>{tix.tix_type.name}</span>
                                        <span>x{tix.qty}</span>
                                    </div>                                    
                                    <div className="col-xs-5 text-right subtotal">
                                        ${total.toFixed(2)}
                                    </div>
                                </div>
                            );
                        })}

                        {discountTotal > 0 &&
                        <div className="row order-discounts order-row">
                            <div className="col-xs-7 text-left">
                                {T.translate("order_summary.discounts")}
                            </div>
                            <div className="col-xs-5 text-right subtotal">
                                -${discountTotal.toFixed(2)}
                            </div>
                        </div>
                        }
                        {refundTotal > 0 && 
                        <div className="row order-refunds order-row">
                            <div className="col-xs-7 text-left">
                                {T.translate("order_summary.refunds")}                          
                            </div>
                            <div className="col-xs-5 text-right subtotal">
                                -${refundTotal.toFixed(2)}
                            </div>
                        </div>
                        }
                        {
                            order.status === 'Paid' &&
                            <div className="row order-amount-paid order-row amount-paid-row">
                                <div className="col-xs-7 text-left">
                                    {T.translate("order_summary.amount_paid")}
                                </div>
                                <div className="col-xs-5 text-right subtotal">
                                    -${ total.toFixed(2)}
                                </div>
                            </div>
                        }
                        <div className="row total-row">
                            <div className="col-xs-6 text-left">
                                {T.translate("order_summary.total")}
                            </div>
                            <div className="col-xs-6 text-right total">
                                ${ order.status === 'Paid' ? '0.00' : total.toFixed(2)}
                            </div>
                        </div>
                      </div>
                      <div className="order-summary-mobile--coupon">

                      </div>
                      <div className="order-summary-mobile--close-text" onClick={this.handleSummaryDisplay}>
                          Close
                      </div>
                  </div>                  
              </div>
            </div>
          )
        } else if (type === "desktop") {
          return (
            <div className="order-summary">
              
              <div className="order-summary-wrapper">
                  <div className="row">
                      <div className="col-xs-12">
                          <h4>{T.translate("order_summary.order_summary")}</h4>
                      </div>
                  </div>
                  {ticketSummary.map(tix => {
                      let total = tix.qty * tix.tix_type.cost;
                      return (
                          <div className="row order-row" key={`tixorder_${tix.tix_type.created}`}>
                              <div className="col-xs-7">
                                  <span>{tix.tix_type.name}</span>
                                  <span>x{tix.qty}</span>
                              </div>
                              <div className="col-xs-5 text-right subtotal">
                                  ${total.toFixed(2)}
                              </div>
                          </div>
                      );
                  })}
                  {discountTotal > 0 &&
                  <div className="row order-discounts order-row">
                      <div className="col-xs-7 text-left">
                          {T.translate("order_summary.discounts")}
                      </div>
                      <div className="col-xs-5 text-right subtotal">
                          -${discountTotal.toFixed(2)}
                      </div>
                  </div>
                  }
                  {refundTotal > 0 && 
                  <div className="row order-refunds order-row">
                      <div className="col-xs-7 text-left">
                          {T.translate("order_summary.refunds")}                          
                      </div>
                      <div className="col-xs-5 text-right subtotal">
                          -${refundTotal.toFixed(2)}
                      </div>
                  </div>
                  }
                  {
                      order.status === 'Paid' &&
                      <div className="row order-amount-paid order-row amount-paid-row">
                          <div className="col-xs-7 text-left">
                              {T.translate("order_summary.amount_paid")}
                          </div>
                          <div className="col-xs-5 text-right subtotal">
                              -${ total.toFixed(2)}
                          </div>
                      </div>
                  }
                  <div className="row total-row">
                      <div className="col-xs-6 text-left">
                          {T.translate("order_summary.total")}
                      </div>
                      <div className="col-xs-6 text-right total">
                          ${ order.status === 'Paid' ? '0.00' : total.toFixed(2)}
                      </div>
                  </div>
              </div>
            </div>
          );
        } else {
          return null
        }
        
    }
}

export default OrderSummary;

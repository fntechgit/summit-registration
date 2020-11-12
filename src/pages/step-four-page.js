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
import { Link } from 'react-router-dom';
import OrderSummary from "../components/order-summary";
import StepRow from '../components/step-row';
import { handleOrderChange } from '../actions/order-actions'


import '../styles/step-four-page.less';
import history from '../history';


class StepFourPage extends React.Component {

    constructor(props){
        super(props);

        this.state = {

        };
        this.step = 4;
        this.purchasedTickets = this.purchasedTickets.bind(this);

    }

    componentDidMount() {
      let { order: { checkout }, summit: { ticket_types }} = this.props;
      const isFree = ticket_types.length > 0 && ticket_types[0].cost === 0;
      const stepDefs = ['start', 'details', 'checkout', 'extra', 'done'];
      if (!isFree && Object.entries(checkout).length === 0 && checkout.constructor === Object) {
        history.push(stepDefs[0]);
      } else {
        window.scrollTo(0, 0);
      }
    }

    componentWillUnmount() {
      let {member, order} = this.props;

      if(member) {
        order = {
          ...order,
          checkout: {}
        };
      } else {
        order= {
          ...order,
          checkout: {},
          first_name: '',
          last_name: '',
          email: '',
          company: '',
          billing_country: '',
          billing_address: '',
          billing_city: '',
          billing_state: '',
          billing_zipcode: ''
        }        
      }

      this.props.handleOrderChange(order);
    }

    purchasedTickets(){
      let {order, summit: {ticket_types}} = this.props;

      let ticketSummary = [];
      
      order.tickets.forEach(tix => {
        let idx = ticketSummary.findIndex(o => o.ticket_type_id == (tix.type_id ? tix.type_id : tix.ticket_type_id));
        let tixType = ticket_types.find(tt => tt.id == (tix.type_id ? tix.type_id : tix.ticket_type_id));

        if (idx >= 0) {
            ticketSummary[idx].qty++;
        } else {
            let name = ticket_types.find(q => q.id === (tix.type_id ? tix.type_id : tix.ticket_type_id)).name;                
            ticketSummary.push({ticket_type_id: (tix.type_id ? tix.type_id : tix.ticket_type_id), name, qty: 1})
        }        
      });
      
      return ticketSummary;
    }

    render(){
        let {summit, order: {checkout}, order, errors, member} = this.props;
        if((Object.entries(summit).length === 0 && summit.constructor === Object) ) return null;
        order.status = 'Paid';

        this.purchasedTickets();

        return (
            <div className="step-four">
                <OrderSummary order={order} summit={summit} type={'mobile'} />
                <div className="row">
                    <div className="col-md-8 order-result">

                        <span>
                        
                          <h3>{T.translate("step_four.thank_you")}</h3>         
                          <br />                                           
                          <span>{T.translate("step_four.order_no")}</span> <br/>
                          <span className="order-number">{checkout.number}</span>
                          <br/>
                          <br/>                          
                        </span>
                          
                        <span>
                         <br/><br/> 
                        <h4><StepRow step={this.step} /></h4>
                        <h4>{T.translate("step_four.subtitle")}</h4>
                        </span>

                        {member &&
                        <React.Fragment> 
                        <span>
                         <br/> 
                          <strong>{T.translate("step_four.member_exclamation")}</strong>{T.translate("step_four.member_text")}
                        <Link to="/a/member/tickets">
                          {T.translate("step_four.member_link_tickets")}
                        </Link>
                        {T.translate("step_four.member_text_1")} 
                        <Link to="/a/member/orders">
                          {T.translate("step_four.member_link_orders")}
                        </Link>  
                        {T.translate("step_four.member_text_2")}                                                                   
                        <br/><br/>
                        </span>

  

                        </React.Fragment>              
                        }

                        {!member &&
                        <React.Fragment>    
                        

                  {/*        <span>
                            {T.translate("step_four.register_text")}
                            <a href={`${window.IDP_BASE_URL}/auth/register`}>
                              {T.translate("step_four.register_link_text")}
                            </a> 
                            {T.translate("step_four.register_text_2")}
                            {order.email}
                            {T.translate("step_four.register_text_3")}                              
                          </span> 

                        <span>
                        <br/>
                        {T.translate("step_four.required_text")}
                        <br/><br/>
                        <a href={`${window.IDP_BASE_URL}/auth/register`}>
                            <button className="btn btn-primary manage-btn">
                              {T.translate("step_four.getfnid")}
                            </button>
                          </a>
                

                         &nbsp;OR&nbsp;

                          <Link to="/a/member/orders">
                            <button className="btn btn-primary manage-btn">
                              {T.translate("step_four.signin")}
                            </button>
                          </Link>
                          <br/><br/>
                            */}
                          <h5><strong>{T.translate("step_four.register_email_bold")}</strong> {T.translate("step_four.register_email")}</h5>

                     {/*   </span> */}

                        </React.Fragment>  
                        }

                        <span>
                        <br/>
                        {T.translate("step_four.required_text")}
                        <br/><br/>
                        {/*  <Link to="/a/member/orders">
                            <button className="btn btn-primary manage-btn">
                              {T.translate("step_four.manage")}
                            </button>
                          </Link>
                        */}
                        </span>                
                        <span>
                        <br/><br/>
                          {T.translate("step_four.help_text")} 
                          <a href={`mailto:${summit.hasOwnProperty('support_email') && 
                            summit.support_email ? summit.support_email : window.SUPPORT_EMAIL}`} 
                            target="_blank">{summit.hasOwnProperty('support_email') && 
                            summit.support_email ? summit.support_email : window.SUPPORT_EMAIL}</a>.
                        </span>
                    </div>
                    <div className="col-md-4">
                      <OrderSummary order={order} summit={summit} type={'desktop'} />
                      <br/>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = ({ loggedUserState, summitState, orderState }) => ({
    member: loggedUserState.isLoggedUser,
    summit: summitState.purchaseSummit,
    order:  orderState.purchaseOrder,
    errors:  orderState.errors
})

export default connect (
    mapStateToProps,
    {
        handleOrderChange
    }
)(StepFourPage);

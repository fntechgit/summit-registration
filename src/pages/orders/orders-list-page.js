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

import '../../styles/orders-list-page.less';
import OrderList from '../../components/order-list';

import { getUserOders, selectOrder } from '../../actions/order-actions';
import { selectSummit } from '../../actions/summit-actions';

class OrdersListPage extends React.Component {

  componentWillMount() {    
    this.props.getUserOders();
  }

    render() {
      let {orders, summits, selectOrder, selectSummit} = this.props;
      
        return (
          <div>
            <OrderList orders={orders} summits={summits} selectOrder={selectOrder} selectSummit={selectSummit}/>
          </div>
        );
    }
}

const mapStateToProps = ({ orderState, summitState }) => ({
  orders: orderState.memberOrders,
  summits: summitState.summits
})

export default connect (
  mapStateToProps,
  {
    getUserOders,
    selectOrder,
    selectSummit
  }
)(OrdersListPage);

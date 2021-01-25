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

import '../../styles/orders-list-page.less';
import OrderList from '../../components/order-list';

import {getUserOrders, handleResetOrder, selectOrder} from '../../actions/order-actions';
import { selectSummit } from '../../actions/summit-actions';

import {getNow} from '../../actions/timer-actions';

class OrdersListPage extends React.Component {

  constructor(props){
    super(props);

    this.state = {
    };

    this.handlePageChange = this.handlePageChange.bind(this);

  }


  componentWillMount() {    
    let {page, perPage} = this.props;
    // clear order state
    this.props.handleResetOrder();
    this.props.getUserOrders(null, page, perPage);
  }

  handlePageChange(page) {
    let {perPage} = this.props;
    this.props.getUserOrders(null, page, perPage);
  }

    render() {
      let {orders, summits, selectOrder, page, lastPage, selectSummit, orderLoader, summitLoader} = this.props;

      let loading = orderLoader || summitLoader;
      
        return (
          <div>
            {!orderLoader && !summitLoader &&
            <OrderList 
                orders={orders} 
                summits={summits}
                currentPage={page}
                lastPage={lastPage} 
                selectSummit={selectSummit}
                selectOrder={selectOrder} 
                loading={loading}
                pageChange={this.handlePageChange}
                now={this.props.getNow()}
            />}
          </div>
        );
    }
}

const mapStateToProps = ({ orderState, summitState }) => ({
  orders: orderState.memberOrders,
  page: orderState.current_page,
  lastPage: orderState.last_page,
  perPage: orderState.per_page,
  summits: summitState.summits,
  orderLoader: orderState.loading,
  summitLoader: summitState.loading,
})

export default connect (
  mapStateToProps,
  {
    getUserOrders,
    selectOrder,
    selectSummit,
    getNow,
    handleResetOrder
  }
)(OrdersListPage);

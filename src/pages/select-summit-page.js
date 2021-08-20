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

import NotFoundSummit from '../components/not-found-summit';

import {getSuggestedSummits, selectPurchaseSummit} from '../actions/summit-actions';
import { handleResetOrder } from '../actions/order-actions'
import {getNow} from '../actions/timer-actions';


class SelectSummitPage extends React.Component {

    constructor(props){
        super(props);

        this.state = {

        };

        this.handleSummitSelect = this.handleSummitSelect.bind(this);
    }

    componentWillMount() {
      
    }

    componentDidMount() {
      let {getSuggestedSummits} = this.props;
      this.props.handleResetOrder();
      getSuggestedSummits();
    }

    handleSummitSelect(slug) {
      this.props.selectPurchaseSummit(slug);
    }

    render(){
      let {suggestedSummits, loading} = this.props;      
      let slug = this.props.match.params.summit_slug;

        return (
            <div>
              {!loading &&  <NotFoundSummit slug={slug} now={this.props.getNow()} summits={suggestedSummits} selectPurchaseSummit={this.handleSummitSelect}/>}
            </div>
        );
    }
}

const mapStateToProps = ({ summitState  }) => ({
  suggestedSummits: summitState.suggestedSummits,
  loading: summitState.loading
})

export default connect(
  mapStateToProps,
  {
      getSuggestedSummits,
      selectPurchaseSummit,
      getNow,
      handleResetOrder,
  }
)(SelectSummitPage);


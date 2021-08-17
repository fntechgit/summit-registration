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
import { Switch, Route, Redirect } from 'react-router-dom';
import { getSummitBySlug } from '../actions/summit-actions';
import StepOnePage from '../pages/step-one-page'
import StepTwoPage from '../pages/step-two-page'
import StepThreePage from '../pages/step-three-page'
import StepFourPage from '../pages/step-four-page'
import StepExtraQuestionsPage from '../pages/step-extra-questions-page';

class PrimaryLayout extends React.Component {
  
    componentDidMount() {
      let { getSummitBySlug } = this.props;

      let summitSlug = this.props.match.params.summit_slug;

      if (summitSlug) {
          getSummitBySlug(summitSlug);
      }
    }

    componentWillReceiveProps(newProps) {
        let oldId = this.props.match.params.summit_slug;
        let newId = newProps.match.params.summit_slug;
        let oldFavicon = this.props.favicon;
        let newFavicon = newProps.favicon;

        if (newId != oldId) {
            if (newId) {
                this.props.getSummitBySlug(newId);
            }
        }
        if(newFavicon && oldFavicon != newFavicon) {
            const icon = document.getElementById('favicon');
            icon.href = newFavicon;
        }
    }

    render(){
        let { match, summit, summitLoader } = this.props;        

        if (!summitLoader && (Object.entries(summit).length === 0 && summit.constructor === Object)) {                    
          return <div>
            <Switch>
                <Route render={props => (<Redirect to={`/a/`} />)}/>
            </Switch>
          </div>;
        } else {
          return(
            <div className="primary-layout">
                <main id="page-wrap">
                    <Switch>
                        <Route exact path={`${match.url}/register/start`} component={StepOnePage}/>
                        <Route exact path={`${match.url}/register/details`} component={StepTwoPage}/>
                        <Route exact path={`${match.url}/register/checkout`} component={StepThreePage}/>
                        <Route exact path={`${match.url}/register/extra`} component={StepExtraQuestionsPage}/>
                        <Route exact path={`${match.url}/register/done`} component={StepFourPage}/>
                        <Route render={props => (<Redirect to={`${match.url}/register/start`} />)}/>
                    </Switch>
                </main>
            </div>
          );
        }
    }

}

const mapStateToProps = ({ summitState, baseState  }) => ({
    summit: summitState.purchaseSummit,
    summitLoader: summitState.loading,
    favicon: baseState.favicon
})

export default connect(
    mapStateToProps,
    {
        getSummitBySlug
    }
)(PrimaryLayout);



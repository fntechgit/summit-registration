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
import PropTypes from 'prop-types';
import T from 'i18n-react/dist/i18n-react'


class StepRow extends React.Component {
    render() {
        let { step, totalSteps, optional } = this.props;
        if (!optional) optional = false;
        return (
            <div className="row step-row">
                <div className="col-md-6">
                Step {step} of {totalSteps} 
                </div>
                {((step === 2 || step === 3) && !optional)?
                <div className="col-md-6">                    
                    * {T.translate("step_two.required")}
                </div>
                :
                <div className="col-md-6"></div>
                }
            </div>
        );
    }
}

StepRow.propTypes = {
    step: PropTypes.number.isRequired,
};

const mapStateToProps = ({ wizzardState }) => ({
    totalSteps: wizzardState.totalSteps,
})

export default connect(mapStateToProps)(StepRow);

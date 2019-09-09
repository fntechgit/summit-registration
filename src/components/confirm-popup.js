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

import '../styles/popup-form.less';

class ConfirmPopup extends React.Component {
    constructor(props) {
        super(props);

        this.state = {

        };

    }


    render() {

        return (  
          <div className="confirmation-popup">
            <h4>{T.translate("confirm_popup.question_title")}</h4>            
            <p>{T.translate("confirm_popup.question_text")}</p>

            <span>{T.translate("confirm_popup.cancel")}</span>
            <span>{T.translate("confirm_popup.accept")}</span>
          </div>
        );  
    }
}

export default ConfirmPopup;
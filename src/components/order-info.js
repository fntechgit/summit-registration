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

class OrderInfo extends React.Component {
    constructor(props) {
        super(props);

        this.state = {

        };

    }


    render() {

        return (
            <div className="order-info-wrapper">
                <div className="row">
                    <div className="col-md-12">
                        <a>{T.translate("order_info.print")}</a><br/>
                        <a>{T.translate("order_info.resend")}</a><br/>
                        <a>{T.translate("order_info.download")}</a><br/>
                        <a className="cancel-order">{T.translate("order_info.cancel")}</a>
                    </div>
                </div>
            </div>
        );
    }
}

export default OrderInfo;

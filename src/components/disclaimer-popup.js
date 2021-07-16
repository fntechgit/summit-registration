/**
 * Copyright 2021
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
import {Modal, Button} from 'react-bootstrap';
import {RawHTML} from 'openstack-uicore-foundation/lib/components'

class DisclaimerPopup extends React.Component {

    constructor(props, context) {
        super(props, context);
        this.handleAccept = this.handleAccept.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.state = {
            show: true
        };
    }

    handleAccept() {
        this.setState({ show: false });
        this.props.onAccept();
    }

    handleCancel() {
        this.setState({ show: false });
        this.props.onReject();
    }

    render(){
        let {title, body} = this.props;
        return (
            <Modal show={this.state.show}>
                <Modal.Header>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <RawHTML>
                        {body}
                    </RawHTML>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={this.handleAccept}>Accept</Button>
                    <Button onClick={this.handleCancel}>Cancel Registration</Button>
                </Modal.Footer>
            </Modal>
        );
    }
}

export default DisclaimerPopup;
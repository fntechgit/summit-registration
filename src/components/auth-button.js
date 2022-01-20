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
import LoginComponent from "./login";
import UserButtons from './user-buttons';

export default class 
AuthButton extends React.Component {

    constructor(props) {
        super(props);        
    }
    
    render() {
        let { isLoggedUser, doLogin, picture, initLogOut, summitSlug, member } = this.props;


        if (isLoggedUser) {
            return (
                <div className="user-menu">
                    <UserButtons initLogOut={initLogOut} summitSlug={summitSlug} />
                    <div className="profile-pic">
                        <img src={picture} alt={`${member?.first_name} ${member?.last_name} Profile Image`} />
                    </div>
                </div>
            );
        } else {
            return (
                <div className="user-menu">
                    <button className="btn btn-primary btn-xs login" onClick={() => { doLogin(); }}>
                        {T.translate("landing.sign_in")}
                    </button>
                    <LoginComponent />
                </div>
            );
        }

    }
}

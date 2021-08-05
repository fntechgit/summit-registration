/**
 * Copyright 2020 OpenStack Foundation
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

import React, { useState } from "react";
import isEmail from 'validator/lib/isEmail';
import T from "i18n-react/dist/i18n-react";

import fntechIcon from "../../../assets/svg/fntech_icon.svg"
import "./index.less";

const LoginStepOneComponent = ({
  options,
  login,
  getLoginCode
}) => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState();

  const loginCode = () => {
    let isValidEmail = isEmail(email);
    setEmailError(!isValidEmail);
    if (isValidEmail) {
      getLoginCode(email);
    }
  };

  return (
    <div className="loginWrapper step-wrapper">
      <div className="innerWrapper">
        <span>{T.translate("signin.login_with_title")}</span>
        {options.map((o) => {
          return (
            <div
              className="button left-icon-holder"
              key={`provider-${o.provider_param ? o.provider_param : "fnid"}`}
              data-testid="login-button"
              style={{ backgroundColor: o.button_color }}
              onClick={() => login(o.provider_param)}
            >
              {o.provider_param ? (
                <i className={`fa fa-${o.provider_icon} fa-lg`}></i>
              ) : (
                <img src={fntechIcon} className='icon' />
              )}
              {o.provider_label}
            </div>
          );
        })}
        <div className="loginCode">
          {T.translate("signin.send_code_option")} 
          <div className="input">
            <input
              placeholder="youremail@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(ev) => (ev.key === "Enter" ? loginCode() : null)}
              data-testid="email-input"
            />
            <button onClick={() => loginCode()} data-testid="email-button">
              &gt;
            </button>
            <br />
          </div>
          {emailError && (
            <span data-testid="email-error">
              {T.translate("signin.invalid_email_addr")} 
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginStepOneComponent;

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
import fntechIcon from "../../../assets/svg/logo_fn.svg";
import facebookIcon from "../../../assets/svg/logo_facebook.svg";
import linkedinIcon from "../../../assets/svg/logo_linkedin.svg";
import appleIcon from "../../../assets/svg/logo_apple.svg";
import oktaIcon from "../../../assets/svg/logo_okta.svg";

import "./index.less";

const fnidBtn = [
  { button_color: '#082238', provider_label_key: "signin.fn_login_btn", provider_icon: `${fntechIcon}` },
];

const thirdPartyProvBtns = [
  { button_color: '#1877F2', provider_label_key: "signin.fb_login_btn", provider_param: 'facebook', provider_icon: `${facebookIcon}` },
  { button_color: '#0A66C2', provider_label_key: "signin.ln_login_btn", provider_param: 'linkedin', provider_icon: `${linkedinIcon}` },
  { button_color: '#000000', provider_label_key: "signin.ap_login_btn", provider_param: 'apple', provider_icon: `${appleIcon}` },
  { button_color: '#FFFFFF', font_color: '#00297a', provider_label_key: "signin.ok_login_btn", provider_param: 'okta', provider_icon: `${oktaIcon}` }
];

const formatAuthProviderButtons = (providers) => {
  return [...fnidBtn, ...thirdPartyProvBtns.filter(p => providers?.includes(p.provider_param))];
};

const LoginStepOneComponent = ({
  allowsNativeAuth,
  allowsOtpAuth,
  thirdPartyProviders,
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

  const options = formatAuthProviderButtons(thirdPartyProviders);

  return (
    <div className="loginWrapper step-wrapper">
      <div className="innerWrapper">
        <span>{T.translate("signin.login_with_title")}</span>
        {options && options.map(o => {
          return (
            o.provider_param ?
              <button
                className="button left-icon-holder"
                key={`provider-${o.provider_param}`}
                style={{ backgroundColor: o.button_color, color: o.font_color }}
                onClick={() => login(o.provider_param)}
              >
                <img src={o.provider_icon} alt="" className='icon' />
                {T.translate(o.provider_label_key)}
              </button>
              :
              allowsNativeAuth ?
                <button
                  className="button left-icon-holder"
                  key={`provider-fnid`}
                  style={{ backgroundColor: o.button_color }}
                  onClick={() => login(o.provider_param)}
                >
                  <img src={o.provider_icon} alt="" className='icon' />
                  {T.translate(o.provider_label_key)}
                </button>
                :
                null
          );

        })}
        {allowsOtpAuth &&
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
        }
      </div>
    </div>
  );
};

export default LoginStepOneComponent;

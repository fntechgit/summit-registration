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

import React, { useEffect, useState } from "react";
import isEmail from 'validator/lib/isEmail';
import T from "i18n-react/dist/i18n-react";

import fntechIcon from "../../../assets/svg/logo_fn.svg"
import appleIcon from "../../../assets/svg/logo_apple.svg"
import facebookIcon from "../../../assets/svg/logo_facebook.svg"
import linkedinIcon from "../../../assets/svg/logo_linkedin.svg"
import oktaIcon from "../../../assets/svg/logo_okta.svg"
import "./index.less";

const LoginStepOneComponent = ({
  allowsNativeAuth,
  allowsOtpAuth,
  thirdPartyProviders,
  login,
  getLoginCode
}) => {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState();
  const [options, setOptions] = useState(null);

  useEffect(() => {
    setOptions(formatAuthProviderButtons(thirdPartyProviders));
  }, []);

  const loginCode = () => {
    let isValidEmail = isEmail(email);
    setEmailError(!isValidEmail);
    if (isValidEmail) {
      getLoginCode(email);
    }
  };

  const formatAuthProviderButtons = (thirdPartyProviders) => {

    const fnidBtn = [
      { button_color: '#082238', provider_label: T.translate("signin.fn_login_btn"), provider_icon: `${fntechIcon}` },
    ];

    const thirdPartyProvBtns = [
      { button_color: '#1877F2', provider_label: T.translate("signin.fb_login_btn"), provider_param: 'facebook', provider_icon: `${facebookIcon}` },
      { button_color: '#0A66C2', provider_label: T.translate("signin.ln_login_btn"), provider_param: 'linkedin', provider_icon: `${linkedinIcon}` },
      { button_color: '#000000', provider_label: T.translate("signin.ap_login_btn"), provider_param: 'apple', provider_icon: `${appleIcon}` },
      { button_color: '#FFFFFF', font_color: '#00297a', provider_label: T.translate("signin.ok_login_btn"), provider_param: 'okta', provider_icon: `${oktaIcon}` }
    ];

    return [...fnidBtn, ...thirdPartyProvBtns.filter(p => thirdPartyProviders?.includes(p.provider_param))];
  };

  return (
    <div className="loginWrapper step-wrapper">
      <div className="innerWrapper">
        <span>{T.translate("signin.login_with_title")}</span>
        {options && options.map((o) => {
          return (
            o.provider_param ?
              <div
                className="button left-icon-holder"
                key={`provider-${o.provider_param}`}
                style={{ backgroundColor: o.button_color, color: o.font_color }}
                onClick={() => login(o.provider_param)}
              >
                <img src={o.provider_icon} className='icon' />
                {o.provider_label}
              </div>
              :
              allowsNativeAuth ?
                <div
                  className="button left-icon-holder"
                  key={`provider-fnid`}
                  style={{ backgroundColor: o.button_color }}
                  onClick={() => login(o.provider_param)}
                >
                  <img src={o.provider_icon} className='icon' />
                  {o.provider_label}
                </div>
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

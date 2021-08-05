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

import React, { useState } from 'react';
import OtpInput from 'react-otp-input';
import T from "i18n-react/dist/i18n-react";

import "./index.less";

const LoginStepTwoComponent = ({ email, codeLength, pwdlessLogin, loginWithCode, codeError, goToLogin, getLoginCode }) => {

    const [otpCode, setOtpCode] = useState('');
    const [otpError, setOtpError] = useState(false)

    const tryPasswordlessLogin = (code) => {
        if (code.length === codeLength) {
            setOtpError(false)
            pwdlessLogin(otpCode, loginWithCode)
        } else {
            setOtpError(true)
        }
    }

    const resendCode = () => {
        getLoginCode(email);
    }

    return (
        <div className="passwordlessWrapper step-wrapper">
            <>
                <div className="innerWrapper">
                    <span>
                        {T.translate("signin.email_sent")} 
                        <br />
                        <span data-testid="email">{email}</span>
                        <br />
                        <span className="digits" data-testid="code-digits">
                            {T.translate("signin.add_code_title_p1")} {codeLength} {T.translate("signin.add_code_title_p2")} 
                        </span>
                    </span>
                    <div className="codeInput">
                        <OtpInput
                            value={otpCode}
                            onChange={(code) => setOtpCode(code)}
                            numInputs={codeLength}
                            shouldAutoFocus={true}
                            hasErrored={otpError || codeError}
                            errorStyle={{ border: '1px solid #e5424d' }}
                            data-testid="otp-input"
                        />
                    </div>
                    {codeError && (
                        <span className="error" data-testid="error">
                            {T.translate("signin.wrong_code")} <br />{T.translate("signin.retry")}
                        </span>
                    )}
                    <div className="verify">
                        <div className="button" onClick={() => tryPasswordlessLogin(otpCode)} data-testid="verify">{T.translate("signin.verify_btn")}</div>
                        <b>{T.translate("signin.go_back_title_p1")} <span className="link" onClick={() => goToLogin()} data-testid="go-back">{T.translate("signin.go_back_title_p2")}</span></b>
                    </div>
                </div>
                <div className="resend">
                    {T.translate("signin.email_reception_error_p1")} <span className="link" onClick={() => resendCode()} data-testid="resend">{T.translate("signin.email_reception_error_p2")}</span>.
                </div>
            </>
        </div>
    );
}

export default LoginStepTwoComponent


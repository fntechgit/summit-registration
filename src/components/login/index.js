import React, { useEffect } from "react";
import { connect } from "react-redux";
import { Modal } from "react-bootstrap";
import { doLogin } from "openstack-uicore-foundation/lib/methods";
import { AjaxLoader } from "openstack-uicore-foundation/lib/components";
import LoginStepOneComponent from "./step-one";
import LoginStepTwoComponent from "./step-two";
import {
  closeSignInModal,
  getLoginCode,
  getThirdPartyProviders,
  goToLogin,
  pwdlessLogin,
  setPasswordlessLogin,
} from "../../actions/auth-actions";
import { getBackURL } from "../../utils/helpers";
import { stepDefs } from "../../global/constants";

import "./index.less";

const LoginComponent = ({
  isLoggedUser,
  isLoading,
  allowsNativeAuth,
  allowsOtpAuth,
  thirdPartyProviders,
  summit,
  passwordlessEmail,
  passwordlessCode,
  passwordlessCodeSent,
  passwordlessCodeError,
  pwdlessLogin,
  getLoginCode,
  getThirdPartyProviders,
  setPasswordlessLogin,
  signInModalOpened,
  closeSignInModal,
  goToLogin,
  currentStep,
}) => {

  useEffect(() => {
    getThirdPartyProviders();
  }, []);

  const loginPasswordless = (code, email) => {
    const params = {
      connection: "email",
      otp: code,
      email,
    };
    return setPasswordlessLogin(params);
  };

  const authUser = (provider) => {
    const nextStep = currentStep < stepDefs.length ? currentStep + 1 : currentStep;
    doLogin(getBackURL(stepDefs[nextStep]), provider);
  };

  const loginWithCode = async (code, email) =>
    await loginPasswordless(code, email);

  return (
    <Modal
      show={!isLoggedUser && signInModalOpened}
      onHide={closeSignInModal}
      autoFocus={true}
      keyboard={true}
    >
      <Modal.Header closeButton>
        <Modal.Title
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          className="modalTitle"
        >
          {summit.name}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <AjaxLoader
          relative={true}
          color={"#ffffff"}
          show={isLoading}
          size={80}
        />
        <div className="stepsWrapper">
          {!isLoggedUser && !passwordlessCodeSent && (
            <LoginStepOneComponent
              login={(provider) => authUser(provider)}
              getLoginCode={getLoginCode}
              allowsNativeAuth={allowsNativeAuth}
              allowsOtpAuth={allowsOtpAuth}
              thirdPartyProviders={thirdPartyProviders}
            />
          )}
          {!isLoggedUser && passwordlessCodeSent && (
            <LoginStepTwoComponent
              codeLength={passwordlessCode}
              email={passwordlessEmail}
              pwdlessLogin={pwdlessLogin}
              loginWithCode={loginWithCode}
              codeError={passwordlessCodeError}
              goToLogin={goToLogin}
              getLoginCode={getLoginCode}
            />
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
};

const mapStateToProps = ({
  authState,
  loggedUserState,
  summitState,
  wizzardState,
}) => ({
  isLoggedUser: loggedUserState.isLoggedUser,
  summit: summitState.purchaseSummit,
  isLoading: authState.loading,
  signInModalOpened: authState.signInModalOpened,
  allowsNativeAuth: authState.allows_native_auth,
  allowsOtpAuth: authState.allows_otp_auth,
  thirdPartyProviders: authState.third_party_providers,
  passwordlessEmail: authState.passwordless.email,
  passwordlessCode: authState.passwordless.otp_length,
  passwordlessCodeSent: authState.passwordless.code_sent,
  passwordlessCodeError: authState.passwordless.error,
  currentStep: wizzardState.currentStep
});

export default connect(mapStateToProps, {
  setPasswordlessLogin,
  getLoginCode,
  getThirdPartyProviders,
  pwdlessLogin,
  goToLogin,
  closeSignInModal,
})(LoginComponent);

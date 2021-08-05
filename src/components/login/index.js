import React, { useEffect } from "react";
import { connect } from "react-redux";
import { Modal } from "react-bootstrap";
import { doLogin, formatAuthProviderButtons } from "openstack-uicore-foundation/lib/methods";
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

const LoginComponent = ({
  isLoggedUser,
  isLoading,
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
}) => {
  useEffect(() => {
    getThirdPartyProviders();
  }, [getThirdPartyProviders]);

  const loginPasswordless = (code, email) => {
    const params = {
      connection: "email",
      otp: code,
      email,
    };
    return setPasswordlessLogin(params);
  };

  const authUser = (provider) => {
    doLogin(getBackURL(), provider);
  };

  const loginWithCode = async (code, email) =>
    await loginPasswordless(code, email);

  const loginOptions = formatAuthProviderButtons(
    [{ button_color: "#082238", provider_label: "FNid" }],
    thirdPartyProviders);

  return (
    <div>
      <Modal
        show={!isLoggedUser && signInModalOpened}
        onHide={closeSignInModal}
      >
        <Modal.Header closeButton>
          <Modal.Title
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
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
                options={loginOptions}
                login={(provider) => authUser(provider)}
                getLoginCode={getLoginCode}
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
    </div>
  );
};

const mapStateToProps = ({ loggedUserState, summitState, authState }) => ({
  isLoggedUser: loggedUserState.isLoggedUser,
  summit: summitState.purchaseSummit,
  isLoading: authState.loading,
  signInModalOpened: authState.signInModalOpened,
  thirdPartyProviders: authState.third_party_providers,
  passwordlessEmail: authState.passwordless.email,
  passwordlessCode: authState.passwordless.otp_length,
  passwordlessCodeSent: authState.passwordless.code_sent,
  passwordlessCodeError: authState.passwordless.error,
});

export default connect(mapStateToProps, {
  setPasswordlessLogin,
  getLoginCode,
  getThirdPartyProviders,
  pwdlessLogin,
  goToLogin,
  closeSignInModal,
})(LoginComponent);

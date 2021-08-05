import React from "react";
import { connect } from "react-redux";
import { Button, Modal } from "react-bootstrap";
import T from "i18n-react/dist/i18n-react";
import { closeWillLogoutModal } from "../actions/auth-actions"

const LogoutWarningPopUp = ({ isLoggedUser, logoutModalOpened, initLogOut, closeWillLogoutModal }) => {
  const handleClose = () => {
    closeWillLogoutModal();
    initLogOut();
  };

  return (
    <Modal show={isLoggedUser && logoutModalOpened}>
      <Modal.Header>
        <Modal.Title>{T.translate("logout_popup.title")}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{T.translate("logout_popup.message")}</Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleClose}>
          {T.translate("logout_popup.close_btn")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const mapStateToProps = ({ loggedUserState, authState }) => ({
  isLoggedUser: loggedUserState.isLoggedUser,
  logoutModalOpened: authState.logoutModalOpened,
});

export default connect(mapStateToProps, { closeWillLogoutModal })(LogoutWarningPopUp);

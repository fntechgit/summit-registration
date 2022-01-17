
import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import { Provider } from 'react-redux'
import store, {persistor} from './store';
import { PersistGate } from 'redux-persist/integration/react'
import 'font-awesome/css/font-awesome.css';
import 'sweetalert2/dist/sweetalert2.css';
import './styles/utilities/colors.css';
import './styles/general.less';

import { RESET_STATE } from "./actions/base-actions";

const onBeforeLift = () => {
    const params = new URLSearchParams(window.location.search);
    const flush = params.has("flushState");

    if (flush) {
        store.dispatch({ type: RESET_STATE, payload: null });
    }
};

ReactDOM.render(
    <Provider store={store}>
        <PersistGate onBeforeLift={onBeforeLift} loading={null} persistor={persistor}>
            <App />
        </PersistGate>
    </Provider>,
    document.querySelector('#root')
);

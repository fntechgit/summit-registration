
import React from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import { Provider } from 'react-redux'
import store, {persistor} from './store';
import { PersistGate } from 'redux-persist/integration/react'
import 'font-awesome/css/font-awesome.css';
import './styles/general.less';
import 'sweetalert2/dist/sweetalert2.css';
import './styles/utilities/colors.css';

ReactDOM.render(
    <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
            <App />
        </PersistGate>
    </Provider>,
    document.querySelector('#root')
);

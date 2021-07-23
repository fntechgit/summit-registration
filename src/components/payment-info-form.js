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
import { 
    CardNumberElement,
    CardExpiryElement,
    CardCvcElement,
    ElementsConsumer 
} from '@stripe/react-stripe-js';


class CheckoutForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            stripeErrors: {
                cardNumber: { message: '', required: false },
                cardExpiry: { message: '', required: false },
                cardCvc: { message: '', required: false },
            }
        };
        
        this.hasStripeErrors = this.hasStripeErrors.bind(this);
        this.hasUncompletedFields = this.hasUncompletedFields.bind(this);
    }

    hasErrors(field) {        
        let {errors} = this.props;     

        if(field in errors) {
            return errors[field];
        }
        return '';
    }

    hasStripeErrors(ev) {
        let {error, elementType} = ev;

        if(error) {
            switch(elementType) {
                case 'cardNumber':
                    this.setState({
                        stripeErrors: { ...this.state.stripeErrors, cardNumber: { message: error.message}}
                    }, () => this.hasUncompletedFields(ev));
                    break;
                case 'cardExpiry':                    
                    this.setState({ 
                        stripeErrors: { ...this.state.stripeErrors, cardExpiry: { message: error.message}}
                    }, () => this.hasUncompletedFields(ev));
                    break;
                case 'cardCvc':                    
                    this.setState({ 
                        stripeErrors: { ...this.state.stripeErrors, cardCvc: { message: error.message}}
                    }, () => this.hasUncompletedFields(ev));
                    break;
            }            
        } else {
            this.setState({ 
                    stripeErrors: { ...this.state.stripeErrors, [elementType]: { message: ''}}
                }, () => this.hasUncompletedFields(ev));
        }                
    }

    hasUncompletedFields(ev){    
        let {complete, elementType, empty} = ev;
        let {onChange, stripe, elements} = this.props;
        let {message} = this.state.stripeErrors[elementType];

        const cardElement = elements.getElement(CardNumberElement);

        if(complete) {
            this.setState({ 
                stripeErrors: { ...this.state.stripeErrors, [elementType]: { message, required: true }}
            }, () => onChange(this.state.stripeErrors, stripe, cardElement));
        } else {
            this.setState({ 
                stripeErrors: { ...this.state.stripeErrors, [elementType]: { message, required: false }}
            }, () => onChange(this.state.stripeErrors, stripe, cardElement));
        }

        if(empty) {
          this.setState({ 
            stripeErrors: { ...this.state.stripeErrors, [elementType]: { message: T.translate(`step_three.stripe_errors.${elementType}`), required: false }}
          }, () => onChange(this.state.stripeErrors, stripe, cardElement));
        }
    }


    render() {
        let {stripeErrors: {cardNumber, cardExpiry, cardCvc}} = this.state;

        const style = {
            base: {
                // Add your base input styles here. For example: #d4e5f4
                color: '#3486cd',
                fontSize: '16px',

                '::placeholder': {
                    color: '#A4C7E6'
                }
            },
            invalid: {
                color: '#e5424d',
                ':focus': {
                  color: '#3486cd',
                },
            },
        };        

        return (
            <div className="payment-info">
                <div className="row info-title ">
                    <div className="col-md-8">
                        <h3>{T.translate("step_three.payment_info")}</h3>
                    </div>
                    <div className="col-md-4 required">
                        * {T.translate("step_three.required")}
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">                        
                    </div>
                </div>
                <div className="row field-wrapper">
                    <div className="col-md-4">
                        <label>{T.translate("step_three.card_number")} *</label>
                    </div>
                    <div className="col-md-6">
                        <CardNumberElement style={style} className="form-control" onChange={this.hasStripeErrors} />
                        {cardNumber.message && <p className="error-label">{cardNumber.message}</p>}                        
                    </div>
                </div>
                <div className="row field-wrapper">
                    <div className="col-md-4">
                        <label>{T.translate("step_three.expiration")} *</label>
                    </div>
                    <div className="col-md-3">
                        <CardExpiryElement style={style} className="form-control" onChange={this.hasStripeErrors}/>                        
                        {cardExpiry.message && <p className="error-label">{cardExpiry.message}</p>}
                    </div>
                    <div className="col-md-3">
                        <CardCvcElement style={style} className="form-control" onChange={this.hasStripeErrors} />                        
                        {cardCvc.message && <p className="error-label">{cardCvc.message}</p>}
                    </div>
                </div>
            </div>
        );
    }
}

const PaymentInfoForm = (props) => (
    <ElementsConsumer>
        {({stripe, elements}) => (
            <CheckoutForm stripe={stripe} elements={elements} {...props} />
        )}
    </ElementsConsumer>
);

export default PaymentInfoForm;

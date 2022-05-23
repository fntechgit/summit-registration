/**
 * Copyright 2020
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

import { START_LOADING, STOP_LOADING, LOGOUT_USER } from "openstack-uicore-foundation/lib/actions";
import { 
  GET_SUMMIT_BY_ID, 
  GET_SUMMIT_BY_SLUG, 
  SELECT_SUMMIT, 
  SUMMIT_NOT_FOUND, 
  SELECT_PURCHASE_SUMMIT,
  GET_SUMMIT_REFUND_POLICY, 
  GET_SUGGESTED_SUMMITS,
  SET_PURCHASE_EXTRA_QUESTIONS,
  SET_SELECTED_EXTRA_QUESTIONS
} from "../actions/summit-actions";


const DEFAULT_STATE = {
    loading: true,
    purchaseSummit: {},
    selectedSummit: {
      refund_policy: null,
    },
    summits: [],
    suggestedSummits: []
};

const summitReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action;

    switch(type){
        case LOGOUT_USER:
            return DEFAULT_STATE;
        case START_LOADING:
            return {...state, loading: true};
            break;
        case STOP_LOADING:
            return {...state, loading: false};
            break;
        case GET_SUMMIT_BY_SLUG:
            let entity = payload.response ? {...payload.response} : {...payload};

            for(var key in entity) {
                if(entity.hasOwnProperty(key)) {
                    entity[key] = (entity[key] == null) ? '' : entity[key] ;
                }
            }
            // from now on, all shows/summits are marked as virtual
            if(payload.response) {
              let cachedSummits = [...new Set(state.summits.filter(s => s.id !== entity.id))];              
              return {...state, purchaseSummit: {...entity, is_virtual: true}, summits: [ ...cachedSummits, entity ]};
            }
            return {...state, purchaseSummit: {...entity, is_virtual: true}, summits: [ ...cachedSummits ]};
            break;
        case SUMMIT_NOT_FOUND:
            return {...state, purchaseSummit: {}};
        case SELECT_PURCHASE_SUMMIT:
            return {...state, purchaseSummit: payload };
        case GET_SUMMIT_BY_ID:
            let summit = payload.response;
            return {...state, summits: [ ...state.summits, summit ]};
        case SELECT_SUMMIT:
            // setting an empty value until the main extra questions are fetched
            payload.order_extra_questions = [];
            // from now on, all shows/summits are marked as virtual
            return {...state, selectedSummit: {...payload, is_virtual: true}};
            break;
        case GET_SUMMIT_REFUND_POLICY:
            return {...state, selectedSummit: { ...state.selectedSummit, refund_policy: payload.response}};
        case GET_SUGGESTED_SUMMITS:
            return {...state, suggestedSummits: payload.response.data};
        case SET_PURCHASE_EXTRA_QUESTIONS: {
            const mainOrderExtraQuestions = payload.response.data;
            return {...state, purchaseSummit: {...state.purchaseSummit, order_extra_questions: mainOrderExtraQuestions}}
        }
        case SET_SELECTED_EXTRA_QUESTIONS: {
            const mainOrderExtraQuestions = payload.response.data;
            return {...state, selectedSummit: {...state.selectedSummit, order_extra_questions: mainOrderExtraQuestions}}
        }
        default:
            return state;
            break;
    }
};

export default summitReducer

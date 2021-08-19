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

import { SET_CURRENT_STEP, SET_TOTAL_STEPS } from "../actions/wizzard-actions";

const DEFAULT_STATE = {
    totalSteps: 4,
    currentStep: 0,
};

const wizzardReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action;

    switch(type){
        case SET_CURRENT_STEP:
            return {...state, payload};
        case SET_TOTAL_STEPS:
            return {...state, payload};
        default:
            return state;
    }
};

export default wizzardReducer;

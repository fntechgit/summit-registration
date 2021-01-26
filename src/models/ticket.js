import TicketAssignForm from "../components/ticket-assign-form";

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

class TicketModel {

    constructor(dto, summit, now){
        this.dto = dto;
        this.summit = summit;
        this.now = now;
    }

    handlePastSummit(){
        let reassign_date = this.summit.reassign_ticket_till_date && this.summit.reassign_ticket_till_date < this.summit.end_date ? this.summit.reassign_ticket_till_date : this.summit.end_date;
        return this.now > reassign_date;
    }

    getStatus(){
        const status = [
            {
                text: 'UNASSIGNED',
                icon: 'fa-exclamation-circle',
                orderClass: 'unset',
                class: 'ticket-unset'
            },
            {
                text: 'REQUIRED DETAILS NEEDED',
                icon: 'fa-exclamation-circle',
                orderClass: 'warning',
                class: 'ticket-warning'
            },
            {
                text: 'READY TO USE',
                icon: 'fa-check-circle',
                orderClass: 'complete',
                class: 'ticket-complete'
            },
            {
                text: 'CANCELLED',
                orderClass: 'cancel',
                class: 'ticket-cancel'
            },
            {
                text: 'REFUND REQUESTED',
                icon: 'fa-fw',
                orderClass: 'cancel',
                class: 'ticket-cancel'
            },
            {
                text: 'REFUNDED',
                icon: 'fa-fw',
                orderClass: 'cancel',
                class: 'ticket-cancel'
            },
            {
                text: '',
                icon: 'fa-fw',
                orderClass: 'past',
                class: ''
            },
        ];
        if(this.dto.status === "Cancelled") {
            return status[3];
        }
        else if(this.dto.status === "RefundRequested") {
            return status[4];
        } else if (this.dto.status === "Refunded") {
            return status[5];
        } else if(this.dto.owner_id === 0) {
            return status[0];
        } else if(this.handlePastSummit()) {
            return status[6];
        } else if (!this.dto.owner.first_name || !this.dto.owner.last_name) {
            return status[1];
        } else if (this.dto.owner && this.dto.owner.status === "Complete") {
            return status[2];
        } else if (this.dto.owner && this.dto.owner.status === "Incomplete") {
            return status[1];
        };
    }

    validateExtraQuestions(extraQuestions) {

        let answeredQuestions = true;
        // we dont have extra questions
        if(extraQuestions.length == 0) return answeredQuestions;

        // iterate trough questions

        for (var eq of extraQuestions) {
            if(eq.mandatory){ // only check for mandatory questions ( skip optionals)
                // check if the user answered
                let findEq = this.dto.extra_questions.find(q => q.question_id == eq.id);
                if(!findEq){
                    // answer not found
                    answeredQuestions = false;
                    break;
                }
                // answer found
                switch(eq.type) {
                    case 'TextArea':
                    case 'Text':
                    case 'ComboBox':
                    case 'RadioButtonList':
                    case 'CheckBoxList':
                        answeredQuestions = findEq && findEq.answer != "" ? true : false;
                    break;
                    case 'CheckBox':
                        answeredQuestions = findEq && findEq.answer == "true" ? true : false;
                    break;
                    //case 'RadioButton': (dont think this one will be ever used; will discuss to be removed from admin) is always answered
                }
                if(!answeredQuestions){
                    break;
                }
            }
        }

        return answeredQuestions;
    }
}

export default TicketModel;
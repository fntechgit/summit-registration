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
import { connect } from 'react-redux';
import T from "i18n-react/dist/i18n-react";

import '../../styles/tickets-list-page.less';
import TicketList from '../../components/ticket-list';

import { getUserTickets, selectTicket, getTicketPDF, assignAtendee, handleTicketChange } from '../../actions/ticket-actions';

class TicketsListPage extends React.Component {

    componentWillMount() {    
        this.props.getUserTickets();
    }

    render() {
        let {tickets, selectTicket, getTicketPDF, assignAtendee, handleTicketChange} = this.props;
        console.log(tickets);
        return (
            <div>
                <TicketList 
                  tickets={tickets}
                  selectTicket={selectTicket}
                  getTicketPDF={getTicketPDF}                  
                  assignAtendee={assignAtendee}
                  handleTicketChange={handleTicketChange}
                />
            </div>
        );
    }
}

const mapStateToProps = ({ ticketState }) => ({
    tickets: ticketState.memberTickets
})
  
export default connect (
    mapStateToProps,
    {
      getUserTickets,
      selectTicket,
      getTicketPDF,
      assignAtendee,
      handleTicketChange
    }
)(TicketsListPage);
  
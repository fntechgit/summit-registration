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

import React from 'react';
import {withRouter} from 'react-router-dom';
import {Pagination} from 'react-bootstrap';
import T from 'i18n-react/dist/i18n-react';

import '../styles/orders-list-page.less';
import {daysBetweenDates, getFormatedDate} from '../utils/helpers';
import {checkout} from 'superagent';

class OrderList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};

        this.handleTicketCount = this.handleTicketCount.bind(this);
        this.handleOrderSelect = this.handleOrderSelect.bind(this);
        this.getSummitDate = this.getSummitDate.bind(this);
        this.getSummitName = this.getSummitName.bind(this);
        this.handleOrderStatus = this.handleOrderStatus.bind(this);
        this.handlePageChange = this.handlePageChange.bind(this);
        this.handlePastSummit = this.handlePastSummit.bind(this);

    }

    handleTicketCount(tickets, summitId) {
        let quantity = [];
        let {summits} = this.props;
        let summit = summits.find(s => s.id === summitId);

        tickets.map(t => {
            if (quantity.some(q => q.ticket_type_id === t.ticket_type_id)) {
                quantity.map(q => {
                    if (q.ticket_type_id === t.ticket_type_id) {
                        q.quantity++;
                        return q
                    }
                });
            } else {
                let ticketType = summit.ticket_types.find(q => q.id === t.ticket_type_id);
                if(ticketType) {
                    let name = ticketType.name;
                    let addTicket = {quantity: 1, name, ...t};
                    quantity.push(addTicket);
                }
            }
        });
        return quantity;
    }

    handleOrderSelect(order) {
        let {history, summits} = this.props;
        let summit = summits.find(s => s.id === order.summit_id);
        this.props.selectSummit(summit)
            .then(() => {
                this.props.selectOrder(order)
            }).then(() => {
            history.push('/a/member/orders/detail')
        });
    }

    handlePageChange(page) {
        this.props.pageChange(page);
    }

    handleOrderStatus(order) {

        const status = [
            {
                text: 'TICKET(S) ASSIGNED AND ISSUED',
                icon: 'fa-check-circle',
                orderClass: 'complete',
                class: 'order-complete'
            },
            {
                text: 'ADDITIONAL REQUIRED ATTENDEE DETAILS NEEDED BEFORE TICKET(S) CAN BE ISSUED',
                icon: 'fa-exclamation-circle',
                orderClass: 'warning',
                class: 'order-warning'
            },
            {
                text: 'PENDING CONFIRMATION',
                icon: 'fa-fw',
                orderClass: 'pending',
                class: 'order-pending'
            },
            {
                text: 'CANCELLED',
                icon: 'fa-fw',
                orderClass: 'cancel',
                class: 'order-cancel'
            },
            {
                text: 'PAYMENT ERROR',
                icon: 'fa-fw',
                orderClass: 'cancel',
                class: 'order-cancel'
            },
            {
                text: 'PAYMENT PROCESSING',
                icon: 'fa-fw',
                orderClass: 'pending',
                class: 'order-pending'
            },
            {
                text: '',
                icon: 'fa-fw',
                orderClass: 'past',
                class: ''
            }
        ];
        switch (order.status) {
            case "Paid":
                if (this.handlePastSummit(order)) {
                    return status[6]
                } else {
                    let incomplete = false;
                    order.tickets.map(t => {
                        if (!t.owner) {
                            incomplete = true;
                        } else if (t.owner && t.owner.status === "Incomplete") {
                            incomplete = true;
                        }
                    });
                    if (incomplete === false) {
                        return status[0];
                    } else {
                        return status[1];
                    };
                }
            case "Reserved":
                return status[2];
            case "Cancelled":
                return status[3];
            case "Error":
                return status[4];
            case "Confirmed":
                return status[5];
            default:
                return null;
        }
    }

    handlePastSummit(order) {
        let {summits, now} = this.props;
        let summit = summits.find(s => s.id === order.summit_id);
        let reassign_date = summit.reassign_ticket_till_date && summit.reassign_ticket_till_date < summit.end_date ? summit.reassign_ticket_till_date : summit.end_date;
        return now > reassign_date ? true : false;
    }

    getSummitName(order) {
        let {summits} = this.props;
        let name = summits.find(s => s.id === order.summit_id).name;
        return name;
    }

    getSummitDate(order) {
        let {summits} = this.props;
        let summit = summits.find(s => s.id === order.summit_id);
        let dateRange = daysBetweenDates(summit.start_date, summit.end_date, summit.time_zone_id);
        if (dateRange.length > 1) {
            let startDate = getFormatedDate(dateRange[0], summit.time_zone_id);
            let endDate = getFormatedDate(dateRange[dateRange.length - 1], summit.time_zone_id);
            let startMonth = startDate.split(' ')[0];
            let endMonth = endDate.split(' ')[0];
            if (startMonth === endMonth) endDate = endDate.substr(endDate.indexOf(" ") + 1);
            let startYear = startDate.substring(startDate.length, startDate.length - 4);
            let endYear = endDate.substring(endDate.length, endDate.length - 4);
            if (startYear === endYear) startDate = startDate.substring(0, startDate.length - 6);
            endDate = endDate.substring(0, endDate.length - 6) + ', ' + endDate.substring(endDate.length - 4);
            let summitDate = `${startDate} - ${endDate}`;
            return summitDate;
        } else {
            let summitDate = getFormatedDate(summit.start_date, summit.time_zone_id);
            return summitDate;
        }
    }

    render() {

        let {currentPage, lastPage, loading, orders} = this.props;

        if (orders.length > 0 && !loading) {
            return (
                <div className="orders-list">
                    {orders.map(o => {
                        return (
                            <React.Fragment key={o.id}>
                                <div className="order-list-desktop" onClick={() => this.handleOrderSelect(o)}>
                                    <div
                                        className={`order ${this.handleOrderStatus(o).orderClass} p-2 col-sm-8 col-sm-offset-2`}>
                                        <div className="col-sm-1">
                                            <i className={`fa fa-2x ${this.handleOrderStatus(o).icon} ${this.handleOrderStatus(o).class}`}></i>
                                        </div>
                                        <div className="col-sm-5">
                                            <h4>{this.getSummitName(o)} <br/> {this.getSummitDate(o)}</h4>
                                            <p className={`status ${this.handleOrderStatus(o).class}`}>{this.handleOrderStatus(o).text}</p>
                                        </div>
                                        <div className="col-sm-4">
                                            <h5>{T.translate("orders.purchased")} {getFormatedDate(o.created)}</h5>
                                            <ul>
                                                {this.handleTicketCount(o.tickets, o.summit_id).map(t => {
                                                    return (
                                                        <li key={t.ticket_type_id}>
                                                            x{t.quantity} {t.name}
                                                        </li>
                                                    )
                                                })}
                                            </ul>
                                            <ul>
                                                {o.number}
                                            </ul>
                                        </div>
                                        <div className="col-sm-2">
                                            <h4>$ {o.amount}</h4>
                                        </div>
                                    </div>
                                </div>
                                <div className="order-list-mobile" onClick={() => this.handleOrderSelect(o)}>
                                    <div
                                        className={`order ${this.handleOrderStatus(o).orderClass} p-2 col-sm-8 col-sm-offset-2`}>
                                        <div className="col-sm-1">
                                            <i className={`fa fa-2x ${this.handleOrderStatus(o).icon} ${this.handleOrderStatus(o).class}`}></i>
                                        </div>
                                        <div className="col-sm-7">
                                            <h4>{this.getSummitName(o)}</h4>
                                            <ul>
                                                {this.handleTicketCount(o.tickets, o.summit_id).map((t, i) => {
                                                    if (i < 1) {
                                                        return (
                                                            <li key={t.ticket_type_id}>
                                                                x{t.quantity} {t.name} ...
                                                            </li>
                                                        )
                                                    }
                                                })}
                                            </ul>
                                            <p className={`status ${this.handleOrderStatus(o).class}`}>{this.handleOrderStatus(o).text}</p>
                                        </div>
                                        <div className="col-sm-4">
                                            <h4>$ {o.amount}</h4>
                                        </div>
                                    </div>
                                </div>
                            </React.Fragment>
                        )
                    })}
                    <div className="footer-pagination">
                        <Pagination
                            bsSize="medium"
                            prev
                            next
                            first
                            last
                            ellipsis
                            boundaryLinks
                            maxButtons={10}
                            items={lastPage}
                            activePage={currentPage}
                            onSelect={this.handlePageChange}
                        />
                    </div>
                </div>
            )
        } else {
            return (
                <div className="mt-5 p-5">
                    <div className="row">
                        <div className="col-sm-12 mt-5 text-center">
                            <i className="fa fa-5x fa-inbox"></i>
                            <h5>{T.translate("orders.empty")}</h5>
                        </div>
                    </div>
                </div>
            )
        }
    }
}

export default withRouter(OrderList);

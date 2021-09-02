import moment from "moment-timezone";
import URI from "urijs";
import store from '../store';

export const daysBetweenDates = (startDate, endDate, timezone) => {
	let startDay = moment(startDate * 1000).tz(timezone)
	let endDay = moment(endDate * 1000).tz(timezone)

	// Add day one
	let dates = [startDay.clone().unix()]

	// Add all additional days
	while(startDay.add(1, 'days').diff(endDay) < 0) {
		dates.push(startDay.clone().unix())
	}
	return dates
}

export const getDayNumberFromDate = (days, date) => {
	let dayNumber
	days.find((d, index)=>{
		if(d == date){
			dayNumber = index + 1
		}})
	return dayNumber
}

export const getFormatedDate = (datetime, time_zone = false) => {
	
	if(time_zone){
		let formattedTime = moment.unix(datetime)
		return moment.tz(datetime * 1000, time_zone).format('MMMM DD, YYYY')
	}
	return moment.unix(datetime).format('MMMM DD, YYYY')
}

export const getFormatedTime = (datetime, time_zone = false) => {
	
	if(time_zone){
		// let formattedTime = moment.unix(datetime).format()
		return moment.tz(datetime * 1000, time_zone).format('HH:mm')
	}
	return moment.unix(datetime).format('HH:mm')
}

export const getBackURL = (slugReplacement) => {
	let defaultLocation = '/a/member/orders';
	let url      = URI(window.location.href);
	let location = url.pathname();
	if (location === '/') {
		location = defaultLocation;
	}
	// if we are at invitation url , dont replace slug
	const isInvitationUrl = location.includes("/a/invitations");
	// todo: this regex is very vague we need to be more specific on what to replace
	// otherwise could lead to bugs
	if (slugReplacement && !isInvitationUrl) {
		location = location.replace(/\/[^\/]*$/, `/${slugReplacement}`);
	}

	let query    = url.search(true);
	let fragment = url.fragment();
	let backUrl  = query.hasOwnProperty('BackUrl') ? query['BackUrl'] : location;
	if (fragment != null && fragment !== '') {
		backUrl += `#${fragment}`;
	}
	return backUrl;
}

export const getMarketingValue = (key) => {
	const {baseState} = store.getState();
	const {marketingSettings} = baseState;

	if (!marketingSettings) return null;
	const setting = marketingSettings.find(s => s.key === key);

	if (!setting) return null;

	switch (setting.type) {
		case 'FILE':
			return setting.file;
		case 'TEXT':
			return setting.value;
		case 'TEXTAREA':
			return setting.value;
	}
};

export const setFavIcon = (favIconUrl) => {
	const icon = document.getElementById('favicon');
	if(icon && favIconUrl)
		icon.href = favIconUrl;
}
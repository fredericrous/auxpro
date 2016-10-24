
let STATUS = {
	ACCEPTED: {
		bsStyle: 'success'
	},
	REJECTED: {
		bsStyle: 'danger'
	},
	PENDING: {
		bsStyle: 'info'
	},
	EXPIRED: {
		bsStyle: 'default'
	}
}

export default class OffersHelper {

	static getBsStyle(status) {
		let s = STATUS[status];
		if (s) {
			return STATUS[status].bsStyle;
		} 
	}
}
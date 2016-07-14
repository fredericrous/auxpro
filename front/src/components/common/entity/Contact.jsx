// lib modules
import React from 'react';
import moment from 'moment';
// custom modules
import Utils from '../../../utils/Utils.js'
// custom components
import Address from './Address.jsx'
import FormInput from '../form/FormInput.jsx'

class Contact extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {};
	}

	notify() {
		if (this.props.onChange) {
			this.props.onChange({
				address: this.state.address || this.props.address || '',
				phone: this.state.phone || this.props.phone || '',
				email: this.state.email || this.props.email || ''
			});
		}
		this.setState(this.state);
	}

	onAddressChanged(value) {
    	this.state.address = value;
    	this.notify();
    }
	onPhoneChanged(value) {
		this.state.phone = value;
		this.notify();
	}
	onEmailChanged(value) {
		this.state.email = value;
		this.notify();
	}

	render() {
		return (
		<div>
			<Address 
				edit={this.props.edit}
				address={this.props.address ? this.props.address.address : null}
				city={this.props.address ? this.props.address.city : null}
				postalCode={this.props.address ? this.props.address.postalCode : null}
				country={this.props.address ? this.props.address.country : null}
				onChange={this.onAddressChanged.bind(this)}/>
			<FormInput 
				static={!this.props.edit}
				title='Téléphone'
				defaultValue={this.props.phone} 
				onChange={this.onPhoneChanged.bind(this)}/>
			<FormInput 
				static={!this.props.edit}
				title='Addresse électronique'
				defaultValue={this.props.email} 
				onChange={this.onEmailChanged.bind(this)}/>
		</div>
		);
	}
}

export default Contact;
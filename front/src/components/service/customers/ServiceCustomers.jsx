// lib modules
import React from 'react';
import { Panel, Button, Row, Col, Modal } from 'react-bootstrap';
// core modules
import Dispatcher from '../../../core/Dispatcher';
import StoreRegistry from '../../../core/StoreRegistry';
// custom components
import CustomerDetails from '../../common/customers/CustomerDetails.jsx';
import CustomerSummaryList from '../../common/customers/CustomerSummaryList.jsx';
import DialogConfirmation from '../../common/dialog/DialogConfirmation.jsx';
import ButtonsEndDialog from '../../common/ButtonsEndDialog.jsx';

let STATES = {
	LIST: 'LIST',
	ADD: 'ADD',
	VIEW: 'VIEW',
	EDIT: 'EDIT'
}

class ServiceCustomers extends React.Component {
	
	constructor(props) {
		super(props);
	    this.state = {};
	}

    switchState(state) {
    	return function() {
			//this.state.state = state || STATES.LIST;
			this.setState({ state: state || STATES.LIST });
		}.bind(this);
    }

    onCancel() {
    	this.state.currentCustomer = null;
    	this.switchState()();
    }

    onAddCustomer(customer) {
    	this.state.currentCustomer = null;
    	this.switchState(STATES.ADD)();
    }
    onEditCustomer(customer) {
    	this.state.currentCustomer = customer;
    	this.switchState(STATES.EDIT)();
    }
    onViewCustomer(customer) {
    	this.state.currentCustomer = customer;
    	this.switchState(STATES.VIEW)();
    }
    onDeleteCustomer(customer) {
    	this.state.currentCustomer = customer;
    	this.state.showDeleteConfirm = true;
    	this.setState(this.state);
    }
    hideDeleteConfirmation() {
    	this.setState({showDeleteConfirm: false});
    }  

    onCustomerChange(customer) {
    	console.log(customer)
    	this.state.customer = customer;
    }

    deleteCustomer() {
    	this._issueCustomerAction('DELETE_SERVICE_CUSTOMER');
    	this.hideDeleteConfirmation();
    }
    editCustomer() {
    	this._issueCustomerAction('PUT_SERVICE_CUSTOMER');
    }
    saveCustomer() {
    	this._issueCustomerAction('POST_SERVICE_CUSTOMER');
    }

    _issueCustomerAction(action) {
    	let user = StoreRegistry.getStore('LOGIN_STORE').getData('/');
    	this.state.customer.serviceId = user.id;
    	this.state.customer.id = this.state.currentCustomer ? this.state.currentCustomer.id : null;
    	let args = {
    		serviceId: user.id,
    		customerId: this.state.customer.id,
			token: user.token,
			data: this.state.customer
    	}
    	Dispatcher.issue(action, args).
    	then(function () {
    		Dispatcher.issue('GET_SERVICE_CUSTOMERS', args);
    	}).
    	then(function() {
    		this.switchState(STATES.LIST)();
    	}.bind(this)).
    	catch(function(error) {
    		console.log(error);
    	});    	
    }

	render() {
		switch (this.state.state) {
			case STATES.VIEW: return (
				<Panel header={(<strong>Détails client</strong>)}>
					<CustomerDetails edit={false} customer={this.state.currentCustomer}/>
					<br/>
					<Row>
						<Col lg={12}>
							<Button bsStyle='primary' onClick={this.onCancel.bind(this)} block>Retour</Button>
						</Col>
					</Row>
				</Panel>
			);
			case STATES.ADD: return (
				<Panel header={(<strong>Saisir nouveau client</strong>)}>
					<CustomerDetails edit={true} customer={this.state.currentCustomer} onChange={this.onCustomerChange.bind(this)}/>
					<br/>
					<ButtonsEndDialog 
						onOk={this.saveCustomer.bind(this)} okTitle='Creer client' 
						onCancel={this.onCancel.bind(this)} cancelTitle='Annuler'/>
				</Panel>
			);
			case STATES.EDIT: return (
				<Panel header={(<strong>Modifier informations client</strong>)}>
					<CustomerDetails edit={true} customer={this.state.currentCustomer} onChange={this.onCustomerChange.bind(this)}/>
					<br/>
					<ButtonsEndDialog 
						onOk={this.editCustomer.bind(this)} okTitle='Enregistrer modifications' 
						onCancel={this.onCancel.bind(this)} cancelTitle='Annuler'/>
				</Panel>
			);
			default: 
				return (
					<div>
						<Panel header={(<strong>Clients enregistrés</strong>)}>
							<Button block bsStyle='info' onClick={this.onAddCustomer.bind(this)}>Saisir nouveau client</Button>
							<br/>
							<CustomerSummaryList 
								customers={this.props.customers} 
								onEdit={this.onEditCustomer.bind(this)}
								onView={this.onViewCustomer.bind(this)}
								onDelete={this.onDeleteCustomer.bind(this)}/>
						</Panel>
						<DialogConfirmation
							show={this.state.showDeleteConfirm}
							title='Supprimer client ?'
							onConfirm={this.deleteCustomer.bind(this)}
							confirmStyle='danger'
							confirmText='Supprimer'
							onCancel={this.hideDeleteConfirmation.bind(this)}
							cancelStyle='default'
							cancelText='Annuler'/>
						
					</div>
				);
		}
	}
}

export default ServiceCustomers;
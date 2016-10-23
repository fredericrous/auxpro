// lib modules
import React from 'react';
import { Panel, Button, Row, Col, Modal } from 'react-bootstrap';
// core modules
import Dispatcher from 'core/Dispatcher';
import StoreRegistry from 'core/StoreRegistry';
// custom components
import CustomerDetails from 'components/common/customers/CustomerDetails.jsx';
import CustomerSummaryList from 'components/common/customers/CustomerSummaryList.jsx';
import ServiceHeader from '../ServiceHeader.jsx';
import DialogConfirmation from 'components-lib/DialogConfirmation/DialogConfirmation.jsx';
import ButtonsEndDialog from 'components-lib/ButtonsEndDialog/ButtonsEndDialog.jsx';

let STATES = {
	LIST: 'LIST',
	ADD: 'ADD',
	VIEW: 'VIEW',
	EDIT: 'EDIT'
}

class ServiceCustomers extends React.Component {
	
	constructor(props) {
		super(props);
        this.state = {
			customers: StoreRegistry.getStore('SERVICE_STORE').getData('/data/customers')
			};
	}
	
	componentDidMount() {
		StoreRegistry.register('SERVICE_STORE', this, this.onStoreUpdate.bind(this));
	}


	componentWillUnmount() {
		StoreRegistry.unregister('SERVICE_STORE', this);   
	}
	
	onStoreUpdate() {
		this.setState({
			customers: StoreRegistry.getStore('SERVICE_STORE').getData('/data/customers')
		});

    }

    onCancel() {
    	this.setState({ 
    		currentCustomer: null,
    		state: STATES.LIST 
    	});
    }

    onAddCustomer(customer) {
    	this.setState({ 
    		currentCustomer: null,
    		state: STATES.ADD 
    	});
    }
    onEditCustomer(customer) {
    	this.setState({ 
    		currentCustomer: customer,
    		state: STATES.EDIT 
    	});
    }
    onViewCustomer(customer) {
    	this.setState({ 
    		currentCustomer: customer,
    		state: STATES.VIEW 
    	});
    }
    onDeleteCustomer(customer) {
    	this.setState({ 
    		currentCustomer: customer,
    		showDeleteConfirm: true
    	});
    }
    hideDeleteConfirmation() {
    	this.setState({
    		showDeleteConfirm: false
    	});
    }  

    onCustomerChange(customer) {
    	this.state.customer = customer;
    }

    deleteCustomer() {
    	this._issueCustomerAction('DELETE_CUSTOMER');
    	this.hideDeleteConfirmation();
    }
    editCustomer() {
    	this._issueCustomerAction('PUT_CUSTOMER');
    }
    saveCustomer() {
    	this._issueCustomerAction('POST_CUSTOMER');
    }

    _issueCustomerAction(action) {
    	let user = StoreRegistry.getStore('LOGIN_STORE').getData('/');
    	this.state.customer = this.state.customer || {};
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
    		this.setState({ 
	    		currentCustomer: null,
	    		state: STATES.LIST
	    	});
    	}.bind(this)).
    	catch(function(error) {
    		console.log(error);
    	});
    }

	render() {
		var content;
		switch (this.state.state) {
			case STATES.VIEW: content = (
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
			case STATES.ADD: content = (
				<Panel header={(<strong>Saisir nouveau client</strong>)}>
					<CustomerDetails edit={true} customer={this.state.currentCustomer} onChange={this.onCustomerChange.bind(this)}/>
					<br/>
					<ButtonsEndDialog 
						onOk={this.saveCustomer.bind(this)} okTitle='Creer client' 
						onCancel={this.onCancel.bind(this)} cancelTitle='Annuler'/>
				</Panel>
			);
			case STATES.EDIT: content = (
				<Panel header={(<strong>Modifier informations client</strong>)}>
					<CustomerDetails edit={true} customer={this.state.currentCustomer} onChange={this.onCustomerChange.bind(this)}/>
					<br/>
					<ButtonsEndDialog 
						onOk={this.editCustomer.bind(this)} okTitle='Enregistrer modifications' 
						onCancel={this.onCancel.bind(this)} cancelTitle='Annuler'/>
				</Panel>
			);
			default: content = (
				<div>
					<Panel header={(<strong>Clients enregistrés</strong>)}>
						<Button block bsStyle='info' onClick={this.onAddCustomer.bind(this)}>Saisir nouveau client</Button>
						<br/>
						<CustomerSummaryList 
							customers={this.state.customers} 
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
		return (
            <div>
                <div>
                    {content}
                </div>
            </div>
        );
	}
}

export default ServiceCustomers;
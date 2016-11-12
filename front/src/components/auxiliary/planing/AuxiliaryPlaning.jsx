import React from 'react'
import moment from 'moment'
import { Row, Col, Button, Panel, Form } from 'react-bootstrap'
// Core modules
import Dispatcher from 'core/Dispatcher'
import StoreRegistry from 'core/StoreRegistry'
// Custom components
import AuxiliaryBaseComponent from 'components/auxiliary/AuxiliaryBaseComponent'
import AuxiliaryPlaningInformation from 'components/auxiliary/planing/AuxiliaryPlaningInformation'
import APPanelBasic from 'components-lib/Panel/APPanelBasic'
import Calendar from 'components-lib/calendar/Calendar'
import FormSelect from 'components-lib/Form/FormSelect'
// Lib modules
import MomentHelper from 'utils/moment/MomentHelper'
import MissionStatus from 'utils/constants/MissionStatus'
import InterventionHelper from 'utils/entities/InterventionHelper'
import IndisponibilityHelper from 'utils/entities/IndisponibilityHelper'
import Period from 'utils/constants/Period'
import { DAYS } from 'utils/moment/Days'
import Utils from 'utils/Utils'

moment.locale('fr');

class AuxiliaryPlaning extends AuxiliaryBaseComponent {
	
	constructor(props) {
		super(props);
		this.state = {};
		this.state = this._buildState();
		this.state.selected = MomentHelper.toLocalDate(moment());
		this.state.customerFilter = '__ALL__';
		this.state.serviceFilter = '__ALL__';
		this.state.showIndisponibilities = true;
		this.state.showMissions = true;
	}


	// State Management functions //
	// --------------------------------------------------------------------------------

	componentDidMount() {
	 	StoreRegistry.register('AUXILIARY_STORE', this, this._onStoreUpdate.bind(this));
	}
	componentWillUnmount() {
		StoreRegistry.unregister('AUXILIARY_STORE', this);
	}
	_onStoreUpdate() {
		this.setState(this._buildState());
	}
	_buildState() {
		let missions = this.getMissions();
		return {
			interventions: this.getInterventions(),
			services: this.getServices(),
			customers: this.getCustomers(),
			missions: missions,
			filteredMissions: this._getFilteredMission(missions),
			indisponibilities: this.getIndisponibilities()
		};
	}
	
	_getFilteredMission(missions) {
		return Utils.filter(missions, function(mission) {
			let status = MissionStatus.getStatus(mission.status);
			if (this.state.missionFilter && this.state.missionFilter !== '__ALL__' && this.state.missionFilter !== status) {
				return false;
			}
			let intervention = this.getIntervention(mission.interventionId);
			if (this.state.customerFilter && this.state.customerFilter !== '__ALL__' && this.state.customerFilter !== intervention.customerId) {
				return false;
			}
			if (this.state.serviceFilter && this.state.serviceFilter !== '__ALL__' && this.state.serviceFilter !== intervention.serviceId) {
				return false;
			}
			return true;
		}.bind(this))
	}

	_filterMissions(status) {
		return (this.state.filteredMissions || []).
		filter(function (mission) {
			return MissionStatus.getStatus(mission.status) === status;
		});
	}


	// Callback functions //
	// --------------------------------------------------------------------------------

	onDaySelect(day) {
		this.setState({ selected: day });
	}
	onPrint() {
		window.print();
	}
	addAbsence() {
		let params = { 
			auxiliaryId: StoreRegistry.getStore('LOGIN_STORE').getData('/id'),
			token: StoreRegistry.getStore('LOGIN_STORE').getData('/token'),
			data: {
				auxiliaryId: StoreRegistry.getStore('LOGIN_STORE').getData('/id'),
				oneTime: {
					date: this.state.selected,
					startTime: [0, 0],
					endTime: [23, 59]
				}
				
			}
		};
		Dispatcher.issue('POST_INDISPONIBILITY', params).
		then(function() {
			delete params.data;
			Dispatcher.issue('GET_AUXILIARY_INDISPONIBILITIES', params);
		});
	}
	showMissions(show) {
		this.setState({ showMissions: show })
	}
	showIndisponibilities(show) {
		this.setState({ showIndisponibilities: show })
	}
	filterMissions(missionStatus) {
		let status = missionStatus
		if (status !== '__ALL__') {
			status = MissionStatus.getStatus(status)
		}
		this.state.missionFilter = status;
		this.setState({ 
			filteredMissions: this._getFilteredMission(this.state.missions)
		});
	}
	filterServices(serviceId) {
		this.state.serviceFilter = serviceId;
		this.setState({ 
			filteredMissions: this._getFilteredMission(this.state.missions)
		});
	}
	filterCustomers(customerId) {
		this.state.customerFilter = customerId;
		this.setState({ 
			filteredMissions: this._getFilteredMission(this.state.missions)
		});
	}


	// Rendering functions //
	// --------------------------------------------------------------------------------

	// Builds the list of missions to display on the planning
	_buildMissionsPlanned() {
		return this._filterMissions(MissionStatus.PENDING).map(this.__buildMission.bind(this));
	}
	_buildMissionsCanceled() {
		return this._filterMissions(MissionStatus.CANCELED).map(this.__buildMission.bind(this));
	}
	_buildMissionsCompleted() {
		return this._filterMissions(MissionStatus.COMPLETED).map(this.__buildMission.bind(this));
	}
	__buildMission(mission) {
		let intervention = this.state.interventions[mission.interventionId];
		return {
			date: mission.date,
			startTime: intervention.startTime,
			endTime: intervention.endTime
		}
	}
	// Builds the list of absences to display on the planning
	_buildIndisponibilities() {
		
		if (this.state.showIndisponibilities) {
			return this.state.indisponibilities.absences;
		}
		return [];
	}
	// Builds a list of services for filtering
	_buildServicesValues() {
		let servicesValues = Utils.map(this.state.services, function (service) {
			return {
				key: service.id,
				value: service.socialReason
			}
		});
		servicesValues.unshift({
			key: '__ALL__',
			value: 'Tous'
		});
		return servicesValues;
	}
	// Builds a list of customers for filtering
	_buildCustomersValues() {
		let customersValues = Utils.map(this.state.customers, function (customer) {
			var name = customer.civility + ' ' + customer.lastName;
			return {
				key: customer.id,
				value: name
			}
		});
		customersValues.unshift({
			key: '__ALL__',
			value: 'Tous'
		});
		return customersValues;
	}
	// Builds a list of missions status for filtering
	_buildMissionsValues() {
		let missionsValues = MissionStatus.STATUSES;
		missionsValues.unshift({
			key: '__ALL__',
			value: 'Toutes'
		});
		return missionsValues;
	}
	//
	_buildTotalHours() {
		let result = [0, 0];
		let l = this.state.filteredMissions.length;
		for (let i = 0; i < l; i++) {
			let mission = this.state.filteredMissions[i];
			let intervention = this.getIntervention(mission.interventionId);
			let source = intervention.oneTime || intervention.recurence;
			let hours = source.endTime[0] - source.startTime[0];
			let minutes = source.endTime[1] - source.startTime[1];
			result[0] += hours;
			if (minutes < 0) {
				result[0] -= 1;
				result[1] += (60 + minutes);
			} else {
				result[1] += minutes;
			}
			if (result[1] >= 60) {
				result[0] += 1;
				result[1] = result[1] % 60;
			}
		}
		return result[0] + 'h' + result[1];
	}

	//
	_buildInformations() {
		let result = [];
		if (this.state.selected) {
			let absences = this.getIndisponibilities().absences;
			let l = absences.length;
			for (let i =0; i < l; i++) {
				let absence = absences[i];
				if (MomentHelper.localDateEquals(this.state.selected, absence.date)) {
					result.push(
						<APPanelBasic 
							key={'indispo-' + i}
							bsStyle='warning'
							title='Indisponibilité'
							text={IndisponibilityHelper.getInitialText(this.getIndisponibility(absence.indisponibilityId))}/>
					);
				}
			}
			l = this.state.filteredMissions.length;
			for (let i =0; i < l; i++) {
				let mission = this.state.filteredMissions[i];
				let status = MissionStatus.getStatus(mission.status);

				if (MomentHelper.localDateEquals(this.state.selected, mission.date)) {
					let intervention = this.getIntervention(mission.interventionId);
					let customer= this.getCustomer(intervention.customerId);
					let service = this.getService(intervention.serviceId);
					let text = InterventionHelper.getInitialText(intervention);
					text.push('Chez ' + customer.civility + ' ' + customer.lastName + ' ' + customer.firstName);
					text.push(customer.address);
					text.push(customer.postalCode + ' ' + customer.city);
					text.push('Pour ' + service.socialReason);
					result.push(
						<APPanelBasic 
							key={'mission-' + i}
							bsStyle={status.bsStyle}
							title={'Mission ' + status.value}
							text={text}/>
					);
				}
			}
		}
		return result;
	}

	render() { return (
		<Row>
			<Col sm={2} md={2} lg={3}>
				<Panel header="Actions" className='no-print'>
					<Button block className='wrap' bsStyle='info' bsSize='small' onClick={this.onPrint.bind(this)}>Imprimer mon planning</Button>
					<br/><p>Afficher mon planning par type de:</p>
					<Form horizontal>
						<FormSelect 
							edit={true}
							title='Clients' 
							placeholder='<Tous>' 
							defaultValue='__ALL__'
							values={this._buildCustomersValues()}
							onChange={this.filterCustomers.bind(this)}/>
						<FormSelect 
							edit={true}
							title='SAD' 
							placeholder='<Tous>' 
							defaultValue='__ALL__'
							values={this._buildServicesValues()}
							onChange={this.filterServices.bind(this)}/>
						<FormSelect 
							edit={true}
							title='Missions' 
							placeholder='<Tous>' 
							defaultValue='__ALL__'
							values={this._buildMissionsValues()}
							onChange={this.filterMissions.bind(this)}/>
						</Form>
						<p>{'Total heures interventions : ' + this._buildTotalHours()}</p><br/>
					<Button block bsStyle='warning' bsSize='small' onClick={this.addAbsence.bind(this)}>Ajouter une absence</Button>
				</Panel>
			</Col>
			<Col sm={8} md={7} lg={5}>
				<Panel header={'Planning mensuel - '}>
					<Calendar 
						moment={MomentHelper.toLocalDate(moment())}
						selected={this.state.selected}
						specialsInfo={this._buildMissionsPlanned()}
						specialsDanger={this._buildMissionsCanceled()}
						specialsSuccess={this._buildMissionsCompleted()}
						specialsWarning={this._buildIndisponibilities()}
						onDaySelect={this.onDaySelect.bind(this)} />
				</Panel>
			</Col>
			<Col sm={2} md={3} lg={4}>
				{this._buildInformations()}
			</Col>
		</Row>
	);}
}

/*
<AuxiliaryPlaningInformation
					date={this.state.selected}
					indisponibilities={this.state.indisponibilities}
					interventions={this.state.interventions}
					offers={this.state.offers} />
*/

export default AuxiliaryPlaning;

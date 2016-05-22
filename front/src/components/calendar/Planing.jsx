// react modules
import React from 'react'
// react-bootstrap modules
import { Grid, Row, Col, Button, ListGroup, ListGroupItem, Panel } from 'react-bootstrap';
// core modules
import Dispatcher from '../../core/Dispatcher';
import StoreRegistry from '../../core/StoreRegistry';
// custom components
import Calendar from '../calendar/Calendar.jsx';
// customs modules
import DateDay from '../../utils/date/DateDay.js';
import PlaningHelper from '../../utils/planing/PlaningHelper.js';

class Planing extends React.Component {
	
	constructor(props) {
		super(props);
		var user = StoreRegistry.getStore('LOGIN_STORE').getData('/');
		
		this.state = {
			day: new DateDay(new Date()),
			planing: new PlaningHelper()
		}		

		let params = { 
			id: user.id,
			token: user.token
		};
        Dispatcher.issue('GET_AUXILIARY_MISSIONS', params);
        Dispatcher.issue('GET_AUXILIARY_ABSENCES', params);

        this.loadAuxiliary();
	}

	componentDidMount() {
        StoreRegistry.register('AUXILIARY_STORE', this, this.onAuxiliaryUpdate.bind(this));
    }

    componentWillUnmount() {
        StoreRegistry.unregister('AUXILIARY_STORE', this);   
    }

    onAuxiliaryUpdate() {
    	this.loadAuxiliary();
		this.setState(this.state);
    }

    loadAuxiliary() {
    	var user = StoreRegistry.getStore('LOGIN_STORE').getData('/');
    	var aux = StoreRegistry.getStore('AUXILIARY_STORE').getData('/auxiliary/' + user.id);
		var missions = aux.missions || [];
    	var absences = aux.absences || [];
		this.planing = new PlaningHelper({});
		for (var i = 0; i < missions.length; i++) {
			var date = new Date(missions[i].date);
			missions[i].style = 'success';
			this.planing.pushDay(date.getFullYear(), date.getMonth(), date.getDate(), missions[i]);
		}
		for (var i = 0; i < absences.length; i++) {
			var date = new Date(absences[i].date);
			absences[i].style = 'warning';
			this.planing.pushDay(date.getFullYear(), date.getMonth(), date.getDate(), absences[i]);
		}
		this.state.planing = this.planing;
    }

	onDaySelect(day) {
		this.state.day = day;
		this.setState(this.state);
	}
	
	addAbsence() {
		var user = StoreRegistry.getStore('LOGIN_STORE').getData('/');
		let params = { 
			id: user.id,
			token: user.token,
			data: {
				startHour: 0,
				endHour: 24,
				date: this.state.day.date.getTime()
			}
		};
        Dispatcher.issue('POST_AUXILIARY_ABSENCE', params).
        then(function() {
        	delete params.data;
        	Dispatcher.issue('GET_AUXILIARY_ABSENCES', params)
        });
	}

	render() { 
		var date = this.state.day.date;
		var stuff = this.planing.getForDay(date.getFullYear(), date.getMonth(), date.getDate()) || [];
		var days = stuff.map(function(day) {
			var title = (day.style==='success')?'Mission:':((day.style==='warning')?'Absence:':'');
			var key = day.id + '-' + day.startHour + '-' + day.endHour;
			var duration = day.endHour - day.startHour;
            return (
                <ListGroupItem key={key}>
                	{title}<br/>
                	Le {this.state.day.value} de {day.startHour}h à {day.endHour}h<br/>
                	Nombre d'heures : {duration}h
                </ListGroupItem>
            );
        }.bind(this));
		return (
		<Grid>
			<Row>
				<Col sm={2} md={2} lg={3}>
					<Panel header="Actions">
						<Button block bsStyle='warning' bsSize='small' onClick={this.addAbsence.bind(this)}>Ajouter une absence</Button>
					</Panel>
				</Col>
				<Col sm={8} md={7} lg={5}>
					<Calendar onDaySelect={this.onDaySelect.bind(this)} planing={this.state.planing}/>
	    		</Col>
	    		<Col sm={2} md={3} lg={4}>
	    			<Panel header="Informations">
	    				<ListGroup>
	    					{days}
	    				</ListGroup>
	    			</Panel>
	    		</Col>
	    	</Row>
	    </Grid>
		);
	}
}

export default Planing;
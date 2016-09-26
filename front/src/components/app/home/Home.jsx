import React from 'react';

import Dispatcher from 'core/Dispatcher';
import StoreRegistry from 'core/StoreRegistry';

import AuxiliaryHome from 'components/auxiliary/AuxiliaryHome.jsx'
import ServiceHome from 'components/service/ServiceHome.jsx'
import GuestHome from 'components/guest/GuestHome.jsx'

class Home extends React.Component {

	constructor(props) {
		super(props);
	}
	
	componentWillMount() {
        let logged = StoreRegistry.getStore('LOGIN_STORE').getData('/logged');
		if (!logged) {
			this.context.router.push('/login');
		}
    }

	render() {
		console.log('home')
		console.log(this.props)
		let type = StoreRegistry.getStore('LOGIN_STORE').getData('/type');
		switch (type) {
			case 'sad'  : return(<ServiceHome nav={this.props.params.nav} query={this.props.location.query}/>);
			case 'aux'  : return(<AuxiliaryHome nav={this.props.params.nav} query={this.props.location.query}/>);
			case 'admin': return(<GuestHome/>);
			case 'guest': return(<GuestHome/>);
			default: return (
				<div className='container'>
					Problème d'authentification
				</div>
			);
		}
	}
}

Home.contextTypes = {
	router: React.PropTypes.object
}

export default Home;


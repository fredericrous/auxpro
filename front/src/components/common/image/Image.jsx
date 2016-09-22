import React from 'react';

import Dispatcher from 'core/Dispatcher';
import StoreRegistry from 'core/StoreRegistry';

class Image extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {};
		let params = {
			image: {this.props.src},
			token: StoreRegistry.getStore('LOGIN_STORE').getData('/token')
		}
		Dispatcher.issue('GET_IMAGE', params);
	}

	componentDidMount() {
	 	StoreRegistry.register('APP_STORE', this, this.onStoreUpdate.bind(this));
    }
    
    componentWillUnmount() {
        StoreRegistry.unregister('APP_STORE', this);   
    }

	onStoreUpdate() {
		let source = StoreRegistry.getStore('APP_STORE').getData('/images/' + this.props.src)
		if (source) {
			this.setState({ 
				source: btoa(String.fromCharCode.apply(null, new Uint8Array(source))) 
			});
		}
    }

	render() {
		if (this.state.source) {
			return ( <img src={'data:image;base64,' + this.state.source} height="200" width="200"/> );
		}
		return <div/>;
	}
}

export default Image;
// Import React core
import React from 'react';

class AuxiliaryItem extends React.Component {

	constructor(props) {
		super(props);
        console.log(props);
	}

    render() { 
        var tuto = (this.props.tuto === true)?'faits':((this.props.tuto === false)?'a faire':this.props.tuto);
        var active = (this.props.active === true)?'actif':((this.props.active === false)?'suprimé':this.props.active);
        return (
    	<tr>
            <td>{this.props.name}</td>
            <td>{this.props.email}</td>
            <td>{active}</td>
            <td>{tuto}</td>
            <td>{this.props.registration}</td>
            <td>{this.props.civility}</td>
            <td>{this.props.firstName}</td>
            <td>{this.props.lastName}</td>
            <td>{this.props.birthDate}</td>
            <td>{this.props.birthPlace}</td>
            <td>{this.props.phone}</td>
    	</tr>
    );}

    
}

export default AuxiliaryItem;
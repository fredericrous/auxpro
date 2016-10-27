// react modules
import React from 'react'
// react-bootstrap modules
import { FormGroup, FormControl, ControlLabel, Col } from 'react-bootstrap';
// custom modules
import { DEFAULTS } from './FormConstants.js';

class FormBase extends React.Component {

	constructor(props) {
		super(props);
		this.xsLabelSize = this.props.xsLabelSize || DEFAULTS.xsLabelSize;
		this.smLabelSize = this.props.smLabelSize || this.props.xsLabelSize || DEFAULTS.smLabelSize;
		this.mdLabelSize = this.props.mdLabelSize || this.props.smLabelSize || this.props.xsLabelSize || DEFAULTS.mdLabelSize;
		this.lgLabelSize = this.props.lgLabelSize || this.props.mdLabelSize || this.props.smLabelSize || this.props.xsLabelSize || DEFAULTS.lgLabelSize;
		this.state = {
			validationState: (!this.props.static && this.props.validator) ? this.props.validator.getState(this.props.defaultValue || this.props.value) : this.props.validationState,
			value: this.props.value
		}
	}

	getFormControl() {
		if (this.props.static) {
			return this.getFormControlStatic();	
		} else {
			return this.getFormControlEditable();
		}
	}

	getFormControlStatic() {
		return (
			<FormControl.Static>
				{this.props.defaultValue || this.props.value}
			</FormControl.Static>
		);
	}

	render() { 
		return (
			<FormGroup validationState={this.state.validationState}>
				<Col componentClass={ControlLabel} sm={this.smLabelSize} md={this.mdLabelSize} lg={this.lgLabelSize}>
					{this.props.title}
				</Col>
				<Col sm={12 - this.smLabelSize} md={12 - this.mdLabelSize} lg={12 - this.lgLabelSize}>
					{this.getFormControl()}
					{ !this.props.static ? <FormControl.Feedback/> : '' }
				</Col>
			</FormGroup>
		);
	}
}

export default FormBase;
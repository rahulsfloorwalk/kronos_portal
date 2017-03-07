import React from 'react';

import { affectInputEventToComponent } from '../react_utils.js';

export default React.createClass({
	getInitialState: function(){
		return {
			editing: false,
			inputText: "",
			hover: false
		};
	},
	getDefaultProps: function(){
		return {
			editing: false,
			emptyString: "click here to edit",
			inputText: "",
		};
	},
	componentDidMount: function(){
		if( ! this.props.inputText){
			if(this.props.editing){
				this.setState({
					inputText: "",
					editing: this.props.editing
				});
			} else {
				this.setState({
					inputText: this.props.emptyString
				});
			}
		} else {
			this.setState({
				inputText: this.props.inputText,
				editing: this.props.editing
			});
		}
	},
	componentWillReceiveProps: function(nextProps){
		if(nextProps.inputText){
			this.setState({
				inputText: nextProps.inputText
			});
		}
	},
	componentDidUpdate: function(prevProps,prevState){
		if(this.answerInput && prevState.editing === false){
			this.answerInput.focus();
			let l = this.answerInput.value.length;
			this.answerInput.setSelectionRange(l,l);
		}
	},
	inputChanged: function(e){
		affectInputEventToComponent(e, this);
	},
	hover: function(){
		this.setState({
			hover: !this.state.hover
		});
	},
	startEdit: function(){
		if(this.props.inputText){
			this.setState({
				editing: !this.state.editing,
				hover: false
			});
		} else {
			this.setState({
				editing: !this.state.editing,
				inputText: "",
				hover: false
			});
		}
	},
	save: function(e){
		e.preventDefault();
		this.props.onSave(this.state.inputText);
		this.setState({
			editing: false,
		});
		if( ! this.props.inputText){
			this.setState({
				inputText: this.props.emptyString,
			});
		} else {
			this.setState({
				inputText: this.props.inputText,
			});
		}
	},
	render: function(){
		let pointerStyle = {
			cursor: 'pointer'
		};
		if(this.state.hover){
			pointerStyle["backgroundColor"] = "Yellow";
		}
		if(this.state.editing){
			return (
				<form className="input-group" onSubmit={this.save}>
					<input
						className="form-control"
						name="inputText"
						value={this.state.inputText}
						onBlur={this.save}
						onChange={this.inputChanged}
						ref={(input) => this.answerInput = input}
					/>
					<span className="input-group-btn">
						<button className="btn btn-primary">Save</button>
					</span>
				</form>
			);
		} else {
			return (<div style={pointerStyle} onMouseOver={this.hover} onMouseOut={this.hover} onClick={this.startEdit}>{this.props.children}</div>);
		}
	}
});

import React from "react";

import { affectInputEventToComponent } from "../react_utils.js";

export default class extends React.Component {
    static defaultProps = {
    	editing: false,
    	emptyString: "click here to edit",
    	inputText: "",
    };

    state = {
    	editing: false,
    	inputText: "",
    	hover: false
    };

    componentDidMount() {
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
    }

    componentWillReceiveProps(nextProps) {
    	if(nextProps.inputText){
    		this.setState({
    			inputText: nextProps.inputText
    		});
    	}
    }

    componentDidUpdate(prevProps, prevState) {
    	if(this.answerInput && prevState.editing === false){
    		this.answerInput.focus();
    		let l = this.answerInput.value.length;
    		this.answerInput.setSelectionRange(l,l);
    	}
    }

    inputChanged = (e) => {
    	affectInputEventToComponent(e, this);
    };

    hover = () => {
    	this.setState({
    		hover: !this.state.hover
    	});
    };

    startEdit = () => {
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
    };

    save = (e) => {
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
    };

    render() {
    	let pointerStyle = {
    		cursor: "pointer"
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
}

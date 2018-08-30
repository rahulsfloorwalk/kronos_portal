import React from "react";
import PropTypes from "prop-types";
import { pointerStyle } from "../styles.js";

export default class InPlaceEditable extends React.Component {
	static propTypes = {
		inputText: PropTypes.string,
		emptyString: PropTypes.string,
		onSave: PropTypes.func,
		editing: PropTypes.bool,
		children: PropTypes.node,
	};

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
			const l = this.answerInput.value.length;
			this.answerInput.setSelectionRange(l,l);
		}
	}

	inputChanged = (e) => {
		this.setState({
			inputText: e.target.value,
		});
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
		const divStyle = Object.assign({}, pointerStyle);
		if(this.state.hover){
			divStyle["backgroundColor"] = "Yellow";
		}
		if(this.state.editing){
			return (
				<form className="input-group" onSubmit={this.save}>
					<input
						className="form-control"
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
			return (<div style={divStyle} onMouseOver={this.hover} onMouseOut={this.hover} onClick={this.startEdit}>{this.props.children}</div>);
		}
	}
}

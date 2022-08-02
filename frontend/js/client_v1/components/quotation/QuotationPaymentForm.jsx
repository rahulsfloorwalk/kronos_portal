import React from "react";
import { connect } from "react-redux";
import { hashHistory } from "react-router";
import PropTypes from "prop-types";
import Alert from "react-s-alert";

import { getInputEventChangeValue } from "../../../react_utils.js";
import { fetchCountry } from "../../actions/location.js";
import { fetchClient } from "../../actions/client.js";

import Loading from "../../../components/Loading.jsx";
import FormInput from "../../../components/FormInput.jsx";
import CountrySelector from "../../../components/CountrySelector.jsx";
import { createPaymentOrder, validatePaymentOrder, failedPaymentOrder } from "../../service/payment.js";
import { get_uncomplete_quotation_by_client } from "../../actions/quotation.js";


class QuotationPaymentForm extends React.Component{
	static propTypes = {
		payable_amount: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
		quotationId: PropTypes.number.isRequired,
		client: PropTypes.object.isRequired,
		dispatch: PropTypes.func.isRequired,
	};

	state = {
		form: {},
		errors: {},
		form_disable: false,
		loading: false,
	};

	componentDidMount(){
		this.setState({loading: true});
		Promise.all([
			this.props.dispatch(fetchClient()),
			this.props.dispatch(fetchCountry()),
		]).then(([client,]) => {
			this.setState({
				form: {
					quotation_id: this.props.quotationId,
					payable_amount: this.props.payable_amount,
					company_name: client.name,
					address: client.address
				},
				loading: false
			});
		});

		this.loadScript();
	}

	inputChanged = (e) => {
		this.setState({
			form: Object.assign({}, this.state.form, getInputEventChangeValue(e)),
		});
	};

	loadScript = () => {
		return new Promise((resolve) => {
			const script = document.createElement("script");
			script.src = "https://checkout.razorpay.com/v1/checkout.js";
			script.onload = () => {
				resolve(true);
			};
			script.onerror = () => {
				resolve(false);
			};
			document.body.appendChild(script);
		});
	};

	displayRazorpay = (e) => {
		e.preventDefault();
		this.setState({
			form_disable: true,
			errors: {}
		});
		const clientId = this.props.client.id;
		const dispatch = this.props.dispatch;
		let promise = createPaymentOrder(clientId, this.state.form);
		promise.done((res)=>{
			const { amount, currency, key, name, order_id, merchant_logo } = res;

			const options = {
				key: key,
				amount: amount.toString(),
				currency: currency,
				name: name,
				description: "",
				image: merchant_logo,
				order_id: order_id,
				handler: function (response) {
					validatePaymentOrder(clientId, response).then(() => {
						Alert.success("Payment successful");
						dispatch(get_uncomplete_quotation_by_client(clientId));
						hashHistory.replace("/project_setup/quotation_preview");
					});
				},
				prefill: {
					name: this.props.client.name,
					email: this.props.client.email,
					contact: this.props.client.phone,
				},
				theme: {
					color: "#7CB868",
				},
				modal: {
					backdropclose: false,
					escape: false,
					handleback: false,
					confirm_close: true
				},
			};

			const paymentObject = new window.Razorpay(options);
			paymentObject.open();
			paymentObject.on("payment.failed", function (response){
				failedPaymentOrder(response.error).then(() => {
					Alert.warning("Payment is not successful");
					hashHistory.replace("/project_setup/quotation");
				});
			});

		}).fail((err)=>{
			this.setState({
				errors: err.responseJSON,
				form_disable: false
			});
		});
	};

	render(){
		if(this.state.loading){
			return <Loading />;
		}
		return(
			<div className="panel panel-default">
				<div className="panel-heading"><b>Checkout Details</b></div>
				<div className="panel-body">
					<div className="col-md-12 row">
						<p className="text-danger">{this.state.errors.non_field_errors}</p>
						<form onSubmit={this.displayRazorpay}>
							<div className="col-md-6">
								<FormInput type="text" className="form-control" label="Company Name" name="company_name" onChange={this.inputChanged} value={this.state.form.company_name} disabled={this.state.form_disable} errors={this.state.errors.company_name} required={true} />
							</div>
							<div className="col-md-6">
								<FormInput type="text" className="form-control" label="Billing Name" name="billing_name" onChange={this.inputChanged} value={this.state.form.billing_name} disabled={this.state.form_disable} errors={this.state.errors.billing_name} required={true} />
							</div>
							<div className="col-md-6">
								<FormInput type="text" className="form-control" label="Address" name="address" onChange={this.inputChanged} value={this.state.form.address} disabled={this.state.form_disable} errors={this.state.errors.address} required={true} />
							</div>
							<div className="col-md-6">
								<FormInput type="text" className="form-control" label="Postal Code" name="postal_code" onChange={this.inputChanged} value={this.state.form.postal_code} disabled={this.state.form_disable} errors={this.state.errors.postal_code} required={true} />
							</div>
							<div className="col-md-6">
								<FormInput type="text" className="form-control" label="City" name="city" onChange={this.inputChanged} value={this.state.form.city} disabled={this.state.form_disable} errors={this.state.errors.city} required={true} />
							</div>
							<div className="col-md-6">
								<CountrySelector onChange={this.inputChanged} value={this.state.form.country} disabled={this.state.form_disable} errors={this.state.errors.country} required={true} />
							</div>
							<div className="col-md-6">
								<FormInput type="text" className="form-control" placeholder="(optional)" label="Phone Number" name="po_number" onChange={this.inputChanged} value={this.state.form.po_number} disabled={this.state.form_disable} errors={this.state.errors.po_number} />
							</div>
							<div className="col-md-6">
								<FormInput type="text" className="form-control" placeholder="(optional)" label="GSTIN Number" name="gstin_number" onChange={this.inputChanged} value={this.state.form.gstin_number} disabled={this.state.form_disable} errors={this.state.errors.gstin_number} />
							</div>
							{ this.state.form_disable ? <Loading/> :
								<div className="col-md-12 text-center" style={{marginTop: "2%"}}>
									<button type="submit" className="btn btn-primary">Proceed to checkout</button>
								</div>}
						</form>
					</div>
				</div>
			</div>
		);
	}
}

const mapStoreToProps = (store) => {
	return {
		client: store.client
	};
};

export default connect(mapStoreToProps)(QuotationPaymentForm);
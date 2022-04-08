import React from "react";
import CheckoutForm from "./CheckoutForm.jsx";
import { MinimumPayableAmount, PaymentGSTAmount } from "../../../constants.js";
import { getPayableAmountWithGST, findGSTForPayableAmount } from "../../../react_utils.js";

export default class PaymentForm extends React.Component{

	constructor(props){
		super(props);
		this.state = {
			open_checkout_form: false,
			payable_amount: MinimumPayableAmount,
			isButtonDisabled: false,
			payable_amount_error: "",
		};
	}

	inputChanged = (e) => {
		if(e.target.value && e.target.value >= MinimumPayableAmount){
			this.setState({
				payable_amount: e.target.value,
				isButtonDisabled: false,
				payable_amount_error: "",
			});
		}
		else{
			this.setState({
				payable_amount: e.target.value,
				isButtonDisabled: true,
				payable_amount_error: `Payable amount should be ${MinimumPayableAmount}`
			});
		}
	};

	toggleCheckout = () => {
		if(this.state.payable_amount >= MinimumPayableAmount){
			this.setState((prevState)=> Object.assign({}, {
				open_checkout_form: !prevState.open_checkout_form
			}));
		}
	};

	render(){
		return (
			<div className="container">
				<div className="col-md-8">
					{this.state.open_checkout_form == true ? <CheckoutForm toggleCheckout={this.toggleCheckout} payable_amount={this.state.payable_amount} className="checkout-form" /> : (
						<div className="row col-md-12 well">
							<h2>Add funds to your account</h2>
							<div className="col-md-5" style={{ marginTop: "5%" }}>
								<label>Enter amount to pay (INR)</label>
								<input type="number" name="payable_amount" value={this.state.payable_amount} className="form-control" onChange={this.inputChanged} />
								<p className="text-danger">{this.state.payable_amount_error}</p>
							</div>
							<div className="col-md-12" style={{marginTop: "2%"}}>
								<button className="btn btn-primary" onClick={this.toggleCheckout} disabled={this.state.isButtonDisabled}>Next</button>
							</div>
						</div>
					)}
				</div>
				<div className="col-md-4" style={{ border: "solid 1px #80808069", borderRadius:"2%", padding:"1% 3% 3% 3%" }}>
					<h2 style={{marginBottom: "10%"}}>Order summary</h2>
					<div style={{display: "flex", justifyContent:"space-between"}}>
						<div>
							Order Amount:
						</div>
						<div>
							INR {this.state.payable_amount >= MinimumPayableAmount ? this.state.payable_amount : MinimumPayableAmount}
						</div>
					</div>
					<hr/>
					<div style={{display: "flex", justifyContent:"space-between"}}>
						<div>
							GST Amount ({PaymentGSTAmount}%):
						</div>
						<div>
							INR {this.state.payable_amount >= MinimumPayableAmount ? findGSTForPayableAmount(this.state.payable_amount) : 0}
						</div>
					</div>
					<hr/>
					<div style={{display: "flex", justifyContent:"space-between"}}>
						<div>
							<b>Total</b>
						</div>
						<div>
							<b>INR {this.state.payable_amount >= MinimumPayableAmount ? getPayableAmountWithGST(this.state.payable_amount) : getPayableAmountWithGST(MinimumPayableAmount)}</b>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
import $ from "jquery";
import { url } from "../../../config.js";

export function getAuditorPaymentReports(month, year, payment, client){
	return $.get( url.api_base_path + `manager/reports/auditor_payment/?month=${month}&year=${year}&payment=${payment}&client=${client}`);
}

export function getBillingReports(month, year, client){
	return $.get( url.api_base_path + `manager/reports/billing/?month=${month}&year=${year}&client=${client}`);
}

export function getProfitabilityReports(month, year, client){
	return $.get( url.api_base_path + `manager/reports/profitability/?month=${month}&year=${year}&client=${client}`);
}

export function getProjectCostReports(month, year, client){
	return $.get( url.api_base_path + `manager/reports/project_cost/?month=${month}&year=${year}&client=${client}`);
}

export function getMonthlyPNLReports(year){
	return $.get( url.api_base_path + `manager/reports/monthly_pnl/?year=${year}`);
}

export function getProjectManagerReports(month, year, manager){
	return $.get( url.api_base_path + `manager/reports/manager_wise_profitability/?month=${month}&year=${year}&manager=${manager}`);
}

export function getClientProfitabilityReports(year, client, lastClientId){
	return $.get( url.api_base_path + `manager/reports/client_wise_profitability/?client=${client}&year=${year}&last_client_id=${lastClientId}`);
}

export function getQAReports(month, year, qa){
	return $.get( url.api_base_path + `manager/reports/qa_report/?month=${month}&year=${year}&qa=${qa}`);
}

export function getProjectAnalytic(month, year, cycle, client){
	return $.get( url.api_base_path + `manager/analytics/project_analytic_cycle_wise?month=${month}&year=${year}&cycle=${cycle}&client=${client}`);
}

export function getProjectAnalyticYearly(year){
	return $.get( url.api_base_path + `manager/analytics/project_analytic_month_wise?year=${year}`);
}
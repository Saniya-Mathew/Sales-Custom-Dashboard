/** @odoo-module **/
import { registry } from "@web/core/registry";
import { Component } from "@odoo/owl";
class SalesDashboard extends Component {}
SalesDashboard.template = "sales_dashboard.SaleDashboard";
registry.category("actions").add("sale_dashboard_tag", SalesDashboard);


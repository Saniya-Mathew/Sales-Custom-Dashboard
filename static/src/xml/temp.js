/** @odoo-module **/
import { registry } from "@web/core/registry";
import { Component } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import {  useState, onMounted } from "@odoo/owl";


class SalesDashboard extends Component {
setup() {
        super.setup();
        this.orm = useService('orm');
//        this._fetch_data();
  }
    _createCharts() {
//        if (!this.state.data) return;
//        const result = this.state.data;
//        const filterLabel = this._getFilterLabel();

        const SalesTeamCanvas = document.getElementById("SalesTeamChart");
        if (SalesTeamCanvas) {
            new Chart(SalesTeamCanvas, {
                type: 'doughnut',
                data: {
                    labels: [filterLabel, 'Today', 'Ongoing', 'Overtime'],
                    datasets: [{
                        label: 'Hours',
                        data: [
                        ],
                        backgroundColor: ['#36A2EB', '#4BC0C0', '#FFCE56', '#FF6384'],
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Attendance Summary'
                        }
                    }
                }
            });
        }
     }
}

SalesDashboard.template = "sales_dashboard.SaleDashboard";
registry.category("actions").add("sale_dashboard_tag", SalesDashboard);

<?xml version="1.0" encoding="UTF-8" ?>
<templates>
    <t t-name="sales_dashboard.SaleDashboard">
        <div class="sales-dashboard-container" style="height: 100vh; overflow-y: auto; overflow-x: hidden;">
            <div class="d-flex" style="min-height: 100vh;">
                <!-- Main Content -->
                <div class="flex-grow-1 container-fluid" style="padding: 30px 15px;">
                    <!-- Dashboard Content -->
                    <div>
                        <center><h1 class="mb-4" style="font-weight: bold;">Sales Dashboard</h1></center>
                    </div>
                    <div class="row main-section" style="margin: 100px;">
                    <!-- sales team Tile-->
                        <div id="sales_team" class="col-md-6 col-sm-6"
                             style=" overflow: hidden; padding-top: 30px;">
                            <div class="oh-card" style="box-shadow:2px 4px 8px 2px rgba(0,0,0.3,0.2);
                                 display: flex; justify-content: center;" role="button">
                                <div class="oh-card-body"
                                     style="padding: 5px 5px; float: left; width: 100%;
                                     height: 200px; box-sizing: border-box; margin-top: 15px;text-align: center;">
                                    <div class="stat-widget-one">
                                        <div style="background:#ff4d94; width:65px; text-align: center;">
                                            <i class="fa fa-users text-mauve"
                                               style="font-size:50px;"/>
                                        </div>
                                        <h3 class="mb-4" style="font-weight: bold;text-align: center;">
                                            Sales by SalesTeam
                                        </h3>
                                        <div style="max-width: 250px; max-height: 250px;">
                                                <canvas id="SalesTeamChart" height="400px" width="400px"/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                        /** @odoo-module **/

import { registry } from "@web/core/registry";
import { Component, onMounted } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";

class SalesDashboard extends Component {
    setup() {
        super.setup();
        this.orm = useService("orm");

        // Call chart drawing after component is rendered
        onMounted(async () => {
            const result = await this.orm.call("sale.order", "get_sales_by_team", []);
            this.renderChart(result);
        });
    }

    renderChart(data) {
        const ctx = this.el.querySelector("#SalesTeamChart").getContext("2d");
        new Chart(ctx, {
            type: "bar",
            data: {
                labels: data.teams,
                datasets: [{
                    label: "Total Sales",
                    data: data.sales,
                    backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56"],
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, position: "bottom" },
                },
                scales: {
                    y: { beginAtZero: true },
                },
            }
        });
    }
}

SalesDashboard.template = "sales_dashboard.SaleDashboard";
registry.category("actions").add("sale_dashboard_tag", SalesDashboard);



from odoo import models

class SaleOrder(models.Model):
    _inherit = "sale.order"

    def get_sales_by_team(self):
        result = {}
        teams = self.env['crm.team'].search([])
        for team in teams:
            orders = self.search([('team_id', '=', team.id), ('state', 'in', ['sale', 'done'])])
            total_sales = sum(orders.mapped('amount_total'))
            result[team.name] = total_sales
        return {
            "teams": list(result.keys()),
            "sales": list(result.values())
        }


<?xml version="1.0" encoding="UTF-8" ?>
<templates xml:space="preserve">
    <t t-name="sales_dashboard.SaleDashboard">
        <div class="sales-dashboard-container o_content" style="padding: 20px;">
            <h1 class="mb-4 text-center" style="font-weight: bold;">Sales Dashboard</h1>
            <div class="row justify-content-center">
                <!-- Sales Team Tile -->
                <div class="col-md-6">
                    <div class="card shadow p-3">
                        <div class="card-body text-center">
                            <h3 class="card-title">Sales by SalesTeam</h3>
                            <canvas id="SalesTeamChart" width="400" height="300"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </t>
</templates>




 renderChart() {
//       const salesTeamCanvas = document.getElementById("SalesTeamChart");
//        if (salesTeamCanvas) {
//            new Chart(salesTeamCanvas, {
//                 type: "doughnut",
//            data: {
//                labels: 'data.teams',
//                datasets: [{
//                    label: "Total Sales",
//                    data: [13,54,75],
//                    backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56"],
//                }]
//            },
//                options: {
//                    responsive: true,
//                    maintainAspectRatio: true,
//                    plugins: {
//                        title: {
//                            display: true,
//                            text: 'Attendance Summary'
//                        }
//                    }
//                }
//            });
//        }
//    }
//}
import Chart from "https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js";

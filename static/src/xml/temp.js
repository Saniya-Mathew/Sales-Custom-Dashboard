/** @odoo-module **/
inet/npm/chart.js@4.4.1/dist/chart.umd.min.js";



_createCharts(data) {
    const salesTeamCanvas = document.getElementById("SalesTeamChart");
    if (salesTeamCanvas && typeof Chart !== 'undefined') {
        // Optional: include chartjs-plugin-datalabels if not already present
        if (Chart.plugins.getAll().every(p => p.id !== 'datalabels')) {
            Chart.register(window.ChartDataLabels);  // Assumes plugin loaded globally
        }

        const totalSales = data.sales.reduce((sum, val) => sum + val, 0);

        new Chart(salesTeamCanvas, {
            type: "doughnut",
            data: {
                labels: data.teams,
                datasets: [{
                    label: "Total Sales",
                    data: data.sales,
                    backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56", "#4BC0C0", "#9966FF"],
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Total Sales Summary'
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const value = context.raw;
                                const percentage = ((value / totalSales) * 100).toFixed(1);
                                return `${context.label}: ₹${value.toFixed(2)} (${percentage}%)`;
                            }
                        }
                    },
                    datalabels: {
                        color: '#fff',
                        formatter: function (value, context) {
                            const percentage = ((value / totalSales) * 100).toFixed(1);
                            return `${percentage}%`;
                        }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
    }
}




_loadChartJs() {
    return new Promise((resolve, reject) => {
        const chartScript = document.createElement('script');
        chartScript.src = "https://cdn.jsdelivr.net/npm/chart.js";
        chartScript.onload = () => {
            const pluginScript = document.createElement('script');
            pluginScript.src = "https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels";
            pluginScript.onload = () => resolve();
            pluginScript.onerror = () => reject(new Error("Failed to load Chart.js DataLabels plugin"));
            document.head.appendChild(pluginScript);
        };
        chartScript.onerror = () => reject(new Error("Failed to load Chart.js"));
        document.head.appendChild(chartScript);
    });
}




<t t-name="sales_dashboard.SaleDashboard">
    <div class="o_sales_dashboard_container" style="display: flex; gap: 2rem;">
        <!-- Left: Labels and Values -->
        <div style="flex: 1;">
            <h3>Sales by Team</h3>
            <ul>
                <t t-foreach="state.chartData" t-as="item" t-key="item.name">
                    <li>
                        <strong t-esc="item.name"/>: ₹<span t-esc="item.amount.toFixed(2)"/>
                    </li>
                </t>
            </ul>
        </div>

        <!-- Right: Doughnut Chart -->
        <div style="flex: 1;">
            <canvas id="SalesTeamChart" width="400" height="400"></canvas>
        </div>
    </div>
</t>




import { registry } from "@web/core/registry";
import { Component } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { useState, onMounted } from "@odoo/owl";

class SalesDashboard extends Component {
    setup() {
        this.orm = useService("orm");
        this.state = useState({ chartData: [] });

        onMounted(async () => {
            await this._loadChartJs();

            const result = await this.orm.call("sale.order", "get_sales_by_team", []);

            // Prepare chartData for rendering the list
            this.state.chartData = result.teams.map((name, i) => ({
                name,
                amount: result.sales[i]
            }));

            this._createCharts(result);
        });
    }

    _loadChartJs() {
        return new Promise((resolve, reject) => {
            const chartScript = document.createElement("script");
            chartScript.src = "https://cdn.jsdelivr.net/npm/chart.js";
            chartScript.onload = () => {
                const pluginScript = document.createElement("script");
                pluginScript.src = "https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels";
                pluginScript.onload = () => resolve();
                pluginScript.onerror = () => reject(new Error("Failed to load Chart.js DataLabels plugin"));
                document.head.appendChild(pluginScript);
            };
            chartScript.onerror = () => reject(new Error("Failed to load Chart.js"));
            document.head.appendChild(chartScript);
        });
    }

    _createCharts(data) {
        const canvas = document.getElementById("SalesTeamChart");
        if (canvas && typeof Chart !== 'undefined') {
            const total = data.sales.reduce((sum, val) => sum + val, 0);

            Chart.register(window.ChartDataLabels);

            new Chart(canvas, {
                type: "doughnut",
                data: {
                    labels: data.teams,
                    datasets: [{
                        label: "Sales",
                        data: data.sales,
                        backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56", "#4BC0C0", "#9966FF"],
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        title: {
                            display: true,
                            text: "Sales Distribution by Team"
                        },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    const value = context.raw;
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${context.label}: ₹${value.toFixed(2)} (${percentage}%)`;
                                }
                            }
                        },
                        datalabels: {
                            color: "#fff",
                            formatter: function (value) {
                                return `${((value / total) * 100).toFixed(1)}%`;
                            }
                        }
                    }
                },
                plugins: [ChartDataLabels]
            });
        }
    }
}

SalesDashboard.template = "sales_dashboard.SaleDashboard";
registry.category("actions").add("sale_dashboard_tag", SalesDashboard);


from odoo import models, api

class SaleOrder(models.Model):
    _inherit = "sale.order"

    @api.model
    def get_sales_by_team_and_person(self):
        # Sales by Team
        team_sales = {}
        teams = self.env['crm.team'].search([])
        for team in teams:
            orders = self.search([
                ('team_id', '=', team.id),
                ('state', 'in', ['sale', 'done'])
            ])
            team_sales[team.name] = sum(orders.mapped('amount_total'))

        # Sales by Salesperson
        salesperson_sales = {}
        users = self.env['res.users'].search([])
        for user in users:
            orders = self.search([
                ('user_id', '=', user.id),
                ('state', 'in', ['sale', 'done'])
            ])
            total = sum(orders.mapped('amount_total'))
            if total > 0:
                salesperson_sales[user.name] = total

        return {
            "teams": list(team_sales.keys()),
            "team_sales": list(team_sales.values()),
            "salespersons": list(salesperson_sales.keys()),
            "salesperson_sales": list(salesperson_sales.values())
        }


odoo.define('sales_dashboard.sales_dashboard', function (require) {
    'use strict';

    const { Component, onMounted } = owl;
    const { registry } = require('@web/core/registry');
    const { useService } = require("@web/core/utils/hooks");

    class SalesDashboard extends Component {
        setup() {
            this.orm = useService("orm");
            onMounted(async () => {
                if (typeof Chart === 'undefined') {
                    await this._loadChartJs();
                }
                const result = await this.orm.call("sale.order", "get_sales_by_team_and_person", []);
                this._createCharts(result);
            });
        }

        _loadChartJs() {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = "https://cdn.jsdelivr.net/npm/chart.js";
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }

        _createCharts(data) {
            const teamColors = ["#36A2EB", "#FF6384", "#FFCE56", "#9966FF"];
            const personColors = ["#4BC0C0", "#F77825", "#8e44ad", "#2ecc71", "#f39c12"];

            const teamChart = document.getElementById("SalesTeamChart");
            if (teamChart && Chart) {
                new Chart(teamChart, {
                    type: "doughnut",
                    data: {
                        labels: data.teams,
                        datasets: [{
                            label: "Sales by Team",
                            data: data.team_sales,
                            backgroundColor: teamColors,
                        }]
                    },
                    options: {
                        plugins: {
                            title: {
                                display: true,
                                text: "Sales by Team"
                            }
                        }
                    }
                });
            }

            const personChart = document.getElementById("SalesPersonChart");
            if (personChart && Chart) {
                new Chart(personChart, {
                    type: "bar",
                    data: {
                        labels: data.salespersons,
                        datasets: [{
                            label: "Sales by Salesperson",
                            data: data.salesperson_sales,
                            backgroundColor: personColors,
                        }]
                    },
                    options: {
                        plugins: {
                            title: {
                                display: true,
                                text: "Sales by Salesperson"
                            },
                            legend: { display: false }
                        },
                        responsive: true,
                        scales: {
                            y: { beginAtZero: true }
                        }
                    }
                });
            }
        }
    }

    SalesDashboard.template = "sales_dashboard.SaleDashboard";
    registry.category("actions").add("sale_dashboard_tag", SalesDashboard);
});


  # selling products
                selling_products = {}
                products = self.env['product.product'].search([])
                for product in products:
                    orders = self.search([
                        ('product_id', '=', product.id),
                        ('state', 'in', ['sale', 'done'])
                    ])
                    selling_products[product.name] = sum(orders.mapped('amount_total'))

 "products": list(selling_products.keys()),

                  "selling_products": list(selling_products.values())




                  from odoo import models, api

class SaleOrder(models.Model):
    _inherit = "sale.order"

    @api.model
    def get_sales_by_team(self):
        team_sales = {}
        salesperson_sales = {}
        product_sales = {}

        teams = self.env['crm.team'].search([])
        for team in teams:
            orders = self.env['sale.order'].search([
                ('team_id', '=', team.id),
                ('state', 'in', ['sale', 'done'])
            ])
            team_sales[team.name] = sum(orders.mapped('amount_total'))

        # Sales by Salesperson
        users = self.env['res.users'].search([])
        for user in users:
            orders = self.search([
                ('user_id', '=', user.id),
                ('state', 'in', ['sale', 'done'])
            ])
            total = sum(orders.mapped('amount_total'))
            if total > 0:
                salesperson_sales[user.name] = total

        # Product Sales
        order_lines = self.env['sale.order.line'].search([
            ('order_id.state', 'in', ['sale', 'done'])
        ])
        for line in order_lines:
            product = line.product_id.name
            product_sales[product] = product_sales.get(product, 0) + line.product_uom_qty

        # Determine highest and lowest selling products
        sorted_products = sorted(product_sales.items(), key=lambda x: x[1], reverse=True)
        highest_selling = sorted_products[0] if sorted_products else ("", 0)
        lowest_selling = sorted_products[-1] if sorted_products else ("", 0)

        return {
            "teams": list(team_sales.keys()),
            "sales": list(team_sales.values()),
            "salespersons": list(salesperson_sales.keys()),
            "salesperson_sales": list(salesperson_sales.values()),
            "highest_selling_product": {"product": highest_selling[0], "quantity": highest_selling[1]},
            "lowest_selling_product": {"product": lowest_selling[0], "quantity": lowest_selling[1]}
        }

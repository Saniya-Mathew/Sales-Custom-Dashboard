import { registry } from "@web/core/registry";
import { Component } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import {  useState, onMounted } from "@odoo/owl";


class SalesDashboard extends Component {
    setup() {
        this.orm = useService('orm');
        this.action = useService("action");
        onMounted(async () => {
            if (typeof Chart === 'undefined') {
                await this._loadChartJs();
            }
            const result = await this.orm.call("sale.order", "get_sales_by_team", []);
            this._createCharts(result);

        });
    }

    _loadChartJs() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = "https://cdn.jsdelivr.net/npm/chart.js";
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Failed to load Chart.js"));
            document.head.appendChild(script);
        });
    }

   _createCharts(data) {
        const teamColors = ["#36A2EB", "#FF6384", "#FFCE56", "#224fbf"];
        const personColors = ["#4BC0C0", "#267813", "#ff4d94", "#ff4d94", "#f39c12"];
        const productColors = ["#36A2EB", "#4BC0C0","#FF6384", "#FFCE56", "#267813", "#ff4d94", "#ff4d94", "#f39c12","#224fbf"]
        const teamChart = document.getElementById("SalesTeamChart");
        if (teamChart && Chart) {
            new Chart(teamChart, {
                type: "doughnut",
                data: {
                    labels: data.teams,
                    datasets: [{
                        label: "Sales by Team",
                        data: data.sales,
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
        const productChart = document.getElementById("productChart");
        if (productChart && Chart && data.product_sales) {
            const productLabels = Object.keys(data.product_sales);
            const productQuantities = Object.values(data.product_sales);

            new Chart(productChart, {
                type: 'pie',
                data: {
                    labels: productLabels,
                    datasets: [{
                        label: "Quantity Sold",
                        data: productQuantities,
                        backgroundColor: productColors,
                    }]
                },
                options: {
                    plugins: {
                        title: {
                            display: true,
                            text: " "
                        },
                        legend: {
                            display: true,
                            position: 'right',
                            labels: {
                                usePointStyle: true,
                                boxWidth: 10,
                                padding: 20
                            }
                        }
                    },
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }
   }
}

SalesDashboard.template = "sales_dashboard.SaleDashboard";
registry.category("actions").add("sale_dashboard_tag", SalesDashboard);
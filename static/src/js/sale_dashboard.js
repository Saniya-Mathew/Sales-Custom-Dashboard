import { registry } from "@web/core/registry";
import { Component, useState, onMounted } from "@odoo/owl"; // ✅ fix combined import
import { useService } from "@web/core/utils/hooks";

class SalesDashboard extends Component {
    setup() {
        this.orm = useService("orm");
        this.action = useService("action");

        onMounted(async () => {
            if (typeof Chart === "undefined") {
                await this._loadChartJs();
            }
            const result = await this.orm.call("sale.order", "get_sales_by_team", []);
            this._createCharts(result);
        });
    }

    _loadChartJs() {
        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/chart.js";
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Failed to load Chart.js"));
            document.head.appendChild(script);
        });
    }

    _createCharts(data) {
        const teamColors = ["#36A2EB", "#FF6384", "#FFCE56", "#224fbf"];
        const personColors = ["#4BC0C0", "#267813", "#ff4d94", "#f39c12", "#9b59b6", "#2ecc71", "#3498db"];
        const productColors = [
            "#36A2EB", "#eb0920", "#FF6384", "#09d0eb", "#267813", "#ff4d94",
            "#4fd6a2", "#364287", "#7e3687", "#33f50c", "#f39c12", "#224fbf"
        ];
        const orderColors = [
              "#f39c12","#3498db","#2ecc71", "#27ae60", "#e74c3c", ];

        // Team Chart
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

        // Salesperson Chart
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

        // Product Chart
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
                            text: "Product-wise Quantity Sold" // ✅ not blank
                        },
                        legend: {
                            display: true,
                            position: 'right',
                            labels: {
                                usePointStyle: true,
                                boxWidth: 5,
                                padding: 15
                            }
                        }
                    },
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }

        // Order Status Chart
        const ordersChart = document.getElementById("ordersChart");
        if (ordersChart && Chart) {
            new Chart(ordersChart, {
                type: "bar",
                data: {
                    labels: data.order_status_labels,
                    datasets: [{
                        label: "Order Status",
                        data: data.order_status_values,
                        backgroundColor: orderColors,
                    }]
                },
                options: {
                    plugins: {
                        title: {
                            display: true,
                            text: "Product Order Summary"
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
        const invoiceChart = document.getElementById("invoiceChart");
        if (invoiceChart && Chart) {
            new Chart(invoiceChart, {
                type: "bar",
                data: {
                    labels: data.invoice_status_labels,
                    datasets: [{
                        label: "invoice Status",
                        data: data.invoice_status_values,
                        backgroundColor: orderColors,
                    }]
                },
                options: {
                    plugins: {
                        title: {
                            display: true,
                            text: "Product Order invoice Summary"
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


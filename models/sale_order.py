from odoo import models, api


class SaleOrder(models.Model):
    _inherit = "sale.order"

    @api.model
    def get_sales_by_team(self):
        team_sales = {}
        salesperson_sales = {}
        product_sales = {}
        order_status_details = {}
        invoice_status_details = {}

        all_orders = self.search([])

        # Define order states to summarize
        states = ['draft', 'sent', 'sale', 'done', 'cancel']

        # Count number of orders in each state
        for state in states:
            count = self.search_count([('state', '=', state)])
            order_status_details[state] = count

            # Invoice status summary
            invoice_states = ['no', 'to invoice', 'invoiced']
            for inv_state in invoice_states:
                invoice_status_details[inv_state] = len(all_orders.filtered(lambda o: o.invoice_status == inv_state))

        # Fetch all confirmed or done sale orders
        confirmed_orders = self.search([('state', 'in', ['sale', 'done'])])

        # Sales by Team
        teams = self.env['crm.team'].search([])
        for team in teams:
            team_orders = confirmed_orders.filtered(lambda o: o.team_id.id == team.id)
            total = sum(team_orders.mapped('amount_total'))
            if total > 0:
                team_sales[team.name] = total

        # Sales by Salesperson
        users = self.env['res.users'].search([])
        for user in users:
            user_orders = confirmed_orders.filtered(lambda o: o.user_id.id == user.id)
            total = sum(user_orders.mapped('amount_total'))
            if total > 0:
                salesperson_sales[user.name] = total

        # Product Sales (total quantity sold per product)
        order_lines = self.env['sale.order.line'].search([
            ('order_id', 'in', confirmed_orders.ids)
        ])
        for line in order_lines:
            product_name = line.product_id.name
            product_sales[product_name] = product_sales.get(product_name, 0) + line.product_uom_qty

        return {
            "teams": list(team_sales.keys()),
            "sales": list(team_sales.values()),
            "salespersons": list(salesperson_sales.keys()),
            "salesperson_sales": list(salesperson_sales.values()),
            "product_sales": product_sales,
            "order_status_labels": list(order_status_details.keys()),
            "order_status_values": list(order_status_details.values()),
            "invoice_status_labels": list(invoice_status_details.keys()),
            "invoice_status_values": list(invoice_status_details.values()),
        }

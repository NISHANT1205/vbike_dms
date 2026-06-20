/* ============================================================
   Vbike · Table / Form / Chart configuration
   Rows are intentionally empty — populated via backend API.
   ============================================================ */

export const STATUS_COLORS = {
  Active: 'green', Inactive: 'gray', Approved: 'green', Verified: 'green',
  Pending: 'amber', 'In Review': 'amber', Rejected: 'red', Blocked: 'red',
  Draft: 'gray', Completed: 'green', Processing: 'blue', Confirmed: 'blue',
  Shipped: 'blue', 'In Transit': 'amber', Delivered: 'green', Cancelled: 'red',
  Dispatched: 'blue', 'Out for Delivery': 'amber', Open: 'amber', Closed: 'green',
  Resolved: 'green', 'On Hold': 'gray', Paid: 'green', Unpaid: 'red', Overdue: 'red',
  New: 'blue', Contacted: 'amber', Qualified: 'purple', Converted: 'green', Lost: 'red',
  'High': 'red', 'Medium': 'amber', 'Low': 'green', 'In Stock': 'green',
  'Low Stock': 'amber', 'Out of Stock': 'red', Hot: 'red', Warm: 'amber', Cold: 'blue',
  Inbound: 'green', Outbound: 'amber',
  'Stock In': 'green', 'Stock Out': 'amber', Adjustment: 'gray',
  Debit: 'red', Credit: 'green', Responded: 'blue',
}

/* ---------------- Table configurations ---------------- */
export const TABLE_CONFIGS = {
  products: {
    title: 'Product Catalogue',
    subtitle: 'Master list of all products in the system',
    filters: [{ key: 'category', label: 'Category', options: ['Engine', 'Transmission', 'Electrical', 'Body'] }],
    columns: [
      { key: 'id', label: 'SKU', type: 'id' },
      { key: 'name', label: 'Product Name', strong: true },
      { key: 'category', label: 'Category' },
      { key: 'price', label: 'Unit Price' },
      { key: 'stock', label: 'Stock', type: 'number' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    rows: [],
  },
  currentStock: {
    title: 'Current Stock Levels',
    subtitle: 'Real-time available inventory for your dealership',
    filters: [{ key: 'status', label: 'Status', options: ['In Stock', 'Out of Stock'] }],
    columns: [
      { key: 'id', label: 'Product ID', type: 'id' },
      { key: 'name', label: 'Product', strong: true },
      { key: 'type', label: 'Type' },
      { key: 'quantity', label: 'Stock Qty', type: 'number' },
      { key: 'unitPrice', label: 'Unit Price' },
      { key: 'taxRate', label: 'Tax Rate' },
      { key: 'landedCost', label: 'Landed Cost' },
      { key: 'stockValue', label: 'Stock Value' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    rows: [],
  },
  inventoryHistory: {
    title: 'Product-wise Inventory History',
    subtitle: 'Detailed stock movement records by product',
    filters: [{ key: 'type', label: 'Product Type', options: ['Bike', 'Parts', 'Accessory'] }],
    columns: [
      { key: 'name', label: 'Product', strong: true },
      { key: 'type', label: 'Type' },
      { key: 'opening', label: 'Opening', type: 'number' },
      { key: 'stockIn', label: 'Stock In', type: 'number' },
      { key: 'inFrom', label: 'In From' },
      { key: 'stockOut', label: 'Stock Out', type: 'number' },
      { key: 'outTo', label: 'Out To' },
      { key: 'balance', label: 'Current Balance', type: 'number' },
    ],
    rows: [],
  },
  transactions: {
    title: 'Inventory Transactions',
    subtitle: 'All inbound and outbound inventory transactions',
    filters: [
      { key: 'type', label: 'Type', options: ['Inbound', 'Outbound'] },
    ],
    columns: [
      { key: 'id', label: 'Txn ID', type: 'id' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'name', label: 'Product', strong: true },
      { key: 'type', label: 'Type', type: 'badge' },
      { key: 'qty', label: 'Quantity', type: 'number' },
      { key: 'value', label: 'Value' },
      { key: 'ref', label: 'Reference' },
    ],
    rows: [],
  },
  dealerVerification: {
    title: 'Dealer Verification',
    subtitle: 'Review and verify dealer documents & KYC',
    filters: [{ key: 'status', label: 'Status', options: ['Verified', 'Pending', 'In Review', 'Rejected'] }],
    columns: [
      { key: 'id', label: 'Dealer ID', type: 'id' },
      { key: 'name', label: 'Dealer Name', strong: true },
      { key: 'city', label: 'City' },
      { key: 'gst', label: 'GST No.' },
      { key: 'docs', label: 'Documents' },
      { key: 'status', label: 'KYC Status', type: 'badge' },
    ],
    rows: [],
  },
  dealerApproval: {
    title: 'Dealer Approval Status',
    subtitle: 'Track onboarding approval workflow stage',
    filters: [{ key: 'status', label: 'Status', options: ['Approved', 'Pending', 'Rejected'] }],
    columns: [
      { key: 'id', label: 'Dealer ID', type: 'id' },
      { key: 'name', label: 'Dealer Name', strong: true },
      { key: 'type', label: 'Type' },
      { key: 'requested', label: 'Requested', type: 'date' },
      { key: 'stage', label: 'Stage' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    rows: [],
  },
  purchaseOrders: {
    title: 'Purchase Orders',
    subtitle: 'All raised purchase orders and their fulfilment',
    filters: [{ key: 'status', label: 'Status', options: ['Draft', 'Confirmed', 'Processing', 'Delivered', 'Cancelled'] }],
    columns: [
      { key: 'id', label: 'PO Number', type: 'id' },
      { key: 'date', label: 'Order Date', type: 'date' },
      { key: 'supplier', label: 'Supplier', strong: true },
      { key: 'items', label: 'Items', type: 'number' },
      { key: 'amount', label: 'Amount' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    rows: [],
  },
  incomingPO: {
    title: 'Incoming Purchase Orders',
    subtitle: 'Orders raised by your dealers that you need to fulfil',
    filters: [{ key: 'status', label: 'Status', options: ['Pending', 'Confirmed', 'Processing', 'Delivered', 'Cancelled'] }],
    columns: [
      { key: 'id', label: 'PO Number', type: 'id' },
      { key: 'date', label: 'Order Date', type: 'date' },
      { key: 'dealer', label: 'Dealer', strong: true },
      { key: 'items', label: 'Items', type: 'number' },
      { key: 'amount', label: 'Amount' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    rows: [],
  },
  poStatus: {
    title: 'Purchase Order Status Tracking',
    subtitle: 'Live fulfilment status of purchase orders',
    filters: [{ key: 'status', label: 'Status', options: ['Confirmed', 'Processing', 'Shipped', 'Delivered'] }],
    columns: [
      { key: 'id', label: 'PO Number', type: 'id' },
      { key: 'supplier', label: 'Supplier', strong: true },
      { key: 'eta', label: 'ETA', type: 'date' },
      { key: 'progress', label: 'Progress' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    rows: [],
  },
  salesOrders: {
    title: 'Sales Orders',
    subtitle: 'Customer & dealer sales orders',
    filters: [{ key: 'status', label: 'Status', options: ['Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] }],
    columns: [
      { key: 'id', label: 'SO Number', type: 'id' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'customer', label: 'Customer', strong: true },
      { key: 'items', label: 'Items', type: 'number' },
      { key: 'amount', label: 'Amount' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    rows: [],
  },
  manualSales: {
    title: 'Direct Sale',
    subtitle: 'Sell a single product directly to a customer or dealer from your own stock',
    filters: [{ key: 'status', label: 'Status', options: ['Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] }],
    columns: [
      { key: 'id', label: 'SO Number', type: 'id' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'customer', label: 'Customer / Dealer', strong: true },
      { key: 'items', label: 'Items', type: 'number' },
      { key: 'amount', label: 'Amount' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    rows: [],
  },
  invoices: {
    title: 'Invoices',
    subtitle: 'Generated invoices & payment status',
    filters: [{ key: 'status', label: 'Payment', options: ['Paid', 'Unpaid', 'Overdue'] }],
    columns: [
      { key: 'id', label: 'Invoice #', type: 'id' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'dealer', label: 'Billed To', strong: true },
      { key: 'soNumber', label: 'SO Number' },
      { key: 'items', label: 'Items', type: 'number' },
      { key: 'amount', label: 'Amount' },
      { key: 'balance', label: 'Balance Due' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    rows: [],
  },
  ledger: {
    title: 'Ledger Statement',
    subtitle: 'Account ledger with running balance',
    filters: [],
    columns: [
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'dealer', label: 'Dealer', strong: true },
      { key: 'reference', label: 'Reference', type: 'id' },
      { key: 'description', label: 'Description' },
      { key: 'debit', label: 'Debit' },
      { key: 'credit', label: 'Credit' },
      { key: 'balance', label: 'Balance' },
    ],
    rows: [],
  },
  dispatchRequests: {
    title: 'Dispatch Requests',
    subtitle: 'Pending and processed dispatch requests',
    filters: [{ key: 'status', label: 'Status', options: ['Pending', 'Processing', 'Dispatched'] }],
    columns: [
      { key: 'id', label: 'Request #', type: 'id' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'dealer', label: 'Dealer', strong: true },
      { key: 'items', label: 'Items', type: 'number' },
      { key: 'priority', label: 'Priority', type: 'badge' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    rows: [],
  },
  shipments: {
    title: 'Shipment Details',
    subtitle: 'Carrier, AWB and shipment information',
    filters: [{ key: 'carrier', label: 'Carrier', options: ['BlueDart', 'Delhivery', 'DTDC', 'Gati'] }],
    columns: [
      { key: 'id', label: 'AWB No.', type: 'id' },
      { key: 'dealer', label: 'Consignee', strong: true },
      { key: 'carrier', label: 'Carrier' },
      { key: 'city', label: 'Destination' },
      { key: 'weight', label: 'Weight' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    rows: [],
  },
  tracking: {
    title: 'Tracking Status',
    subtitle: 'Live tracking of all active shipments',
    filters: [{ key: 'status', label: 'Status', options: ['In Transit', 'Out for Delivery', 'Delivered'] }],
    columns: [
      { key: 'id', label: 'AWB No.', type: 'id' },
      { key: 'dealer', label: 'Consignee', strong: true },
      { key: 'location', label: 'Current Location' },
      { key: 'eta', label: 'ETA', type: 'date' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    rows: [],
  },
  delivery: {
    title: 'Delivery Status',
    subtitle: 'Confirmed deliveries and proof of delivery',
    filters: [{ key: 'status', label: 'Status', options: ['Delivered', 'Out for Delivery', 'Pending'] }],
    columns: [
      { key: 'id', label: 'AWB No.', type: 'id' },
      { key: 'dealer', label: 'Delivered To', strong: true },
      { key: 'date', label: 'Delivery Date', type: 'date' },
      { key: 'receiver', label: 'Received By' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    rows: [],
  },
  queries: {
    title: 'Query History',
    subtitle: 'Queries you raised, and queries addressed to you for response',
    filters: [{ key: 'status', label: 'Status', options: ['Open', 'Responded', 'Closed'] }],
    columns: [
      { key: 'date', label: 'Raised On', type: 'date' },
      { key: 'subject', label: 'Subject', strong: true },
      { key: 'dealer', label: 'Raised By' },
      { key: 'recipient', label: 'Recipient' },
      { key: 'status', label: 'Status', type: 'badge' },
    ],
    rows: [],
  },
  leads: {
    title: 'Zoho Leads',
    subtitle: 'Leads synced from Zoho CRM',
    filters: [{ key: 'status', label: 'Stage', options: ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'] }],
    columns: [
      { key: 'id', label: 'Lead ID', type: 'id' },
      { key: 'name', label: 'Lead Name', strong: true },
      { key: 'company', label: 'Company' },
      { key: 'source', label: 'Source' },
      { key: 'value', label: 'Est. Value' },
      { key: 'status', label: 'Stage', type: 'badge' },
    ],
    rows: [],
  },
  leadStatus: {
    title: 'Lead Status',
    subtitle: 'Pipeline stage & temperature for each lead',
    filters: [{ key: 'temp', label: 'Temperature', options: ['Hot', 'Warm', 'Cold'] }],
    columns: [
      { key: 'id', label: 'Lead ID', type: 'id' },
      { key: 'name', label: 'Lead', strong: true },
      { key: 'temp', label: 'Temperature', type: 'badge' },
      { key: 'lastContact', label: 'Last Contact', type: 'date' },
      { key: 'next', label: 'Next Action' },
      { key: 'status', label: 'Stage', type: 'badge' },
    ],
    rows: [],
  },
  leadAssignment: {
    title: 'Lead Assignment',
    subtitle: 'Lead ownership across the sales team',
    filters: [{ key: 'owner', label: 'Owner', options: [] }],
    columns: [
      { key: 'id', label: 'Lead ID', type: 'id' },
      { key: 'name', label: 'Lead', strong: true },
      { key: 'owner', label: 'Assigned To' },
      { key: 'assigned', label: 'Assigned On', type: 'date' },
      { key: 'status', label: 'Stage', type: 'badge' },
    ],
    rows: [],
  },
  leadConversion: {
    title: 'Lead Conversion Status',
    subtitle: 'Conversion outcome & realised value',
    filters: [{ key: 'status', label: 'Result', options: ['Converted', 'Qualified', 'Lost'] }],
    columns: [
      { key: 'id', label: 'Lead ID', type: 'id' },
      { key: 'name', label: 'Lead', strong: true },
      { key: 'company', label: 'Company' },
      { key: 'value', label: 'Deal Value' },
      { key: 'conv', label: 'Conversion %' },
      { key: 'status', label: 'Result', type: 'badge' },
    ],
    rows: [],
  },
}

/* ---------------- Report configs (table + export) ---------------- */
export const REPORT_CONFIGS = {
  inventoryReport: { ...TABLE_CONFIGS.currentStock, title: 'Inventory Report', subtitle: 'Generated inventory valuation report', export: true },
  inventorySummary: {
    title: 'Inventory Summary',
    subtitle: 'Category-wise stock & valuation summary',
    export: true,
    columns: [
      { key: 'category', label: 'Category', strong: true },
      { key: 'skus', label: 'SKUs', type: 'number' },
      { key: 'units', label: 'Total Units', type: 'number' },
      { key: 'value', label: 'Stock Value' },
      { key: 'status', label: 'Health', type: 'badge' },
    ],
    rows: [],
  },
  poReport: { ...TABLE_CONFIGS.purchaseOrders, title: 'Purchase Order Report', subtitle: 'Procurement spend analysis', export: true },
  salesReport: { ...TABLE_CONFIGS.salesOrders, title: 'Sales Report', subtitle: 'Revenue & order performance report', export: true },
}

/* ---------------- Timeline data ---------------- */
export const TIMELINE_DATA = {
  movement: [],
}

/* ---------------- Form configurations ---------------- */
export const FORM_CONFIGS = {
  stockIn: {
    title: 'Stock In', subtitle: 'Record inbound inventory receipt', submit: 'Record Stock In', tone: 'success',
    fields: [
      { name: 'product', label: 'Product', type: 'select', options: [], req: true },
      { name: 'qty', label: 'Quantity', type: 'number', req: true },
      { name: 'warehouse', label: 'Warehouse', type: 'select', options: ['Central WH', 'North WH', 'West WH'], req: true },
      { name: 'po', label: 'Reference PO', placeholder: 'PO-XXXXXXX' },
      { name: 'batch', label: 'Batch / Lot No.', placeholder: 'B-XXXX-XXX' },
      { name: 'date', label: 'Receipt Date', type: 'date', req: true },
      { name: 'notes', label: 'Notes', type: 'textarea', full: true, placeholder: 'Optional remarks…' },
    ],
  },
  stockOut: {
    title: 'Stock Out', subtitle: 'Record outbound inventory issue', submit: 'Record Stock Out',
    fields: [
      { name: 'product', label: 'Product', type: 'select', options: [], req: true },
      { name: 'qty', label: 'Quantity', type: 'number', req: true },
      { name: 'warehouse', label: 'From Warehouse', type: 'select', options: ['Central WH', 'North WH', 'West WH'], req: true },
      { name: 'reason', label: 'Reason', type: 'select', options: ['Sales Order', 'Transfer', 'Damage', 'Return'], req: true },
      { name: 'ref', label: 'Reference', placeholder: 'SO-XXXXXXX' },
      { name: 'date', label: 'Issue Date', type: 'date', req: true },
      { name: 'notes', label: 'Notes', type: 'textarea', full: true },
    ],
  },
  addDealer: {
    title: 'Add Dealer', subtitle: 'Onboard a new dealer to the network', submit: 'Submit for Approval', tone: 'success',
    fields: [
      { name: 'name', label: 'Dealer / Firm Name', req: true },
      { name: 'contact', label: 'Contact Person', req: true },
      { name: 'email', label: 'Email', type: 'email', req: true },
      { name: 'phone', label: 'Mobile Number', req: true },
      { name: 'gst', label: 'GST Number', req: true },
      { name: 'pan', label: 'PAN', placeholder: 'ABCDE1234F' },
      { name: 'type', label: 'Dealer Type', type: 'select', options: ['Super Dealer', 'Sub Dealer', 'Exclusive Dealer'], req: true },
      { name: 'region', label: 'Region / City', req: true },
      { name: 'address', label: 'Address', type: 'textarea', full: true, req: true },
    ],
  },
  createPO: {
    title: 'Create Purchase Order', subtitle: 'Raise a new purchase order to a supplier', submit: 'Create Purchase Order',
    fields: [
      { name: 'supplier', label: 'Supplier', req: true },
      { name: 'product', label: 'Product', type: 'select', options: [], req: true },
      { name: 'qty', label: 'Quantity', type: 'number', req: true },
      { name: 'price', label: 'Unit Price (₹)', type: 'number', req: true },
      { name: 'date', label: 'Order Date', type: 'date', req: true },
      { name: 'eta', label: 'Expected Delivery', type: 'date' },
      { name: 'terms', label: 'Payment Terms', type: 'select', options: ['Advance', 'Net 15', 'Net 30', 'Net 45'] },
      { name: 'notes', label: 'Notes', type: 'textarea', full: true },
    ],
  },
}

/* ---------------- Dashboard data (per role) ---------------- */
export const DASHBOARD_DATA = {
  super_stockist: {
    title: 'Super Stockist Dashboard',
    subtitle: 'Network-wide inventory, orders and dealer overview',
    stats: [
      { label: 'Total Inventory', value: '—', icon: 'Boxes', color: '#111111', accent: '#f5f5f5', trend: '', up: true, sub: 'units across warehouses' },
      { label: 'Available Stock', value: '—', icon: 'PackageCheck', color: '#333333', accent: '#f0f0f0', trend: '', up: true, sub: 'ready to dispatch' },
      { label: 'Purchase Orders', value: '—', icon: 'ShoppingCart', color: '#555555', accent: '#ebebeb', trend: '', up: true, sub: 'awaiting approval' },
      { label: 'Sales Orders', value: '—', icon: 'Receipt', color: '#444444', accent: '#ebebeb', trend: '', up: true, sub: 'this month' },
      { label: 'Pending Dispatch', value: '—', icon: 'Truck', color: '#666666', accent: '#f0f0f0', trend: '', up: false, sub: 'awaiting shipment' },
      { label: 'Total Dealers', value: '—', icon: 'Users', color: '#777777', accent: '#f5f5f5', trend: '', up: true, sub: 'pending approval' },
    ],
  },
  exclusive_dealer: {
    title: 'Exclusive Dealer Dashboard',
    subtitle: 'Your inventory, orders and sub-dealer network',
    stats: [
      { label: 'Available Inventory', value: '—', icon: 'Boxes', color: '#111111', accent: '#f5f5f5', trend: '', up: true, sub: 'units in stock' },
      { label: 'Pending Orders', value: '—', icon: 'Clock', color: '#444444', accent: '#f0f0f0', trend: '', up: true, sub: 'awaiting fulfilment' },
      { label: 'Sales Orders', value: '—', icon: 'Receipt', color: '#333333', accent: '#ebebeb', trend: '', up: true, sub: 'this month' },
      { label: 'Dispatch Status', value: '—', icon: 'Truck', color: '#555555', accent: '#ebebeb', trend: '', up: true, sub: 'on-time delivery' },
    ],
  },
  sub_dealer: {
    title: 'Sub Dealer Dashboard',
    subtitle: 'Your stock, orders and deliveries at a glance',
    stats: [
      { label: 'Inventory Available', value: '—', icon: 'Boxes', color: '#111111', accent: '#f5f5f5', trend: '', up: true, sub: 'units in stock' },
      { label: 'Purchase Orders', value: '—', icon: 'ShoppingCart', color: '#444444', accent: '#f0f0f0', trend: '', up: true, sub: 'in transit' },
      { label: 'Sales Orders', value: '—', icon: 'Receipt', color: '#333333', accent: '#ebebeb', trend: '', up: true, sub: 'this month' },
      { label: 'Pending Deliveries', value: '—', icon: 'PackageOpen', color: '#555555', accent: '#f0f0f0', trend: '', up: false, sub: 'in delivery queue' },
    ],
  },
}

/* Charts — empty until API connected */
export const SALES_TREND = []
export const CATEGORY_SPLIT = []
export const ORDER_VOLUME = []

export const NOTIFICATIONS = []

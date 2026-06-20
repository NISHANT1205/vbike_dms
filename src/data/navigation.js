/* ============================================================
   Role-based navigation trees.
   Each leaf -> { label, slug, page, cfg }
   page: 'dashboard' | 'table' | 'form' | 'timeline' | 'report'
   App.jsx builds routes dynamically from these trees.
   ============================================================ */

const dash = { label: 'Dashboard', slug: '', page: 'dashboard', icon: 'LayoutDashboard' }

const accounts = { label: 'Ledger Statement', slug: 'accounts/ledger', page: 'table', cfg: 'ledger', icon: 'Wallet' }
const queryHistory = { label: 'Raise Any Query', slug: 'query/history', page: 'table', cfg: 'queries', icon: 'LifeBuoy' }

export const NAVIGATION = {
  /* ========================= SUPER STOCKIST ========================= */
  super_stockist: [
    dash,
    {
      label: 'Inventory Management', icon: 'Boxes', children: [
        { label: 'Current Stock', slug: 'inventory/stock', page: 'table', cfg: 'currentStock' },
        { label: 'Stock History', slug: 'inventory/history', page: 'table', cfg: 'inventoryHistory' },
      ],
    },
    {
      label: 'Dealer Onboarding', icon: 'UserPlus', children: [
        { label: 'Dealer Onboarding', slug: 'dealers/add', page: 'dealer-onboard', cfg: 'super' },
        { label: 'Mapped Dealers', slug: 'dealers/mapped', page: 'mapped-dealers' },
        { label: 'Approval Status', slug: 'dealers/approval', page: 'table', cfg: 'dealerApproval' },
      ],
    },
    {
      label: 'Purchase Orders', icon: 'ShoppingCart', children: [
        { label: 'Create Purchase Order', slug: 'po/create', page: 'create-po' },
        { label: 'Purchase History', slug: 'po/list', page: 'table', cfg: 'purchaseOrders' },
      ],
    },
    {
      label: 'Sales Orders', icon: 'Receipt', children: [
        { label: 'Incoming Purchase', slug: 'so/incoming', page: 'table', cfg: 'incomingPO' },
        { label: 'Create Sales Order', slug: 'so/create', page: 'create-manual-sale' },
        { label: 'Invoice View', slug: 'so/invoices', page: 'table', cfg: 'invoices' },
      ],
    },
    accounts,
    queryHistory,
  ],

  /* ========================= EXCLUSIVE DEALER ========================= */
  exclusive_dealer: [
    dash,
    {
      label: 'Inventory Management', icon: 'Boxes', children: [
        { label: 'Inventory Overview', slug: 'inventory/overview', page: 'table', cfg: 'currentStock' },
        { label: 'Stock History', slug: 'inventory/history', page: 'table', cfg: 'inventoryHistory' },
      ],
    },
    {
      label: 'Dealer Onboarding', icon: 'UserPlus', children: [
        { label: 'Dealer Onboarding', slug: 'dealers/add', page: 'dealer-onboard', cfg: 'exclusive' },
        { label: 'Mapped Dealers', slug: 'dealers/mapped', page: 'mapped-dealers' },
        { label: 'Approval Workflow', slug: 'dealers/approval', page: 'table', cfg: 'dealerApproval' },
      ],
    },
    {
      label: 'Purchase Orders', icon: 'ShoppingCart', children: [
        { label: 'Create Purchase Order', slug: 'po/create', page: 'create-po' },
        { label: 'Purchase History', slug: 'po/history', page: 'table', cfg: 'purchaseOrders' },
      ],
    },
    {
      label: 'Sales Orders', icon: 'Receipt', children: [
        { label: 'Incoming Purchase', slug: 'so/incoming', page: 'table', cfg: 'incomingPO' },
        { label: 'Create Sales Order', slug: 'so/create', page: 'create-manual-sale' },
        { label: 'Invoice View', slug: 'so/invoices', page: 'table', cfg: 'invoices' },
      ],
    },
    accounts,
    queryHistory,
  ],

  /* ========================= SUB DEALER ========================= */
  sub_dealer: [
    dash,
    {
      label: 'Inventory Management', icon: 'Boxes', children: [
        { label: 'Inventory Overview', slug: 'inventory/overview', page: 'table', cfg: 'currentStock' },
        { label: 'Stock History', slug: 'inventory/history', page: 'table', cfg: 'inventoryHistory' },
      ],
    },
    {
      label: 'Purchase Orders', icon: 'ShoppingCart', children: [
        { label: 'Create Order', slug: 'po/create', page: 'create-po' },
        { label: 'Order History', slug: 'po/history', page: 'table', cfg: 'purchaseOrders' },
      ],
    },
    {
      label: 'Sales Orders', icon: 'Receipt', children: [
        { label: 'Create Sales Order', slug: 'so/create', page: 'create-manual-sale' },
      ],
    },
    accounts,
    queryHistory,
  ],
}

// Flatten a role tree into routable leaf descriptors.
export function getRoutes(roleId) {
  const tree = NAVIGATION[roleId] || NAVIGATION.super_stockist
  const routes = []
  for (const node of tree) {
    if (node.children) {
      for (const child of node.children) routes.push({ ...child, group: node.label })
    } else {
      routes.push(node)
    }
  }
  return routes
}

// Find breadcrumb context (group + label) for a slug.
export function findCrumb(roleId, slug) {
  const tree = NAVIGATION[roleId] || NAVIGATION.super_stockist
  for (const node of tree) {
    if (node.children) {
      const hit = node.children.find((c) => c.slug === slug)
      if (hit) return { group: node.label, label: hit.label, page: hit.page, cfg: hit.cfg }
    } else if (node.slug === slug) {
      return { group: null, label: node.label, page: node.page, cfg: node.cfg }
    }
  }
  return null
}

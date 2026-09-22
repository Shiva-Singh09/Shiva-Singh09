/*
 * projectsData — centralized factual project content.
 * Order is LOCKED: LANDLOGY → ShilpSaathi → SMM Panel → TeaTalks → CCMS.
 * Blueprint flows visualize each pipeline; links only where URLs are known.
 */
export const projectFlows = {
  landology: ['Seller', 'Property', 'Broker', 'Customer', 'Enquiry', 'Conversion'],
  shilpsaathi: ['Image', 'AI Processing', 'Enhancement', 'Product'],
  'smm-panel': ['Order', 'Validate', 'Wallet', 'Provider', 'Status', 'Complete / Refund'],
  teetalks: ['Community', 'Discussion', 'Moderation', 'Interaction'],
  'campus-complaints': ['Complaint', 'Department', 'Admin Workflow'],
}

export const projectBadges = {
  landology: 'Team Project · Full-Stack',
  shilpsaathi: 'Team Project · Full-Stack + AI/ML',
  'smm-panel': 'Project Owner · Technical Lead',
  teetalks: 'Backend + Database + AI',
  'campus-complaints': 'Backend + Database',
}

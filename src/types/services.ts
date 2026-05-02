export type ServiceStatus = 'live' | 'soon' | 'new'

export type PillarId = 1 | 2 | 3 | 4 | 5

export type PillarColor = 'blue' | 'teal' | 'amber' | 'purple' | 'green'

export interface PillarDefinition {
  name: string
  color: PillarColor
  slug: string
}

/** Shape of the `PILLARS` map keyed by pillar id */
export type Pillars = {
  [K in PillarId]: PillarDefinition
}

export interface Service {
  slug: string
  name: string
  price: string
  description: string
  pillar: PillarId
  status?: ServiceStatus
  featured?: boolean
}

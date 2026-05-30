export interface StationConfig {
  id: string
  name: string
  region: string
  type: 'mountain' | 'urban' | 'plains' | 'hub'
  timezone: string
  risks: RiskItem[]
  impacts: ImpactItem[]
  routes: RouteItem[]
  weather: {
    tempF: number
    snowDepthIn: number
    windMph: number
    alert: string
  }
  roadConditions: {
    primaryStatus: string
    secondaryStatus: string
    cotripUrl: string
  }
  sources: SourceRow[]
}

export interface RiskItem {
  id: string
  title: string
  description: string
  status: 'normal' | 'watch' | 'verify' | 'escalate'
  source: string
  sourceType: 'public' | 'synthetic' | 'manager-note'
}

export interface ImpactItem {
  area: string
  possibleEffect: string
  confidence: 'possible' | 'likely' | 'uncertain'
  verifyWith: string
}

export interface RouteItem {
  route: string
  status: 'open' | 'restricted' | 'closed' | 'unknown'
  note: string
  sourceUrl: string
  sourceLabel: string
}

export interface SourceRow {
  signal: string
  origin: string
  type: 'Public fact' | 'Model forecast' | 'Synthetic demo' | 'Manager note'
  lastChecked: string
  needsVerification: boolean
}

export const STATIONS: StationConfig[] = [
  {
    id: 'gunnison',
    name: 'Gunnison, CO',
    region: 'Mountain Division',
    type: 'mountain',
    timezone: 'America/Denver',
    risks: [
      {
        id: '1',
        title: 'I-70 Vail Pass — Possible Chain Restrictions',
        description: 'Temperature forecast below 20°F with snow. Check cotrip.org for current chain law status. Feeder schedules may be delayed.',
        status: 'watch',
        source: 'NWS forecast / Open-Meteo model',
        sourceType: 'public',
      },
      {
        id: '2',
        title: 'US-50 Monarch Summit — No Closure Reported',
        description: 'Road open with possible icy conditions. Monitor for weather-driven restrictions. Alternate route if I-70 closes.',
        status: 'normal',
        source: 'cotrip.org public feed',
        sourceType: 'public',
      },
      {
        id: '3',
        title: 'Sort Capacity — Synthetic Demo Value',
        description: 'Illustrative dock throughput estimate for twilight sort. Verify with actual sort plan and staffing sheet.',
        status: 'verify',
        source: 'Synthetic demo data',
        sourceType: 'synthetic',
      },
      {
        id: '4',
        title: 'P&D Route Density — Elevated Risk',
        description: 'Mountain residential routes may see slower travel times due to snow pack. Synthetic estimate; verify with ISP dispatch.',
        status: 'watch',
        source: 'Synthetic demo data',
        sourceType: 'synthetic',
      },
    ],
    impacts: [
      {
        area: 'Linehaul / Feeder',
        possibleEffect: 'If chain laws activate, inbound feeder from Denver hub could be delayed 30–90 minutes.',
        confidence: 'possible',
        verifyWith: 'Carrier dispatch and live cotrip.org status',
      },
      {
        area: 'P&D Operations',
        possibleEffect: 'Mountain residential routes may require extended delivery windows. ISP communication recommended.',
        confidence: 'possible',
        verifyWith: 'ISP coordinator and route planning tools',
      },
      {
        area: 'Sort Hub Staffing',
        possibleEffect: 'No direct impact from public signals. Monitor for weather-related call-outs.',
        confidence: 'uncertain',
        verifyWith: 'Local attendance sheet and supervisor check-in',
      },
      {
        area: 'Cross-Dock Timing',
        possibleEffect: 'Tight transfer windows may require priority sorting of delayed trailers.',
        confidence: 'possible',
        verifyWith: 'Sort manager and outbound feeder schedule',
      },
    ],
    routes: [
      {
        route: 'I-70 Vail Pass',
        status: 'restricted',
        note: 'Chain laws possible. Monitor for traction restrictions. Primary feeder route from Denver.',
        sourceUrl: 'https://www.cotrip.org/',
        sourceLabel: 'COtrip public feed',
      },
      {
        route: 'US-50 Monarch Summit',
        status: 'open',
        note: 'Open with possible icy conditions. No closures reported. Alternate if I-70 restricts.',
        sourceUrl: 'https://www.cotrip.org/',
        sourceLabel: 'COtrip public feed',
      },
      {
        route: 'CO-114 (Local P&D)',
        status: 'open',
        note: 'Local mountain roads snow-packed. P&D caution advised. Not a freight route.',
        sourceUrl: 'https://www.cotrip.org/',
        sourceLabel: 'COtrip public feed',
      },
    ],
    weather: {
      tempF: 18,
      snowDepthIn: 8,
      windMph: 22,
      alert: 'Winter Weather Advisory',
    },
    roadConditions: {
      primaryStatus: 'Chain laws possible',
      secondaryStatus: 'Open',
      cotripUrl: 'https://www.cotrip.org/',
    },
    sources: [
      { signal: 'Temperature / wind forecast', origin: 'Open-Meteo API', type: 'Model forecast', lastChecked: 'Demo load', needsVerification: true },
      { signal: 'Weather alerts', origin: 'National Weather Service', type: 'Public fact', lastChecked: 'Demo load', needsVerification: true },
      { signal: 'Road status (I-70, US-50)', origin: 'cotrip.org', type: 'Public fact', lastChecked: 'Demo load', needsVerification: true },
      { signal: 'Sort throughput estimate', origin: 'Local synthetic demo', type: 'Synthetic demo', lastChecked: 'Demo load', needsVerification: true },
      { signal: 'P&D density estimate', origin: 'Local synthetic demo', type: 'Synthetic demo', lastChecked: 'Demo load', needsVerification: true },
      { signal: 'Staffing impact assessment', origin: 'Manager interpretation', type: 'Manager note', lastChecked: 'Demo load', needsVerification: true },
      { signal: 'Seismic events', origin: 'USGS earthquake API', type: 'Public fact', lastChecked: 'Demo load', needsVerification: false },
    ],
  },
  {
    id: 'memphis',
    name: 'Memphis, TN — World Hub Area',
    region: 'Central Division',
    type: 'hub',
    timezone: 'America/Chicago',
    risks: [
      {
        id: '1',
        title: 'Thunderstorm Risk — Evening Sort',
        description: 'NWS predicts 60% chance of severe thunderstorms after 6 PM CDT. Monitor for lightning protocols.',
        status: 'watch',
        source: 'NWS forecast / Open-Meteo model',
        sourceType: 'public',
      },
      {
        id: '2',
        title: 'I-240 Loop — Construction Delay',
        description: 'TDOT reports lane reductions on I-240 near the hub. Feeder access may be slower.',
        status: 'watch',
        source: 'TDOT public feed',
        sourceType: 'public',
      },
      {
        id: '3',
        title: 'Twilight Sort Capacity — Synthetic Demo',
        description: 'Illustrative capacity estimate for twilight sort. Verify with WMS and staffing plan.',
        status: 'verify',
        source: 'Synthetic demo data',
        sourceType: 'synthetic',
      },
      {
        id: '4',
        title: 'Air Cargo Window — On Schedule',
        description: 'No public aviation delays reported for MEM. Verify with internal dispatch.',
        status: 'normal',
        source: 'FAA status page / FlightAware public',
        sourceType: 'public',
      },
    ],
    impacts: [
      {
        area: 'Sort Hub Throughput',
        possibleEffect: 'If lightning protocols activate, outdoor trailer moves may pause 15–30 minutes.',
        confidence: 'possible',
        verifyWith: 'Sort manager and safety observer',
      },
      {
        area: 'Feeder Access',
        possibleEffect: 'I-240 construction may add 10–15 minutes to feeder arrival times.',
        confidence: 'likely',
        verifyWith: 'Carrier dispatch and TDOT live map',
      },
      {
        area: 'Air Cargo Connection',
        possibleEffect: 'No public delays. Internal MEM dispatch confirms normal ops.',
        confidence: 'likely',
        verifyWith: 'Internal air operations and FAA status',
      },
    ],
    routes: [
      {
        route: 'I-240 Loop (Hub Access)',
        status: 'restricted',
        note: 'Construction lane reductions near hub. Plan extra feeder arrival buffer.',
        sourceUrl: 'https://www.tn.gov/tdot.html',
        sourceLabel: 'TDOT public feed',
      },
      {
        route: 'I-55 Northbound',
        status: 'open',
        note: 'Open. Primary route for northbound linehaul to St. Louis/Chicago corridor.',
        sourceUrl: 'https://www.tn.gov/tdot.html',
        sourceLabel: 'TDOT public feed',
      },
      {
        route: 'I-40 Eastbound',
        status: 'open',
        note: 'Open. Primary route for eastbound linehaul to Nashville/Atlanta corridor.',
        sourceUrl: 'https://www.tn.gov/tdot.html',
        sourceLabel: 'TDOT public feed',
      },
    ],
    weather: {
      tempF: 78,
      snowDepthIn: 0,
      windMph: 15,
      alert: 'Severe Thunderstorm Watch',
    },
    roadConditions: {
      primaryStatus: 'Construction delays',
      secondaryStatus: 'Open',
      cotripUrl: 'https://www.tn.gov/tdot.html',
    },
    sources: [
      { signal: 'Temperature / precipitation forecast', origin: 'Open-Meteo API', type: 'Model forecast', lastChecked: 'Demo load', needsVerification: true },
      { signal: 'Severe weather alerts', origin: 'National Weather Service', type: 'Public fact', lastChecked: 'Demo load', needsVerification: true },
      { signal: 'Road status (I-240, I-55, I-40)', origin: 'TDOT public feed', type: 'Public fact', lastChecked: 'Demo load', needsVerification: true },
      { signal: 'Sort throughput estimate', origin: 'Local synthetic demo', type: 'Synthetic demo', lastChecked: 'Demo load', needsVerification: true },
      { signal: 'Aviation delay status', origin: 'FAA / FlightAware public', type: 'Public fact', lastChecked: 'Demo load', needsVerification: true },
      { signal: 'Lightning protocol assessment', origin: 'Manager interpretation', type: 'Manager note', lastChecked: 'Demo load', needsVerification: true },
    ],
  },
  {
    id: 'indianapolis',
    name: 'Indianapolis, IN — Secondary Hub',
    region: 'Central Division',
    type: 'hub',
    timezone: 'America/Indiana/Indianapolis',
    risks: [
      {
        id: '1',
        title: 'I-465 Beltway — Accident Clearance',
        description: 'INDOT reports accident on I-465 west side. Possible delays for feeder arrivals from the west.',
        status: 'watch',
        source: 'INDOT public feed',
        sourceType: 'public',
      },
      {
        id: '2',
        title: 'Wind Advisory — Empty Trailer Risk',
        description: 'NWS wind advisory 35+ mph gusts. Empty trailers in yard may need repositioning.',
        status: 'watch',
        source: 'NWS forecast',
        sourceType: 'public',
      },
      {
        id: '3',
        title: 'Sort Capacity — Normal Range (Synthetic)',
        description: 'Illustrative capacity estimate. Verify with actual sort plan and WMS.',
        status: 'normal',
        source: 'Synthetic demo data',
        sourceType: 'synthetic',
      },
    ],
    impacts: [
      {
        area: 'Feeder Arrivals',
        possibleEffect: 'I-465 accident may delay westbound feeder arrivals 20–40 minutes.',
        confidence: 'possible',
        verifyWith: 'Carrier dispatch and INDOT live map',
      },
      {
        area: 'Yard Operations',
        possibleEffect: 'High winds may require securing empty trailers or delaying yard moves.',
        confidence: 'possible',
        verifyWith: 'Yard manager and safety observer',
      },
      {
        area: 'P&D Dispatch',
        possibleEffect: 'No direct public impact. Normal dispatch window expected.',
        confidence: 'likely',
        verifyWith: 'P&D supervisor and route planning',
      },
    ],
    routes: [
      {
        route: 'I-465 Beltway (West)',
        status: 'restricted',
        note: 'Accident clearance in progress. Expect delays for westbound feeder access.',
        sourceUrl: 'https://indot.in.gov/',
        sourceLabel: 'INDOT public feed',
      },
      {
        route: 'I-70 Eastbound',
        status: 'open',
        note: 'Open. Primary eastbound linehaul to Columbus/Philadelphia corridor.',
        sourceUrl: 'https://indot.in.gov/',
        sourceLabel: 'INDOT public feed',
      },
      {
        route: 'I-65 Northbound',
        status: 'open',
        note: 'Open. Primary northbound linehaul to Chicago corridor.',
        sourceUrl: 'https://indot.in.gov/',
        sourceLabel: 'INDOT public feed',
      },
    ],
    weather: {
      tempF: 52,
      snowDepthIn: 0,
      windMph: 38,
      alert: 'Wind Advisory',
    },
    roadConditions: {
      primaryStatus: 'Accident clearance',
      secondaryStatus: 'Open',
      cotripUrl: 'https://indot.in.gov/',
    },
    sources: [
      { signal: 'Wind / temperature forecast', origin: 'Open-Meteo API', type: 'Model forecast', lastChecked: 'Demo load', needsVerification: true },
      { signal: 'Weather alerts', origin: 'National Weather Service', type: 'Public fact', lastChecked: 'Demo load', needsVerification: true },
      { signal: 'Road status (I-465, I-70, I-65)', origin: 'INDOT public feed', type: 'Public fact', lastChecked: 'Demo load', needsVerification: true },
      { signal: 'Sort throughput estimate', origin: 'Local synthetic demo', type: 'Synthetic demo', lastChecked: 'Demo load', needsVerification: true },
      { signal: 'Yard safety assessment', origin: 'Manager interpretation', type: 'Manager note', lastChecked: 'Demo load', needsVerification: true },
    ],
  },
  {
    id: 'phoenix',
    name: 'Phoenix, AZ — Desert Station',
    region: 'Southwest Division',
    type: 'urban',
    timezone: 'America/Phoenix',
    risks: [
      {
        id: '1',
        title: 'Excessive Heat Warning — 110°F+',
        description: 'NWS excessive heat warning. P&D teams and yard crews need hydration protocols. Vehicle AC checks recommended.',
        status: 'escalate',
        source: 'NWS forecast',
        sourceType: 'public',
      },
      {
        id: '2',
        title: 'Dust Storm Risk — Late Afternoon',
        description: 'Monsoon pattern may produce blowing dust on I-10 corridor. Monitor ADOT alerts.',
        status: 'watch',
        source: 'NWS forecast / ADOT',
        sourceType: 'public',
      },
      {
        id: '3',
        title: 'P&D Density — Synthetic Demo',
        description: 'Illustrative route density for urban residential area. Verify with internal route planning.',
        status: 'verify',
        source: 'Synthetic demo data',
        sourceType: 'synthetic',
      },
    ],
    impacts: [
      {
        area: 'P&D Operations',
        possibleEffect: 'Heat protocols may require earlier dispatch or extended breaks. Delivery windows may shift.',
        confidence: 'likely',
        verifyWith: 'P&D manager and HR safety protocols',
      },
      {
        area: 'Linehaul / Feeder',
        possibleEffect: 'No major public impact. Monitor I-10 for dust-related visibility issues.',
        confidence: 'possible',
        verifyWith: 'ADOT alerts and carrier dispatch',
      },
      {
        area: 'Yard / Dock',
        possibleEffect: 'Heat stress risk for outdoor dock crews. Increase rotation and hydration stations.',
        confidence: 'likely',
        verifyWith: 'Safety observer and facilities',
      },
    ],
    routes: [
      {
        route: 'I-10 Westbound',
        status: 'open',
        note: 'Open. Monitor for dust storm visibility reductions late afternoon.',
        sourceUrl: 'https://az511.gov/',
        sourceLabel: 'ADOT public feed',
      },
      {
        route: 'I-17 Northbound',
        status: 'open',
        note: 'Open. Primary route for northbound feeder to Flagstaff corridor.',
        sourceUrl: 'https://az511.gov/',
        sourceLabel: 'ADOT public feed',
      },
      {
        route: 'Loop 202 (South Mountain)',
        status: 'open',
        note: 'Open. Local P&D route access. No restrictions reported.',
        sourceUrl: 'https://az511.gov/',
        sourceLabel: 'ADOT public feed',
      },
    ],
    weather: {
      tempF: 112,
      snowDepthIn: 0,
      windMph: 12,
      alert: 'Excessive Heat Warning',
    },
    roadConditions: {
      primaryStatus: 'Open',
      secondaryStatus: 'Dust risk late PM',
      cotripUrl: 'https://az511.gov/',
    },
    sources: [
      { signal: 'Temperature / heat index forecast', origin: 'Open-Meteo API', type: 'Model forecast', lastChecked: 'Demo load', needsVerification: true },
      { signal: 'Excessive heat warning', origin: 'National Weather Service', type: 'Public fact', lastChecked: 'Demo load', needsVerification: true },
      { signal: 'Road status (I-10, I-17, Loop 202)', origin: 'ADOT public feed', type: 'Public fact', lastChecked: 'Demo load', needsVerification: true },
      { signal: 'P&D density estimate', origin: 'Local synthetic demo', type: 'Synthetic demo', lastChecked: 'Demo load', needsVerification: true },
      { signal: 'Heat protocol assessment', origin: 'Manager interpretation', type: 'Manager note', lastChecked: 'Demo load', needsVerification: true },
    ],
  },
]

export const DEFAULT_STATION = STATIONS[0]

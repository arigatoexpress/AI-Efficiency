import assert from 'node:assert/strict'
import test from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { STATIONS } from '../src/data/stations'
import ShiftReadiness from '../src/components/ShiftReadiness'
import RouteWatch from '../src/components/RouteWatch'
import SourceTrail from '../src/components/SourceTrail'

test('static station panels identify illustrative signals and source references for every station', () => {
  for (const station of STATIONS) {
    const readiness = renderToStaticMarkup(React.createElement(ShiftReadiness, { station }))
    const routes = renderToStaticMarkup(React.createElement(RouteWatch, { station }))
    const sources = renderToStaticMarkup(React.createElement(SourceTrail, { station }))
    assert.match(readiness, /Synthetic scenario risks/, station.id)
    assert.doesNotMatch(readiness, /• Public data/, station.id)
    assert.match(routes, /Illustrative road conditions/, station.id)
    assert.match(routes, /Verify current conditions:/, station.id)
    assert.match(sources, /Reference source/, station.id)
    assert.doesNotMatch(sources, />Public fact<|>Model forecast<|>No<|>Origin</, station.id)
    assert.equal((sources.match(/Yes — verify internally/g) || []).length, station.sources.length, station.id)
    assert.match(sources, /Live feeds, when enabled, appear in their own panel/, station.id)
  }
})

import { describe, it, expect } from 'vitest';
import { createDefaultGameState, createInitialLeagueTable, sortLeagueTable } from './storage';
import type { Team } from '../types';

const makeTeam = (id: string): Team => ({
  id,
  name: `Team ${id}`,
  shortName: id.toUpperCase(),
  primaryColor: '#ff0000',
  secondaryColor: '#ffffff',
  stadium: `${id} Stadium`,
  coach: 'Coach',
  capacity: 50000,
});

const TEAMS = ['flamengo', 'palmeiras', 'sao-paulo'].map(makeTeam);

describe('createDefaultGameState', () => {
  it('sets the provided selectedTeamId', () => {
    const state = createDefaultGameState(TEAMS, 'palmeiras');
    expect(state.selectedTeamId).toBe('palmeiras');
  });

  it('starts at round 1', () => {
    const state = createDefaultGameState(TEAMS, 'flamengo');
    expect(state.currentRound).toBe(1);
  });

  it('starts with no match results', () => {
    const state = createDefaultGameState(TEAMS, 'flamengo');
    expect(state.matchResults).toHaveLength(0);
  });

  it('initialises league table with one entry per team', () => {
    const state = createDefaultGameState(TEAMS, 'flamengo');
    expect(state.leagueTable).toHaveLength(TEAMS.length);
  });

  it('initialises every team with zero stats', () => {
    const state = createDefaultGameState(TEAMS, 'flamengo');
    for (const entry of state.leagueTable) {
      expect(entry.played).toBe(0);
      expect(entry.won).toBe(0);
      expect(entry.drawn).toBe(0);
      expect(entry.lost).toBe(0);
      expect(entry.goalsFor).toBe(0);
      expect(entry.goalsAgainst).toBe(0);
      expect(entry.points).toBe(0);
    }
  });

  it('includes all team IDs in the league table', () => {
    const state = createDefaultGameState(TEAMS, 'flamengo');
    const ids = state.leagueTable.map(e => e.teamId);
    expect(ids).toContain('flamengo');
    expect(ids).toContain('palmeiras');
    expect(ids).toContain('sao-paulo');
  });
});

describe('createInitialLeagueTable', () => {
  it('assigns sequential positions starting at 1', () => {
    const table = createInitialLeagueTable(TEAMS);
    expect(table.map(e => e.position)).toEqual([1, 2, 3]);
  });
});

describe('sortLeagueTable', () => {
  it('sorts by points descending', () => {
    const table = createInitialLeagueTable(TEAMS).map((e, i) => ({
      ...e,
      points: [9, 6, 3][i],
    }));
    const sorted = sortLeagueTable(table);
    expect(sorted[0].teamId).toBe('flamengo');
    expect(sorted[1].teamId).toBe('palmeiras');
    expect(sorted[2].teamId).toBe('sao-paulo');
  });

  it('breaks points ties by goal difference', () => {
    const table = createInitialLeagueTable(TEAMS).map((e, i) => ({
      ...e,
      points: 6,
      goalsFor: [5, 3, 3][i],
      goalsAgainst: [1, 1, 2][i],
    }));
    const sorted = sortLeagueTable(table);
    // flamengo: GD +4, palmeiras: GD +2, sao-paulo: GD +1
    expect(sorted[0].teamId).toBe('flamengo');
    expect(sorted[1].teamId).toBe('palmeiras');
  });

  it('reassigns positions after sorting', () => {
    const table = createInitialLeagueTable(TEAMS).map((e, i) => ({
      ...e,
      points: [0, 9, 3][i], // palmeiras should be 1st
    }));
    const sorted = sortLeagueTable(table);
    expect(sorted[0].position).toBe(1);
    expect(sorted[1].position).toBe(2);
    expect(sorted[2].position).toBe(3);
    expect(sorted[0].teamId).toBe('palmeiras');
  });
});

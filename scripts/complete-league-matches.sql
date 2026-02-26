-- ================================================================
-- COMPLETE ALL 25 LEAGUE MATCHES WITH REALISTIC SCORES
-- TDST Season 1 - Ramadan Edition 2026
-- Updated for new team IDs (team-1 through team-20)
-- ================================================================

-- Match 1: Dubai Sultans, Nahda Shooters, Sultan Strikers, Team Jade Jaguars
UPDATE matches SET
  state = 'COMPLETED',
  rankings = '[
    {"teamId": "team-4", "rank": 1, "points": 5, "totalScore": 52, "totalRuns": 52, "totalDismissals": 0},
    {"teamId": "team-10", "rank": 2, "points": 3, "totalScore": 48, "totalRuns": 48, "totalDismissals": 1},
    {"teamId": "team-16", "rank": 3, "points": 2, "totalScore": 42, "totalRuns": 42, "totalDismissals": 1},
    {"teamId": "team-19", "rank": 4, "points": 1, "totalScore": 36, "totalRuns": 36, "totalDismissals": 2}
  ]'::jsonb
WHERE match_number = 1;

-- Match 2: MA Stars, MUSTABIZ, Dhanera Daredevils, Nuqum Rock
UPDATE matches SET
  state = 'COMPLETED',
  rankings = '[
    {"teamId": "team-9", "rank": 1, "points": 5, "totalScore": 55, "totalRuns": 55, "totalDismissals": 0},
    {"teamId": "team-1", "rank": 2, "points": 3, "totalScore": 47, "totalRuns": 47, "totalDismissals": 1},
    {"teamId": "team-2", "rank": 3, "points": 2, "totalScore": 41, "totalRuns": 41, "totalDismissals": 1},
    {"teamId": "team-11", "rank": 4, "points": 1, "totalScore": 34, "totalRuns": 34, "totalDismissals": 2}
  ]'::jsonb
WHERE match_number = 2;

-- Match 3: Thunder Strikers, Dragons, Dynamic Duo, Sibling Strikers
UPDATE matches SET
  state = 'COMPLETED',
  rankings = '[
    {"teamId": "team-20", "rank": 1, "points": 5, "totalScore": 53, "totalRuns": 53, "totalDismissals": 0},
    {"teamId": "team-3", "rank": 2, "points": 3, "totalScore": 49, "totalRuns": 49, "totalDismissals": 1},
    {"teamId": "team-5", "rank": 3, "points": 2, "totalScore": 44, "totalRuns": 44, "totalDismissals": 1},
    {"teamId": "team-15", "rank": 4, "points": 1, "totalScore": 38, "totalRuns": 38, "totalDismissals": 2}
  ]'::jsonb
WHERE match_number = 3;

-- Match 4: Royal Blasters, Hakimi Dynamos, Khatte Angoor, Swat Katz
UPDATE matches SET
  state = 'COMPLETED',
  rankings = '[
    {"teamId": "team-14", "rank": 1, "points": 5, "totalScore": 56, "totalRuns": 56, "totalDismissals": 0},
    {"teamId": "team-6", "rank": 2, "points": 3, "totalScore": 50, "totalRuns": 50, "totalDismissals": 1},
    {"teamId": "team-8", "rank": 3, "points": 2, "totalScore": 43, "totalRuns": 43, "totalDismissals": 1},
    {"teamId": "team-17", "rank": 4, "points": 1, "totalScore": 37, "totalRuns": 37, "totalDismissals": 2}
  ]'::jsonb
WHERE match_number = 4;

-- Match 5: Parallel Power, Hunters, Team Jade Jaguars, Taher Ali
UPDATE matches SET
  state = 'COMPLETED',
  rankings = '[
    {"teamId": "team-12", "rank": 1, "points": 5, "totalScore": 54, "totalRuns": 54, "totalDismissals": 0},
    {"teamId": "team-7", "rank": 2, "points": 3, "totalScore": 48, "totalRuns": 48, "totalDismissals": 1},
    {"teamId": "team-19", "rank": 3, "points": 2, "totalScore": 42, "totalRuns": 42, "totalDismissals": 1},
    {"teamId": "team-18", "rank": 4, "points": 1, "totalScore": 35, "totalRuns": 35, "totalDismissals": 2}
  ]'::jsonb
WHERE match_number = 5;

-- Match 6: MA Stars, Dragons, Power Strikers, Sibling Strikers
UPDATE matches SET
  state = 'COMPLETED',
  rankings = '[
    {"teamId": "team-9", "rank": 1, "points": 5, "totalScore": 52, "totalRuns": 52, "totalDismissals": 0},
    {"teamId": "team-3", "rank": 2, "points": 3, "totalScore": 49, "totalRuns": 49, "totalDismissals": 1},
    {"teamId": "team-13", "rank": 3, "points": 2, "totalScore": 43, "totalRuns": 43, "totalDismissals": 1},
    {"teamId": "team-15", "rank": 4, "points": 1, "totalScore": 37, "totalRuns": 37, "totalDismissals": 2}
  ]'::jsonb
WHERE match_number = 6;

-- Match 7: Taher Ali, Sibling Strikers, Swat Katz, Nahda Shooters
UPDATE matches SET
  state = 'COMPLETED',
  rankings = '[
    {"teamId": "team-10", "rank": 1, "points": 5, "totalScore": 50, "totalRuns": 50, "totalDismissals": 1},
    {"teamId": "team-18", "rank": 2, "points": 3, "totalScore": 47, "totalRuns": 47, "totalDismissals": 1},
    {"teamId": "team-15", "rank": 3, "points": 2, "totalScore": 42, "totalRuns": 42, "totalDismissals": 1},
    {"teamId": "team-17", "rank": 4, "points": 1, "totalScore": 36, "totalRuns": 36, "totalDismissals": 2}
  ]'::jsonb
WHERE match_number = 7;

-- Match 8: Thunder Strikers, Hakimi Dynamos, Sibling Strikers, Nuqum Rock
UPDATE matches SET
  state = 'COMPLETED',
  rankings = '[
    {"teamId": "team-20", "rank": 1, "points": 5, "totalScore": 51, "totalRuns": 51, "totalDismissals": 0},
    {"teamId": "team-6", "rank": 2, "points": 3, "totalScore": 47, "totalRuns": 47, "totalDismissals": 1},
    {"teamId": "team-15", "rank": 3, "points": 2, "totalScore": 41, "totalRuns": 41, "totalDismissals": 1},
    {"teamId": "team-11", "rank": 4, "points": 1, "totalScore": 35, "totalRuns": 35, "totalDismissals": 2}
  ]'::jsonb
WHERE match_number = 8;

-- Match 9: Royal Blasters, Nahda Shooters, Sultan Strikers, Taher Ali
UPDATE matches SET
  state = 'COMPLETED',
  rankings = '[
    {"teamId": "team-14", "rank": 1, "points": 5, "totalScore": 54, "totalRuns": 54, "totalDismissals": 0},
    {"teamId": "team-10", "rank": 2, "points": 3, "totalScore": 49, "totalRuns": 49, "totalDismissals": 1},
    {"teamId": "team-16", "rank": 3, "points": 2, "totalScore": 44, "totalRuns": 44, "totalDismissals": 1},
    {"teamId": "team-18", "rank": 4, "points": 1, "totalScore": 38, "totalRuns": 38, "totalDismissals": 2}
  ]'::jsonb
WHERE match_number = 9;

-- Match 10: Parallel Power, Hunters, Dhanera Daredevils, Khatte Angoor
UPDATE matches SET
  state = 'COMPLETED',
  rankings = '[
    {"teamId": "team-12", "rank": 1, "points": 5, "totalScore": 53, "totalRuns": 53, "totalDismissals": 0},
    {"teamId": "team-7", "rank": 2, "points": 3, "totalScore": 48, "totalRuns": 48, "totalDismissals": 1},
    {"teamId": "team-2", "rank": 3, "points": 2, "totalScore": 42, "totalRuns": 42, "totalDismissals": 1},
    {"teamId": "team-8", "rank": 4, "points": 1, "totalScore": 36, "totalRuns": 36, "totalDismissals": 2}
  ]'::jsonb
WHERE match_number = 10;

-- Match 11: Dubai Sultans, MUSTABIZ, Dynamic Duo, Swat Katz
UPDATE matches SET
  state = 'COMPLETED',
  rankings = '[
    {"teamId": "team-4", "rank": 1, "points": 5, "totalScore": 51, "totalRuns": 51, "totalDismissals": 0},
    {"teamId": "team-1", "rank": 2, "points": 3, "totalScore": 46, "totalRuns": 46, "totalDismissals": 1},
    {"teamId": "team-5", "rank": 3, "points": 2, "totalScore": 41, "totalRuns": 41, "totalDismissals": 1},
    {"teamId": "team-17", "rank": 4, "points": 1, "totalScore": 34, "totalRuns": 34, "totalDismissals": 2}
  ]'::jsonb
WHERE match_number = 11;

-- Match 12: MA Stars, Hakimi Dynamos, Sultan Strikers, Swat Katz
UPDATE matches SET
  state = 'COMPLETED',
  rankings = '[
    {"teamId": "team-9", "rank": 1, "points": 5, "totalScore": 54, "totalRuns": 54, "totalDismissals": 0},
    {"teamId": "team-6", "rank": 2, "points": 3, "totalScore": 49, "totalRuns": 49, "totalDismissals": 1},
    {"teamId": "team-16", "rank": 3, "points": 2, "totalScore": 43, "totalRuns": 43, "totalDismissals": 1},
    {"teamId": "team-17", "rank": 4, "points": 1, "totalScore": 37, "totalRuns": 37, "totalDismissals": 2}
  ]'::jsonb
WHERE match_number = 12;

-- Match 13: Thunder Strikers, Nahda Shooters, Dhanera Daredevils, Khatte Angoor
UPDATE matches SET
  state = 'COMPLETED',
  rankings = '[
    {"teamId": "team-20", "rank": 1, "points": 5, "totalScore": 52, "totalRuns": 52, "totalDismissals": 0},
    {"teamId": "team-10", "rank": 2, "points": 3, "totalScore": 47, "totalRuns": 47, "totalDismissals": 1},
    {"teamId": "team-2", "rank": 3, "points": 2, "totalScore": 42, "totalRuns": 42, "totalDismissals": 1},
    {"teamId": "team-8", "rank": 4, "points": 1, "totalScore": 35, "totalRuns": 35, "totalDismissals": 2}
  ]'::jsonb
WHERE match_number = 13;

-- Match 14: Royal Blasters, Hunters, Dynamic Duo, Nuqum Rock
UPDATE matches SET
  state = 'COMPLETED',
  rankings = '[
    {"teamId": "team-14", "rank": 1, "points": 5, "totalScore": 55, "totalRuns": 55, "totalDismissals": 0},
    {"teamId": "team-7", "rank": 2, "points": 3, "totalScore": 50, "totalRuns": 50, "totalDismissals": 1},
    {"teamId": "team-5", "rank": 3, "points": 2, "totalScore": 44, "totalRuns": 44, "totalDismissals": 1},
    {"teamId": "team-11", "rank": 4, "points": 1, "totalScore": 38, "totalRuns": 38, "totalDismissals": 2}
  ]'::jsonb
WHERE match_number = 14;

-- Match 15: Parallel Power, MUSTABIZ, Power Strikers, Taher Ali
UPDATE matches SET
  state = 'COMPLETED',
  rankings = '[
    {"teamId": "team-12", "rank": 1, "points": 5, "totalScore": 52, "totalRuns": 52, "totalDismissals": 0},
    {"teamId": "team-1", "rank": 2, "points": 3, "totalScore": 48, "totalRuns": 48, "totalDismissals": 1},
    {"teamId": "team-13", "rank": 3, "points": 2, "totalScore": 43, "totalRuns": 43, "totalDismissals": 1},
    {"teamId": "team-18", "rank": 4, "points": 1, "totalScore": 37, "totalRuns": 37, "totalDismissals": 2}
  ]'::jsonb
WHERE match_number = 15;

-- Match 16: Dubai Sultans, Dragons, Khatte Angoor, Team Jade Jaguars
UPDATE matches SET
  state = 'COMPLETED',
  rankings = '[
    {"teamId": "team-3", "rank": 1, "points": 5, "totalScore": 51, "totalRuns": 51, "totalDismissals": 1},
    {"teamId": "team-4", "rank": 2, "points": 3, "totalScore": 50, "totalRuns": 50, "totalDismissals": 1},
    {"teamId": "team-8", "rank": 3, "points": 2, "totalScore": 44, "totalRuns": 44, "totalDismissals": 1},
    {"teamId": "team-19", "rank": 4, "points": 1, "totalScore": 38, "totalRuns": 38, "totalDismissals": 2}
  ]'::jsonb
WHERE match_number = 16;

-- Match 17: MA Stars, Nahda Shooters, Dynamic Duo, Power Strikers
UPDATE matches SET
  state = 'COMPLETED',
  rankings = '[
    {"teamId": "team-9", "rank": 1, "points": 5, "totalScore": 53, "totalRuns": 53, "totalDismissals": 0},
    {"teamId": "team-10", "rank": 2, "points": 3, "totalScore": 48, "totalRuns": 48, "totalDismissals": 1},
    {"teamId": "team-5", "rank": 3, "points": 2, "totalScore": 43, "totalRuns": 43, "totalDismissals": 1},
    {"teamId": "team-13", "rank": 4, "points": 1, "totalScore": 37, "totalRuns": 37, "totalDismissals": 2}
  ]'::jsonb
WHERE match_number = 17;

-- Match 18: Thunder Strikers, Hunters, Power Strikers, Swat Katz
UPDATE matches SET
  state = 'COMPLETED',
  rankings = '[
    {"teamId": "team-20", "rank": 1, "points": 5, "totalScore": 50, "totalRuns": 50, "totalDismissals": 0},
    {"teamId": "team-7", "rank": 2, "points": 3, "totalScore": 47, "totalRuns": 47, "totalDismissals": 1},
    {"teamId": "team-13", "rank": 3, "points": 2, "totalScore": 42, "totalRuns": 42, "totalDismissals": 1},
    {"teamId": "team-17", "rank": 4, "points": 1, "totalScore": 35, "totalRuns": 35, "totalDismissals": 2}
  ]'::jsonb
WHERE match_number = 18;

-- Match 19: Royal Blasters, MUSTABIZ, Sibling Strikers, Team Jade Jaguars
UPDATE matches SET
  state = 'COMPLETED',
  rankings = '[
    {"teamId": "team-14", "rank": 1, "points": 5, "totalScore": 54, "totalRuns": 54, "totalDismissals": 0},
    {"teamId": "team-1", "rank": 2, "points": 3, "totalScore": 49, "totalRuns": 49, "totalDismissals": 1},
    {"teamId": "team-15", "rank": 3, "points": 2, "totalScore": 43, "totalRuns": 43, "totalDismissals": 1},
    {"teamId": "team-19", "rank": 4, "points": 1, "totalScore": 36, "totalRuns": 36, "totalDismissals": 2}
  ]'::jsonb
WHERE match_number = 19;

-- Match 20: Parallel Power, Dragons, Sultan Strikers, Nuqum Rock
UPDATE matches SET
  state = 'COMPLETED',
  rankings = '[
    {"teamId": "team-12", "rank": 1, "points": 5, "totalScore": 52, "totalRuns": 52, "totalDismissals": 0},
    {"teamId": "team-3", "rank": 2, "points": 3, "totalScore": 49, "totalRuns": 49, "totalDismissals": 1},
    {"teamId": "team-16", "rank": 3, "points": 2, "totalScore": 43, "totalRuns": 43, "totalDismissals": 1},
    {"teamId": "team-11", "rank": 4, "points": 1, "totalScore": 37, "totalRuns": 37, "totalDismissals": 2}
  ]'::jsonb
WHERE match_number = 20;

-- Match 21: Dubai Sultans, Hakimi Dynamos, Dhanera Daredevils, Taher Ali
UPDATE matches SET
  state = 'COMPLETED',
  rankings = '[
    {"teamId": "team-6", "rank": 1, "points": 5, "totalScore": 51, "totalRuns": 51, "totalDismissals": 1},
    {"teamId": "team-4", "rank": 2, "points": 3, "totalScore": 50, "totalRuns": 50, "totalDismissals": 1},
    {"teamId": "team-2", "rank": 3, "points": 2, "totalScore": 45, "totalRuns": 45, "totalDismissals": 1},
    {"teamId": "team-18", "rank": 4, "points": 1, "totalScore": 39, "totalRuns": 39, "totalDismissals": 2}
  ]'::jsonb
WHERE match_number = 21;

-- Match 22: MA Stars, Thunder Strikers, Royal Blasters, Parallel Power (Top 4 Showdown!)
UPDATE matches SET
  state = 'COMPLETED',
  rankings = '[
    {"teamId": "team-9", "rank": 1, "points": 5, "totalScore": 56, "totalRuns": 56, "totalDismissals": 0},
    {"teamId": "team-14", "rank": 2, "points": 3, "totalScore": 54, "totalRuns": 54, "totalDismissals": 1},
    {"teamId": "team-20", "rank": 3, "points": 2, "totalScore": 52, "totalRuns": 52, "totalDismissals": 1},
    {"teamId": "team-12", "rank": 4, "points": 1, "totalScore": 51, "totalRuns": 51, "totalDismissals": 1}
  ]'::jsonb
WHERE match_number = 22;

-- Match 23: Dubai Sultans, MUSTABIZ, Dragons, Hakimi Dynamos
UPDATE matches SET
  state = 'COMPLETED',
  rankings = '[
    {"teamId": "team-3", "rank": 1, "points": 5, "totalScore": 50, "totalRuns": 50, "totalDismissals": 1},
    {"teamId": "team-6", "rank": 2, "points": 3, "totalScore": 48, "totalRuns": 48, "totalDismissals": 1},
    {"teamId": "team-1", "rank": 3, "points": 2, "totalScore": 44, "totalRuns": 44, "totalDismissals": 1},
    {"teamId": "team-4", "rank": 4, "points": 1, "totalScore": 41, "totalRuns": 41, "totalDismissals": 2}
  ]'::jsonb
WHERE match_number = 23;

-- Match 24: Hunters, Team Jade Jaguars, Dhanera Daredevils, Dynamic Duo
UPDATE matches SET
  state = 'COMPLETED',
  rankings = '[
    {"teamId": "team-7", "rank": 1, "points": 5, "totalScore": 50, "totalRuns": 50, "totalDismissals": 1},
    {"teamId": "team-5", "rank": 2, "points": 3, "totalScore": 47, "totalRuns": 47, "totalDismissals": 1},
    {"teamId": "team-2", "rank": 3, "points": 2, "totalScore": 43, "totalRuns": 43, "totalDismissals": 1},
    {"teamId": "team-19", "rank": 4, "points": 1, "totalScore": 37, "totalRuns": 37, "totalDismissals": 2}
  ]'::jsonb
WHERE match_number = 24;

-- Match 25: Power Strikers, Khatte Angoor, Sultan Strikers, Nuqum Rock
UPDATE matches SET
  state = 'COMPLETED',
  rankings = '[
    {"teamId": "team-16", "rank": 1, "points": 5, "totalScore": 49, "totalRuns": 49, "totalDismissals": 1},
    {"teamId": "team-13", "rank": 2, "points": 3, "totalScore": 46, "totalRuns": 46, "totalDismissals": 1},
    {"teamId": "team-8", "rank": 3, "points": 2, "totalScore": 42, "totalRuns": 42, "totalDismissals": 1},
    {"teamId": "team-11", "rank": 4, "points": 1, "totalScore": 35, "totalRuns": 35, "totalDismissals": 2}
  ]'::jsonb
WHERE match_number = 25;

-- ================================================================
-- SUCCESS MESSAGE
-- ================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ All 25 league matches completed!';
  RAISE NOTICE '';
  RAISE NOTICE '🏆 Expected Top 4 Teams (Direct to Semi-Finals):';
  RAISE NOTICE '   1. MA Stars (team-9) - 5 wins, 25 points';
  RAISE NOTICE '   2. Royal Blasters (team-14) - 5 wins, 25 points';
  RAISE NOTICE '   3. Parallel Power (team-12) - 5 wins, 25 points';
  RAISE NOTICE '   4. Thunder Strikers (team-20) - 5 wins, 25 points';
  RAISE NOTICE '';
  RAISE NOTICE '⚡ Quarter-Final Qualifiers (Teams 5-12):';
  RAISE NOTICE '   - Hunters (team-7) - 5 wins';
  RAISE NOTICE '   - Dragons (team-3) - 3 wins';
  RAISE NOTICE '   - Hakimi Dynamos (team-6) - 5 wins';
  RAISE NOTICE '   - Nahda Shooters (team-10) - 4 wins';
  RAISE NOTICE '   - Dubai Sultans (team-4) - 3 wins';
  RAISE NOTICE '   - MUSTABIZ (team-1) - 4 wins';
  RAISE NOTICE '   - Dynamic Duo (team-5) - 3 wins';
  RAISE NOTICE '   - Others with 1-3 wins';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Playoff Structure:';
  RAISE NOTICE '   - Top 4: Direct to Semi-Finals';
  RAISE NOTICE '   - Ranks 5-12: Quarter-Finals';
  RAISE NOTICE '   - QF1 (Ranks 5,6,11,12) → Winners to SF2';
  RAISE NOTICE '   - QF2 (Ranks 7,8,9,10) → Winners to SF1';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Next Steps:';
  RAISE NOTICE '   1. Go to Organizer → Playoffs page';
  RAISE NOTICE '   2. View final standings';
  RAISE NOTICE '   3. Click "Generate Quarter-Finals"';
  RAISE NOTICE '   4. Complete QF matches to unlock Semi-Finals';
  RAISE NOTICE '   5. Complete SFs to unlock Grand Final';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 League stage complete! Ready for playoffs!';
END $$;

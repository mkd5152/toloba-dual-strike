"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useMatchStore } from "@/lib/stores/match-store";
import { supabase } from "@/lib/supabase/client";
import { Database, Save } from "lucide-react";

export function ForceSaveButton() {
  const { currentMatch } = useMatchStore();
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const forceSaveToDatabase = async () => {
    if (!currentMatch) {
      alert("No match loaded!");
      return;
    }

    const confirmed = confirm(
      "Force save all balls to database?\n\n" +
      "This will:\n" +
      "1. Fetch over IDs from database\n" +
      "2. Save all balls from browser to database\n" +
      "3. Update innings totals\n\n" +
      "Continue?"
    );

    if (!confirmed) return;

    setSaving(true);
    setResult(null);

    try {
      let totalBallsSaved = 0;
      let totalBallsSkipped = 0;
      const errors: string[] = [];

      console.log("🔄 Starting force save for match:", currentMatch.id);

      // Process each innings
      for (let inningsIdx = 0; inningsIdx < currentMatch.innings.length; inningsIdx++) {
        const innings = currentMatch.innings[inningsIdx];

        console.log(`\n📊 Processing Innings ${inningsIdx + 1} (${innings.id})`);

        // Fetch over IDs from database for this innings
        const { data: dbOvers, error: oversError } = await supabase
          .from("overs")
          .select("id, over_number")
          .eq("innings_id", innings.id)
          .order("over_number");

        if (oversError) {
          errors.push(`Failed to fetch overs for innings ${inningsIdx + 1}: ${oversError.message}`);
          continue;
        }

        if (!dbOvers || dbOvers.length === 0) {
          errors.push(`No overs found in database for innings ${inningsIdx + 1}`);
          continue;
        }

        console.log(`  Found ${dbOvers.length} overs in database`);

        // Process each over
        for (let overIdx = 0; overIdx < innings.overs.length; overIdx++) {
          const localOver = innings.overs[overIdx];
          const dbOver = dbOvers.find(o => o.over_number === localOver.overNumber);

          if (!dbOver) {
            errors.push(`Over ${overIdx} not found in database for innings ${inningsIdx + 1}`);
            continue;
          }

          console.log(`  Over ${overIdx}: ${localOver.balls.length} balls in browser`);

          // Fetch existing balls from database
          const { data: existingBalls } = await supabase
            .from("balls")
            .select("ball_number")
            .eq("over_id", dbOver.id);

          const existingBallNumbers = new Set(existingBalls?.map(b => b.ball_number) || []);

          // Save each ball that doesn't exist in database
          for (const ball of localOver.balls) {
            // Check if ball already exists (by ball number)
            if (existingBallNumbers.has(ball.ballNumber)) {
              console.log(`    Ball ${ball.ballNumber}: Already exists, skipping`);
              totalBallsSkipped++;
              continue;
            }

            // Save ball to database
            const ballData: any = {
              id: crypto.randomUUID(),
              over_id: dbOver.id,
              ball_number: ball.ballNumber,
              runs: ball.runs,
              is_wicket: ball.isWicket,
              wicket_type: ball.wicketType,
              fielding_team_id: ball.fieldingTeamId || null,
              is_noball: ball.isNoball,
              is_wide: ball.isWide,
              is_free_hit: ball.isFreeHit,
              misconduct: ball.misconduct,
              effective_runs: ball.effectiveRuns,
              timestamp: ball.timestamp.toISOString(),
            };

            const { error: ballError } = await supabase
              .from("balls")
              .insert(ballData);

            if (ballError) {
              errors.push(`Failed to save ball ${ball.ballNumber} in over ${overIdx}: ${ballError.message}`);
              console.error(`    Ball ${ball.ballNumber}: FAILED`, ballError);
            } else {
              totalBallsSaved++;
              console.log(`    Ball ${ball.ballNumber}: ✅ SAVED`);
            }
          }
        }

        // Update innings totals in database
        console.log(`  Updating innings totals: ${innings.totalRuns} runs, ${innings.totalWickets} wickets`);
        const { error: inningsError } = await supabase
          .from("innings")
          .update({
            state: innings.state,
            total_runs: innings.totalRuns,
            total_wickets: innings.totalWickets,
            no_wicket_bonus: innings.noWicketBonus,
            final_score: innings.finalScore,
            powerplay_over: innings.powerplayOver,
            reballs_used: innings.reballsUsed || 0,
            reball_bonus_runs: innings.reballBonusRuns || 0,
          } as any)
          .eq("id", innings.id);

        if (inningsError) {
          errors.push(`Failed to update innings ${inningsIdx + 1} totals: ${inningsError.message}`);
        } else {
          console.log(`  ✅ Innings totals updated`);
        }
      }

      // Update match state if completed
      if (currentMatch.state === "COMPLETED") {
        console.log("\n🏁 Updating match state to COMPLETED");
        const { error: matchError } = await supabase
          .from("matches")
          .update({
            state: "COMPLETED",
            rankings: currentMatch.rankings || [],
            locked_at: currentMatch.lockedAt?.toISOString() || new Date().toISOString(),
          } as any)
          .eq("id", currentMatch.id);

        if (matchError) {
          errors.push(`Failed to update match state: ${matchError.message}`);
        } else {
          console.log("✅ Match marked as COMPLETED");
        }
      }

      const resultMsg = `
✅ Force Save Complete!

Balls Saved: ${totalBallsSaved}
Balls Skipped (already in DB): ${totalBallsSkipped}
Errors: ${errors.length}

${errors.length > 0 ? '\n⚠️ Errors:\n' + errors.join('\n') : ''}
      `.trim();

      setResult(resultMsg);
      console.log("\n" + resultMsg);

      alert(resultMsg);

    } catch (err: any) {
      const errorMsg = `❌ Force save failed: ${err.message}`;
      setResult(errorMsg);
      console.error(errorMsg, err);
      alert(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (!currentMatch) return null;

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={forceSaveToDatabase}
        disabled={saving}
        variant="outline"
        size="sm"
        className="border-2 border-orange-500 text-orange-600 hover:bg-orange-50"
      >
        <Database className="w-4 h-4 mr-2" />
        {saving ? "Saving..." : "Force Save to DB"}
      </Button>
      {result && (
        <pre className="text-xs bg-gray-100 p-2 rounded whitespace-pre-wrap">
          {result}
        </pre>
      )}
    </div>
  );
}

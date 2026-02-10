"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Check, AlertCircle, Loader2 } from "lucide-react"
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export default function MigratePage() {
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [steps, setSteps] = useState<string[]>([])

  const addStep = (step: string) => {
    setSteps(prev => [...prev, step])
  }

  const runMigration = async () => {
    setStatus('running')
    setMessage('')
    setSteps([])

    try {
      addStep('Creating Supabase client...')

      // Note: This page requires service role key to work properly
      // For security, you should run the SQL directly in Supabase dashboard
      addStep('⚠️  This page cannot run ALTER TABLE commands')
      addStep('Please run the SQL manually in Supabase Dashboard')

      setStatus('error')
      setMessage('Direct migration not supported in browser. Please use Supabase SQL Editor.')

    } catch (error: any) {
      setStatus('error')
      setMessage(error.message)
      addStep(`❌ Error: ${error.message}`)
    }
  }

  const sqlToRun = `-- Migration 1: Add group and stage columns
-- Add group column to teams
ALTER TABLE teams ADD COLUMN IF NOT EXISTS "group" INTEGER;

-- Add stage column to matches
ALTER TABLE matches ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'LEAGUE';

-- Assign groups to teams
UPDATE teams SET "group" = 1 WHERE id IN ('team-a', 'team-b', 'team-c', 'team-d', 'team-e');
UPDATE teams SET "group" = 2 WHERE id IN ('team-f', 'team-g', 'team-h', 'team-i', 'team-j');
UPDATE teams SET "group" = 3 WHERE id IN ('team-k', 'team-l', 'team-m', 'team-n', 'team-o');
UPDATE teams SET "group" = 4 WHERE id IN ('team-p', 'team-q', 'team-r', 'team-s', 'team-t');

-- Assign stages to matches
UPDATE matches SET stage = 'LEAGUE' WHERE match_number BETWEEN 1 AND 25;
UPDATE matches SET stage = 'SEMI' WHERE match_number IN (26, 27);
UPDATE matches SET stage = 'FINAL' WHERE match_number = 28;

-- Migration 2: Bowling team rotation (IMPORTANT for correct game format)
-- Add bowling_team_id to overs table (each over has its own bowling team)
ALTER TABLE overs ADD COLUMN IF NOT EXISTS bowling_team_id TEXT;

-- Add foreign key constraint
ALTER TABLE overs DROP CONSTRAINT IF EXISTS overs_bowling_team_fkey;
ALTER TABLE overs
ADD CONSTRAINT overs_bowling_team_fkey
FOREIGN KEY (bowling_team_id)
REFERENCES teams(id)
ON DELETE CASCADE;

-- Remove bowling_team_id from innings (no longer needed, each over has its own)
ALTER TABLE innings DROP COLUMN IF EXISTS bowling_team_id;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_overs_bowling_team ON overs(bowling_team_id);`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlToRun)
    setMessage('✅ SQL copied to clipboard!')
    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <div className="min-h-screen tournament-bg-pattern p-4 md:p-8">
      <Card className="max-w-4xl mx-auto border-2 border-[#ff9800]">
        <CardHeader className="bg-gradient-to-r from-[#0d3944] to-[#1a4a57] text-white">
          <CardTitle className="text-2xl font-black">Database Migration: Game Format & Playoffs</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <Alert className="bg-blue-50 border-blue-200">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Migration Required:</strong> This adds:
              <br />1. Group and stage columns for playoff system
              <br />2. Bowling rotation support (each over has its own bowling team)
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[#0d3944]">Instructions:</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Copy the SQL below (click "Copy SQL" button)</li>
              <li>Go to your <a href="https://supabase.com/dashboard" target="_blank" className="text-[#ff9800] underline font-bold">Supabase Dashboard</a></li>
              <li>Click <strong>SQL Editor</strong> in the left sidebar</li>
              <li>Click <strong>+ New Query</strong></li>
              <li>Paste the SQL and click <strong>Run</strong></li>
              <li>Come back and refresh this page</li>
            </ol>
          </div>

          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <pre>{sqlToRun}</pre>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={copyToClipboard}
              className="bg-gradient-to-r from-[#ff9800] to-[#ffb300] text-[#0d3944] font-bold hover:opacity-90"
            >
              📋 Copy SQL
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-2 border-[#ff9800] text-[#ff9800] font-bold"
            >
              <a href="https://supabase.com/dashboard" target="_blank">
                Open Supabase Dashboard →
              </a>
            </Button>
          </div>

          {message && (
            <Alert className={message.includes('❌') ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}>
              <AlertDescription className={message.includes('❌') ? 'text-red-800' : 'text-green-800'}>
                {message}
              </AlertDescription>
            </Alert>
          )}

          {steps.length > 0 && (
            <div className="space-y-2">
              {steps.map((step, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 mt-0.5" />
                  <span className="text-gray-700">{step}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

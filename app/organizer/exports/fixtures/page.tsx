"use client";

import { useEffect } from "react";
import { useTournamentStore } from "@/lib/stores/tournament-store";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import Image from "next/image";

export default function FixturesExportPage() {
  const { matches, teams, loadMatches, loadTeams, tournament } = useTournamentStore();

  useEffect(() => {
    loadMatches();
    loadTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team?.name || "TBD";
  };

  const getTeamShortCode = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return "T?";
    // Get the team number from teams array
    const teamIndex = teams.findIndex(t => t.id === teamId);
    return `T${teamIndex + 1}`;
  };

  const getTeamColor = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team?.color || "#cccccc";
  };

  // Group matches by stage
  const leagueMatches = matches.filter(m => m.stage === "LEAGUE");

  // Group league matches into rounds
  const matchesByRound: { [key: number]: typeof leagueMatches } = {};
  leagueMatches.forEach(match => {
    const round = Math.floor((match.matchNumber - 1) / 5) + 1;
    if (!matchesByRound[round]) {
      matchesByRound[round] = [];
    }
    matchesByRound[round].push(match);
  });

  return (
    <>
      {/* Print button - hidden when printing */}
      <div className="print:hidden fixed top-4 right-4 z-50">
        <Button
          onClick={handlePrint}
          className="bg-[#8B1538] hover:bg-[#6B0F2A] text-white font-bold px-6 py-3 rounded-lg shadow-lg"
        >
          <Printer className="w-5 h-5 mr-2" />
          Print / Save as PDF
        </Button>
      </div>

      {/* Fixtures Document */}
      <div className="w-full min-h-screen flex items-center justify-center bg-gray-100 print:bg-white p-4 print:p-0">
        <div
          id="fixtures-content"
          className="w-[210mm] bg-white shadow-2xl print:shadow-none border-4 border-black"
          style={{ aspectRatio: '1 / 1.414' }}
        >
          {/* Header */}
          <div className="bg-white px-8 py-6 border-b-4 border-black">
            <div className="flex items-start justify-between mb-4">
              {/* Left Logo */}
              <div className="w-40">
                <Image
                  src="/logos/dual-strike-logo.png"
                  alt="Toloba Sports"
                  width={160}
                  height={160}
                  className="object-contain"
                />
              </div>

              {/* Center Title */}
              <div className="flex-1 text-center pt-2">
                <h1 className="text-4xl font-black mb-0" style={{ lineHeight: 1 }}>
                  TOLOBA
                </h1>
                <h2
                  className="text-5xl font-black mb-0"
                  style={{
                    background: 'linear-gradient(135deg, #8B1538 0%, #D4204E 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontStyle: 'italic',
                    lineHeight: 1
                  }}
                >
                  DOUBLE WICKET
                </h2>
                <h1 className="text-4xl font-black mt-0" style={{ lineHeight: 1 }}>
                  TOURNAMENT
                </h1>
              </div>

              <div className="w-40"></div>
            </div>

            {/* Event Details Box */}
            <div className="grid grid-cols-2 border-t-2 border-black pt-3">
              <div>
                <p className="text-xs mb-1">
                  <strong>Date:</strong> Saturday, 8th June 2024
                </p>
                <p className="text-xs mb-1">
                  <strong>Venue:</strong> MSB Private School (Secondary)
                </p>
                <p className="text-xs">
                  <strong>Location Pin:</strong>{" "}
                  <a href="#" className="text-blue-600 underline text-xs">
                    https://bit.ly/TDWT-Location-2024
                  </a>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs mb-1">
                  <strong>Reporting by 4:45 PM</strong>
                </p>
                <p className="text-xs">
                  <strong>Total Event Time:</strong> 7 Hours (5 PM to 11 PM)
                </p>
              </div>
            </div>
          </div>

          {/* Group Stages Table */}
          <div className="px-6 py-4">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border-2 border-black p-2 bg-white text-sm font-bold w-24">
                    TIME
                  </th>
                  <th className="border-2 border-black p-2 bg-white text-sm font-bold w-20">
                    ROUNDS
                  </th>
                  <th className="border-2 border-black p-2 bg-white text-sm font-bold">
                    GROUP 1
                  </th>
                  <th className="border-2 border-black p-2 bg-white text-sm font-bold">
                    GROUP 2
                  </th>
                  <th className="border-2 border-black p-2 bg-white text-sm font-bold w-24">
                    T = TEAMS
                  </th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4].map((round) => {
                  const roundMatches = matchesByRound[round] || [];
                  const group1Matches = roundMatches.filter((_, idx) => idx < 2);
                  const group2Matches = roundMatches.filter((_, idx) => idx >= 2 && idx < 4);

                  return (
                    <tr key={round}>
                      {/* Time Column */}
                      <td className="border-2 border-black p-0">
                        <div className="text-xs text-center font-bold py-1 border-b border-black">
                          5:00 - 5:35
                        </div>
                        <div className="h-6"></div>
                        <div className="text-xs text-center font-bold py-1 border-t border-black">
                          5:40 - 6:15
                        </div>
                      </td>

                      {/* Round Number */}
                      <td className="border-2 border-black p-2">
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <div
                              className="text-4xl font-black"
                              style={{ color: '#8B1538', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                            >
                              Group Stages
                            </div>
                            <div className="text-3xl font-black text-[#8B1538] mt-2">{round}</div>
                          </div>
                        </div>
                      </td>

                      {/* Group 1 */}
                      <td className="border-2 border-black p-2">
                        <div className="space-y-2">
                          <div className="text-center text-xs italic mb-2">GROUP A{round}</div>
                          {group1Matches.map((match, idx) => (
                            <div key={match.id} className="flex gap-1 justify-center">
                              {match.teamIds.slice(0, 4).map((teamId) => (
                                <div
                                  key={teamId}
                                  className="px-3 py-1 text-xs font-bold text-white rounded"
                                  style={{ backgroundColor: getTeamColor(teamId) }}
                                >
                                  {getTeamShortCode(teamId)}
                                </div>
                              ))}
                            </div>
                          ))}
                          {group1Matches.length < 2 && <div className="h-6"></div>}
                          <div className="text-center text-xs italic mt-2">GROUP C{round}</div>
                          <div className="h-6"></div>
                        </div>
                      </td>

                      {/* Group 2 */}
                      <td className="border-2 border-black p-2">
                        <div className="space-y-2">
                          <div className="text-center text-xs italic mb-2">GROUP B{round}</div>
                          {group2Matches.map((match, idx) => (
                            <div key={match.id} className="flex gap-1 justify-center">
                              {match.teamIds.slice(0, 4).map((teamId) => (
                                <div
                                  key={teamId}
                                  className="px-3 py-1 text-xs font-bold text-white rounded"
                                  style={{ backgroundColor: getTeamColor(teamId) }}
                                >
                                  {getTeamShortCode(teamId)}
                                </div>
                              ))}
                            </div>
                          ))}
                          {group2Matches.length < 2 && <div className="h-6"></div>}
                          <div className="text-center text-xs italic mt-2">GROUP D{round}</div>
                          <div className="h-6"></div>
                        </div>
                      </td>

                      {/* Teams Column */}
                      <td className="border-2 border-black p-0">
                        <div className="h-full"></div>
                      </td>
                    </tr>
                  );
                })}

                {/* Finals Row */}
                <tr>
                  <td className="border-2 border-black p-2 text-xs text-center font-bold">
                    10:50 - 11:25
                  </td>
                  <td className="border-2 border-black p-2 text-sm font-bold text-center">
                    FINALS
                  </td>
                  <td colSpan={2} className="border-2 border-black p-2 bg-yellow-400">
                    <p className="text-center font-bold text-sm">1st vs 2nd vs 3rd vs 4th</p>
                  </td>
                  <td className="border-2 border-black p-0"></td>
                </tr>

                {/* Ceremony Row */}
                <tr>
                  <td className="border-2 border-black p-2 text-xs text-center font-bold">
                    11:30-11:45
                  </td>
                  <td className="border-2 border-black p-2 text-sm font-bold text-center">
                    CEREMONY
                  </td>
                  <td colSpan={2} className="border-2 border-black p-2 bg-yellow-400">
                    <p className="text-center font-bold text-sm">AWARDS CEREMONY</p>
                  </td>
                  <td className="border-2 border-black p-0"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="mt-6 px-8 pb-6">
            <div className="space-y-2">
              <div
                className="py-4 px-8 transform -skew-x-12"
                style={{
                  background: 'linear-gradient(135deg, #8B1538 0%, #D4204E 100%)'
                }}
              >
                <p
                  className="text-center text-5xl font-black transform skew-x-12"
                  style={{
                    background: 'linear-gradient(135deg, #1e88e5 0%, #64b5f6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  ARE YOU
                </p>
              </div>
              <div
                className="py-4 px-8 transform -skew-x-12"
                style={{
                  background: 'linear-gradient(135deg, #8B1538 0%, #D4204E 100%)'
                }}
              >
                <p
                  className="text-center text-5xl font-black transform skew-x-12"
                  style={{
                    background: 'linear-gradient(135deg, #1e88e5 0%, #64b5f6 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  READY?
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }

          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          #fixtures-content {
            width: 100%;
            height: 100%;
            box-shadow: none;
          }
        }
      `}</style>
    </>
  );
}

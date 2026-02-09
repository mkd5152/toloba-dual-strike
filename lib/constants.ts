// TDST Season 1 Tournament Configuration
export const TOURNAMENT_INFO = {
  NAME: "TDST – Season 1",
  FULL_NAME: "Toloba Dual Strike Tournament – Season 1",
  ORGANIZER: "Toloba",
  START_DATE: "2026-02-26",
  END_DATE: "2026-03-01",
  START_TIME: "20:30", // 08:30 PM
  VENUE: "TBD",
  YOUTUBE_LINK: "https://youtu.be/mMVo6wet-L0?si=vzLx1Dpw7Cl--jQM",
  REGISTRATION_LINK: "https://forms.gle/hvyjFPtwM96qyJBK7",
  CONTACTS: [
    { name: "Mustafa", phone: "+971 56 736 9803" },
    { name: "Huzefa", phone: "+971 56 355 0605" },
  ],
  TAGLINE: "Two players. One mission. Dual Strike. 👑",
} as const;

export const TOURNAMENT_RULES = {
  TEAMS_PER_MATCH: 4,
  MATCHES_PER_TEAM: 5, // Minimum 5+ matches per team
  MATCHES_TO_CUP: 7, // 7 matches to reach the Cup
  OVERS_PER_INNINGS: 3, // 12 overs total per match (4 teams × 3 overs)
  BALLS_PER_OVER: 6,
  MATCH_DURATION_MINUTES: 35,
} as const;

export const POINTS_SYSTEM = {
  FIRST: 5,
  SECOND: 3,
  THIRD: 1,
  FOURTH: 0,
} as const;

export const SCORING_RULES = {
  NORMAL_WICKET_PENALTY: -5,
  BOWLING_WICKET_BONUS: 5,
  POWERPLAY_WICKET_PENALTY: -10,
  NO_WICKET_BONUS: 10,
  NOBALL_RUNS: 2,
  WIDE_RUNS: 2,
  MISCONDUCT_PENALTY: -5,
  POWERPLAY_MULTIPLIER: 2,
} as const;

export const TEAM_COLORS = [
  "#EF4444",
  "#F59E0B",
  "#10B981",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#F97316",
  "#06B6D4",
  "#84CC16",
  "#6366F1",
  "#A855F7",
  "#D946EF",
  "#F43F5E",
  "#22D3EE",
  "#FCD34D",
  "#34D399",
  "#60A5FA",
  "#C084FC",
  "#F472B6",
];

export const COURTS = ["Court A", "Court B", "Court C", "Court D", "Court E"];

export const UMPIRE_NAMES = [
  "Rajesh Kumar",
  "Amit Shah",
  "Sunil Verma",
  "Vijay Singh",
  "Prakash Reddy",
  "Anil Desai",
  "Ramesh Patel",
  "Mohan Rao",
];

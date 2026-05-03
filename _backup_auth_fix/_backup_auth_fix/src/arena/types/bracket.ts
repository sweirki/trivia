import { TournamentMatch } from "./match";

export interface TournamentBracket {
  qualifiers: TournamentMatch[];
  semifinals: TournamentMatch[];
  final: TournamentMatch | null;
}

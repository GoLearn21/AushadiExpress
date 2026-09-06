# Rally

Recreational tennis matchmaking. The product's whole job is to get two specific people onto a
court this weekend — not to help anyone improve, not to host a social network, and not to sell
court time.

This glossary is the vocabulary for that job. It is deliberately free of implementation detail:
where a term has a technical realisation, that lives in `architecture/` or the ADRs, not here.

## Language

### People and level

**Player**:
Someone who plays matches through Rally. Always an adult; Phase 1 is 18+.
_Avoid_: user, member, customer

**Returner**:
The design-target persona. Played years ago, back after a long gap, does not know their level,
will not message a stranger, and churns permanently after one bad first match. Every default is
set for them.
_Avoid_: beginner, casual player, newbie

**Regular**:
A player who plays weekly and tolerates rough edges. Generates disproportionate match volume.
Never the design target; always a beneficiary.
_Avoid_: power user, grinder, advanced player

**Operator**:
The person running a Cluster by hand — generating offers, resolving disputes, repairing the
market. In Phase 1 this is the founder, and they are a first-class actor in the system, not
support staff outside it.
_Avoid_: admin, moderator, support

**Band**:
A coarse, human-labelled skill tier a player self-selects during onboarding, and the only level
a player ever sees before the model is confident. Five of them, described behaviourally rather
than numerically.
_Avoid_: level, rating tier, NTRP, skill level

**Rating**:
The internal Glicko-2 estimate of a player's strength. A rating has a point value *and* an
uncertainty, and the uncertainty decides whether the point value may be shown at all.
_Avoid_: score, ranking, ELO, skill

**Placement window**:
A player's first three matches, during which results move their Band, the matching band is
inverted to favour easier opponents, and a player is never moved down.
_Avoid_: onboarding matches, calibration, provisional period

**Reliability**:
Whether a player does what they committed to — measured as confirmed-to-played, with late
reschedules counted. Always rendered as a label, never a number, and never coloured as a
warning.
_Avoid_: reputation, trust score, rating (overloaded — see Rating)

### Place and time

**Cluster**:
Two to four named facilities and the players who already play there. **The unit of launch.** A
city is an aggregation of Clusters and is never itself a launch unit.
_Avoid_: market (see below), area, region, metro

**Market**:
The scope within which candidates may be compared. Always a required parameter; there is no
unscoped variant. Usually one Cluster.
_Avoid_: pool, catchment, segment

**Court**:
A specific playable surface at a Facility. Whether it has lights is part of its identity, not a
detail — an unlit court cannot host an evening match.
_Avoid_: venue (that's the Facility), location

**Facility**:
A site holding one or more Courts, with its own access rules and time limits.
_Avoid_: club, venue, park

**Slot**:
A named window a player is willing to play in — "Saturday morning", not a timestamp. Players
declare Slots; the system resolves them to concrete times.
_Avoid_: availability window, time slot, booking

**Availability**:
The set of Slots a player has declared, with a strength: *hard* means could play, *preferred*
means wants to play. The difference is the difference between a match played and a match
no-showed.
_Avoid_: schedule, calendar, free time

### The loop

**Offer**:
A concrete proposal of a person, a time, and a Court, held until a stated deadline. **Not a
search result** — the player never browses candidates.
_Avoid_: match suggestion, recommendation, listing, result

**Reason**:
A short factual statement of why an Offer was made — "both free Saturday mornings", "8 minutes
apart". Offers carry Reasons and never a compatibility percentage.
_Avoid_: score, match quality, compatibility, fit percentage

**The Hold**:
The state a player is in between declaring Availability and receiving their first Offer. Named,
because it is a real state with its own screen, not a gap.
_Avoid_: waiting, pending, queue

**Match**:
An agreed meeting between two players to play. Passes through proposal, commitment, play, and
attestation. A Match that was never played still exists and still has consequences.
_Avoid_: game (that's a unit of tennis scoring), booking, event

**Commitment**:
A player's explicit confirmation that they will show up, taken the evening before. Both a
predictor of showing up and an intervention that causes it.
_Avoid_: RSVP, acceptance, booking

**Attestation**:
One player's account of how a Match ended, normalised to match-absolute sides. Two matching
Attestations are agreement; two differing ones are a Dispute. Both are kept forever, in every
outcome.
_Avoid_: score submission, result entry, report

**Canon version**:
The version of the rules under which an Attestation's fingerprint was computed. Travels with
the fingerprint, because two clients on different app versions must not be mistaken for two
players who disagree.
_Avoid_: schema version, format version

**Dispute**:
Two Attestations for the same Match that genuinely differ. Freezes the result out of rating
computation and opens a human review. A version mismatch is **not** a Dispute.
_Avoid_: conflict, disagreement, error

**Rating period**:
The batch window over which ratings are recomputed. Results inside one are simultaneous, so
arrival order cannot affect the outcome.
_Avoid_: update cycle, recalculation, batch

**Rematch**:
A repeat Match between the same two players. The product's quality signal: if two people play
each other again, the match was good. Unfakeable, and requires no survey.
_Avoid_: repeat booking, re-challenge

**Zero-offer week**:
A week in which a player received no viable Offer. The churn mechanism, and an Operator task
the moment it is detected — never a passive statistic.
_Avoid_: no matches, inactive, dormant

# Product Requirements

## Product Statement

Goliath helps VCs ask natural-language questions about startups and investment
opportunities. It interviews the user, spawns a tailored research team of AI
agents, and presents the final investment opportunity analysis as a narrated
multi-agent presentation.

## Primary Demo Flow

1. User enters a VC research query.
2. Orchestrator asks 5 clarifying questions.
3. User answers the questions.
4. Orchestrator decides how many agents to spawn and what each agent should
   investigate.
5. Frontend animates the subagents appearing.
6. Backend runs multi-agent research using Cala AI and news/startup sources.
7. Frontend shows subagents talking/researching while the backend works.
8. Backend returns final findings, predictions, opportunities, and report
   segments.
9. Final presentation starts.
10. Subagent orbs enter one at a time.
11. Each subagent speaks its report section using ElevenLabs audio.
12. UI shows subtitles and ideally supporting data/images.
13. User lands on or can open a final report list/detail view.

## In Scope

- Natural-language query input.
- 5 orchestrator clarifying questions.
- Dynamic subagent plan returned to frontend.
- Animated agent spawn/research state.
- Multi-agent opportunity discovery.
- Final predictions for investment opportunities.
- Narrated final presentation with subagent voices.
- Subtitles for spoken report segments.
- Report list and report detail/presentation view.

## Out Of Scope For Hackathon

- Real investment execution.
- Full CRM or portfolio management.
- Deep authentication/permissions.
- Long-term production persistence unless trivial.
- Fully general VC research across all geographies/sectors.
- Pixel-art map UI.

## Example Query

```txt
Show me startup opportunities of investment in Barcelona related to AI.
```

## Minimum Successful Demo

- One user query.
- Five clarifying questions.
- Four spawned subagents.
- Research progress animation.
- Three to five final opportunities or findings.
- A narrated final presentation with at least two distinct ElevenLabs voices.
- A report list/detail page where the final output can be reviewed.
- Investment opportunity cards with a clear score.
- Concise, precise predictions for each opportunity.

## ROI / Opportunity Scoring

Goliath should show a score for each investment opportunity. For the hackathon,
use a simple explainable `Goliath Score` from 0 to 100.

The score can combine:

- Market attractiveness.
- Founder/company traction.
- Funding timing.
- Competitive density.
- Strategic fit with the user's stated preferences.
- Risk level.
- Confidence in the available evidence.

The score should be explainable, not mathematically perfect.

## Opportunity Status

Each opportunity should also have a compact state label:

```txt
hot
warming
neutral
cooling
not_hot
```

This supports a subagent specialized in current opportunity heat. The UI can
show these as cards such as "Hot", "Warming", or "Not hot".

## Prediction Style

Predictions should be short and specific, for example:

```txt
Likely to raise a seed extension within 6 months.
Strong Barcelona AI infrastructure opportunity; monitor pricing risk.
Hot category, but current evidence is too thin for a high-confidence lead.
```

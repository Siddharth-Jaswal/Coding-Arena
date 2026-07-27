# Coding Arena

A multiplayer competitive programming platform where players compete against each other by solving coding problems in real time.

## Planned Game Modes

### Random Match
Two players are matched and receive a randomly selected problem.

### Toss Mode
Two players are matched and a toss determines which player gets to select the problem topic. The actual problem is then randomly selected from that topic.

### Challenge Mode
A player can create an open challenge. Another player can accept the challenge and choose the topic from which the battle problem will be selected.

## Database

The prototype will use **PostgreSQL** for persistent application data.

The initial schema consists of five main entities:

| Entity        | Purpose                               |
| ------------- | ------------------------------------- |
| `users`       | User accounts and ratings             |
| `problems`    | Problem statements and metadata       |
| `test_cases`  | Public and private problem test cases |
| `submissions` | User code submissions and verdicts    |
| `matches`     | Multiplayer match history and results |

**Redis** will be used separately for temporary and real-time state such as matchmaking, open challenges, active matches and submission queues.

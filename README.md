# How to Setup

1. Clone the repository to your local machine:
    ```bash
    git clone https://github.com/Shadhujan/Bunona.git
    ```

2. Navigate to the `Bunona` folder:
    ```bash
    cd Bunona
    ```

3. Install the required dependencies using npm:
    ```bash
    npm install
    ```

4. Start the development server:
    ```bash
    npm run dev
    ```

5. Open your browser and navigate to the provided local development URL to access the game:
    ```bash
    http://localhost:5173/
    ```


# CIS-Bunona-Game
A Number Puzzle game using the ‘Banana’ API - https://marcconrad.com/uob/banana/doc.php This assignment asks to reflect on various concepts, paradigms and architectures related to Software Development. Software design principles (low coupling and high cohesion), event-driven programming, interoperability, and virtual identity.

## Principles Used

### Low Coupling and High Cohesion

- **Difficulty Levels (Easy, Medium, Hard) are controlled by a Timer Module:**
    - Changing difficulty only adjusts the timer without affecting other game mechanics like scoring or lives.
- **Separation of Concerns:**
    - Timer, Game Logic, UI, and API Calls are handled by independent modules.
    - This modular approach makes the code easier to maintain and scale.

### Interoperability

- **Leaderboards feature connects the game with an external database/API to fetch and display player scores.**
- **The game communicates with the Banana API to process game data and manage gameplay logic.**

### Event-Driven Programming

- **Daily Streaks System:**
    - Triggered when a player completes a daily challenge (event = challenge completion).
    - Rewards are granted based on the event occurring only once per day.
- **Lives System:**
    - Losing a life is triggered as an event whenever a player answers incorrectly.
- **Timer Events:**
    - Countdown timer triggers game-over events when time runs out.

### Virtual Identity

- **Lives System:**
    - Tracks each player's performance through a limited number of attempts.
- **Achievements:**
    - Earned by completing specific in-game goals (e.g., finishing a level under a certain time).
- **Player Profiles:**
    - Potential for tracking daily streaks, best scores, and other personal stats to build a unique in-game identity.

## Game Link

You can play the game [here](https://cis-bunona-game.netlify.app).

## Features

- Number puzzle game using the Banana API
- Reflects on software development concepts
- Demonstrates software design principles
- Event-driven programming
- Interoperability
- Virtual identity

## How to Play

1. Visit the game link.
2. Follow the on-screen instructions to solve the number puzzle.
3. Use the Banana API to interact with the game.

## Technologies Used

- React
- TypeScript
- PostgreSQL
- Supabase
- HTML
- CSS
- JavaScript
- Banana API

## License

This project is licensed under the MIT License.